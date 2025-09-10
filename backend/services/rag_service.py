import os
import asyncio
from typing import List, Dict, Any
import logging
from datetime import datetime
import time

from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import openai
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.text_splitter = None
        self.openai_client = None
        self.embedding_model = None
        
    async def initialize(self):
        """Initialize the RAG service components"""
        try:
            # Initialize embeddings
            logger.info("Loading embedding model...")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="BAAI/bge-small-en-v1.5",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            # Initialize text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                logger.warning("OPENAI_API_KEY not found, using mock responses")
            else:
                self.openai_client = openai.OpenAI(
                    api_key=openai_api_key
                )
            
            # Try to load existing index
            await self._load_existing_index()
            
            logger.info("RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            raise
    
    async def _load_existing_index(self):
        """Load existing FAISS index if available"""
        try:
            index_path = "data/faiss_index"
            if os.path.exists(index_path):
                logger.info("Loading existing FAISS index...")
                self.vectorstore = FAISS.load_local(
                    index_path, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info("Existing index loaded successfully")
            else:
                logger.info("No existing index found")
        except Exception as e:
            logger.warning(f"Could not load existing index: {e}")
    
    async def ask_question(self, question: str) -> Dict[str, Any]:
        """Process a question using RAG"""
        start_time = time.time()
        
        try:
            if not self.vectorstore:
                # Return mock response if no index is available
                return self._get_mock_response(question)
            
            # Retrieve relevant documents
            docs = self.vectorstore.similarity_search(question, k=5)
            
            if not docs:
                return {
                    "answer": "I couldn't find any relevant information in the current news database. Please try rephrasing your question or check if the index has been built.",
                    "citations": [],
                    "processing_time": time.time() - start_time
                }
            
            # Prepare context
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Generate answer
            answer = await self._generate_answer(question, context)
            
            # Format citations
            citations = []
            for i, doc in enumerate(docs):
                citations.append({
                    "id": str(i + 1),
                    "title": doc.metadata.get("title", "Unknown Title"),
                    "url": doc.metadata.get("url", "#"),
                    "snippet": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "timestamp": doc.metadata.get("published", datetime.now().isoformat()),
                    "source": doc.metadata.get("source", "RSS Feed")
                })
            
            return {
                "answer": answer,
                "citations": citations,
                "processing_time": time.time() - start_time
            }
            
        except Exception as e:
            logger.error(f"Error processing question: {e}")
            return self._get_mock_response(question)
    
    async def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using OpenAI GPT"""
        try:
            if not self.openai_client:
                return self._generate_mock_answer(question, context)
            
            prompt = f"""Based on the following news articles, provide a comprehensive and accurate answer to the question. Use specific information from the sources and maintain a professional news tone.

Question: {question}

News Context:
{context}

Instructions:
- Provide a detailed, factual answer based on the context
- Include specific details, dates, and figures when available
- Maintain objectivity and cite information appropriately
- If the context doesn't fully answer the question, acknowledge the limitations

Answer:"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional news analyst providing accurate, well-sourced answers based on current news articles."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating answer with OpenAI: {e}")
            return self._generate_mock_answer(question, context)
    
    def _generate_mock_answer(self, question: str, context: str) -> str:
        """Generate a mock answer when API is not available"""
        return f"Based on the available news sources, here's what I found regarding '{question}': {context[:300]}... [This is a mock response - configure OPENAI_API_KEY for OpenAI GPT integration]"
    
    def _get_mock_response(self, question: str) -> Dict[str, Any]:
        """Return mock response when no index is available"""
        return {
            "answer": f"I understand you're asking about '{question}'. However, the news database hasn't been built yet. Please use the 'Rebuild Index' feature in the Sources page to process the latest news articles first.",
            "citations": [
                {
                    "id": "1",
                    "title": "Sample News Article",
                    "url": "#",
                    "snippet": "This is a sample citation. Build the index to see real news sources.",
                    "timestamp": datetime.now().isoformat(),
                    "source": "Mock Source"
                }
            ],
            "processing_time": 0.1
        }
    
    async def rebuild_index(self, articles: List[Dict]) -> Dict[str, int]:
        """Rebuild the FAISS index with new articles"""
        try:
            logger.info(f"Rebuilding index with {len(articles)} articles...")
            
            # Process articles into documents
            documents = []
            for article in articles:
                # Split article content into chunks
                chunks = self.text_splitter.split_text(article.get("content", ""))
                
                for chunk in chunks:
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            "title": article.get("title", ""),
                            "url": article.get("url", ""),
                            "published": article.get("published", ""),
                            "source": article.get("source", "RSS Feed")
                        }
                    )
                    documents.append(doc)
            
            if not documents:
                raise ValueError("No documents to process")
            
            # Create new FAISS index
            logger.info(f"Creating FAISS index with {len(documents)} chunks...")
            self.vectorstore = FAISS.from_documents(documents, self.embeddings)
            
            # Save the index
            os.makedirs("data", exist_ok=True)
            self.vectorstore.save_local("data/faiss_index")
            
            logger.info("Index rebuilt and saved successfully")
            
            return {
                "articles": len(articles),
                "chunks": len(documents)
            }
            
        except Exception as e:
            logger.error(f"Error rebuilding index: {e}")
            raise

# RAG News Assistant

A Retrieval-Augmented Generation (RAG) application that answers news questions using real-time RSS feeds, FAISS vector search, and OpenAI GPT models.

## Project Structure

\`\`\`
project-root/
├── frontend/          # Next.js React application
│   ├── app/
│   ├── components/
│   └── package.json
└── backend/           # Python FastAPI backend
    ├── main.py
    ├── requirements.txt
    ├── services/
    └── models/
\`\`\`

## Features

- **Real-time News Processing**: Fetches and processes RSS feeds from major news sources
- **Vector Search**: Uses FAISS for efficient similarity search across news articles
- **AI-Powered Answers**: Generates comprehensive answers using OpenAI GPT models
- **Citation System**: Provides source citations for all answers
- **Beautiful UI**: Modern React interface with red/black theme and dark/light mode
- **Admin Controls**: Index rebuilding and source management

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
\`\`\`bash
cd backend
\`\`\`

2. **Install Python dependencies:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. **Configure environment variables:**
\`\`\`bash
cp .env.example .env
# Edit .env and add your OpenAI API key
\`\`\`

4. **Run the backend:**
\`\`\`bash
chmod +x run.sh
./run.sh
\`\`\`

Or manually:
\`\`\`bash
python main.py
\`\`\`

### Frontend Setup

1. **Navigate to frontend directory:**
\`\`\`bash
cd frontend
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

3. **Run the development server:**
\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

### Backend (.env)
\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

## API Endpoints

- `GET /health` - Health check
- `POST /ask` - Ask a question about news
- `GET /ingest/sources` - Get RSS sources
- `POST /ingest/rebuild` - Rebuild vector index
- `GET /ingest/rebuild/status` - Check rebuild progress

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Go to Sources page and click "Rebuild Index" to process news articles
4. Ask questions about current news on the main page
5. View your question history and adjust settings as needed

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, LangChain, FAISS, OpenAI GPT
- **Embeddings**: Hugging Face BGE-small-en-v1.5
- **Data**: RSS feeds from major news sources

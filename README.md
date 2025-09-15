### RAG News Assistant ️

A sophisticated real-time news question-answering system powered by Retrieval-Augmented Generation (RAG) architecture. Get intelligent, contextual answers about current events with source attribution and semantic search capabilities.

### RAG News Assistant ️

A sophisticated real-time news question-answering system powered by Retrieval-Augmented Generation (RAG) architecture. Get intelligent, contextual answers about current events with source attribution and semantic search capabilities.

(https://nextjs.org/)
(https://fastapi.tiangolo.com/)
(https://python.org/)
(https://typescriptlang.org/)
(LICENSE)

## Features

- **Intelligent Question Answering**: Ask natural language questions about current news events
- **Real-time News Ingestion**: Automated RSS feed aggregation from multiple trusted sources
- **Semantic Search**: Advanced vector-based retrieval using FAISS and sentence transformers
- **Source Attribution**: Every answer includes clickable source references
- **Responsive Design**: Mobile-first interface with offline fallback capabilities
- **Fast Performance**: Sub-200ms query processing with optimized vector indexing
- **Multi-source Support**: Aggregates from Reuters, BBC, CNN, and other major news outlets


## ️ Architecture

```plaintext
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│   (Next.js)     │◄──►│   (FastAPI)      │◄──►│   APIs          │
│                 │    │                  │    │                 │
│ • React UI      │    │ • RAG Pipeline   │    │ • RSS Feeds     │
│ • TypeScript    │    │ • Vector Search  │    │ • OpenAI API    │
│ • Tailwind CSS  │    │ • Embeddings     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Vector Store   │
                       │     (FAISS)      │
                       │                  │
                       │ • News Articles  │
                       │ • Embeddings     │
                       │ • Metadata       │
                       └──────────────────┘
```

## ️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library


### Backend

- **FastAPI** - High-performance Python web framework
- **Python 3.9+** - Core backend language
- **Sentence Transformers** - Text embedding generation
- **FAISS** - Efficient vector similarity search
- **Feedparser** - RSS feed processing
- **Pydantic** - Data validation and serialization


### AI/ML

- **BAAI/bge-small-en-v1.5** - Embedding model for semantic search
- **OpenAI GPT** - Large language model for response generation
- **RAG Architecture** - Retrieval-augmented generation pattern


## Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key


### Frontend Setup

```shellscript
# Clone the repository
git clone https://github.com/yourusername/rag-news-assistant.git
cd rag-news-assistant

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" >> .env.local

# Start development server
npm run dev
```

### Backend Setup

```shellscript
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env

# Start the server
uvicorn main:app --reload --port 8000
```

## Usage

1. **Start the Backend**: Ensure the FastAPI server is running on `http://localhost:8000`
2. **Launch Frontend**: Access the web interface at `http://localhost:3000`
3. **Ask Questions**: Type natural language questions about current news
4. **View Sources**: Click on source links to read full articles


### Example Queries

- "What are the latest developments in AI technology?"
- "What's happening with climate change policies?"
- "Recent updates on global economic trends?"


## API Documentation

### Endpoints

#### `POST /ask`

Submit a question and get an AI-generated answer with sources.

**Request Body:**

```json
{
  "question": "What are the latest developments in renewable energy?"
}
```

**Response:**

```json
{
  "answer": "Recent developments in renewable energy include...",
  "sources": [
    {
      "title": "Solar Energy Breakthrough",
      "url": "https://example.com/article",
      "published_date": "2024-01-15T10:30:00Z",
      "source": "Reuters"
    }
  ],
  "query_time": 0.15
}
```

#### `GET /sources`

Retrieve available news sources and their status.

#### `GET /health`

Health check endpoint for monitoring.

## ️ Configuration

### Environment Variables

**Frontend (.env.local):**

```plaintext
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Backend (.env):**

```plaintext
OPENAI_API_KEY=your_openai_api_key_here
RSS_REFRESH_INTERVAL=900  # 15 minutes
MAX_ARTICLES_PER_SOURCE=100
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
```

### News Sources

Configure RSS feeds in `backend/config/sources.json`:

```json
{
  "sources": [
    {
      "name": "Reuters",
      "url": "https://feeds.reuters.com/reuters/topNews",
      "category": "general"
    }
  ]
}
```

## Development

### Running Tests

```shellscript
# Frontend tests
npm test

# Backend tests
cd backend
pytest
```

### Code Quality

```shellscript
# Frontend linting
npm run lint

# Backend formatting
black . && isort .
```

## Deployment

### Frontend (Netlify/Vercel)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set environment variables in deployment settings


### Backend (Railway/Heroku)

1. Create new service from GitHub repository
2. Set Python buildpack
3. Configure environment variables
4. Deploy from main branch


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Sentence Transformers](https://www.sbert.net/) for embedding models
- [FAISS](https://faiss.ai/) for efficient vector search
- [OpenAI](https://openai.com/) for language model capabilities
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components


## Support

If you have any questions or run into issues, please [open an issue](https://github.com/yourusername/rag-news-assistant/issues) on GitHub.

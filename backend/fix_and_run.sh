#!/bin/bash

echo "Fixing dependencies and restarting backend..."

# Remove existing virtual environment
rm -rf venv

# Create new virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install compatible versions
pip install sentence-transformers==2.7.0
pip install huggingface_hub==0.20.3

# Install remaining dependencies
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please add your OPENAI_API_KEY"
fi

echo "Starting RAG News Assistant API..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

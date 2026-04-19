import sys
import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document  # Needed to wrap OCR text

# Adjusting path for modular imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from config.settings import Settings, BASE_DIR
from src.engine.parser import perform_vision_ocr  # Import our Vision tool

def create_bidder_vector_store(bidder_dir: str, collection_name: str):
    """
    Chunks bidder PDFs AND Scanned Images, then initializes a ChromaDB collection.
    """
    print(f"📦 Indexing documents in: {bidder_dir}")
    
    # 1. Initialize Embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model=Settings.EMBEDDING_MODEL,
        google_api_key=Settings.GOOGLE_API_KEY
    )
    
    documents = []
    bidder_path = Path(bidder_dir)
    
    # 2. Process PDFs (Digital Files)
    for pdf_file in bidder_path.glob("*.pdf"):
        loader = PyPDFLoader(str(pdf_file))
        documents.extend(loader.load())
        print(f"📄 Loaded PDF: {pdf_file.name}")
        
    # 3. Process Images (Scanned Files for Bidder C)
    # We look for common image formats
    image_extensions = ["*.jpeg", "*.jpg", "*.png"]
    for ext in image_extensions:
        for img_file in bidder_path.glob(ext):
            print(f"👁️  Performing Vision OCR on: {img_file.name}...")
            
            # Use Gemini Vision to 'read' the image
            ocr_text = perform_vision_ocr(str(img_file))
            
            # Wrap the string text into a LangChain Document so it can be chunked
            documents.append(Document(
                page_content=ocr_text, 
                metadata={"source": img_file.name}
            ))

    if not documents:
        print(f"⚠️ Warning: No valid documents (PDF or Images) found in {bidder_dir}")
        return None

    # 4. Split into chunks (Works for both PDF text and OCR text)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(documents)
    
    # 5. Create/Persist the Vector Store
    persist_path = str(BASE_DIR / "data" / "chroma_db")
    
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=persist_path
    )
    
    print(f"✅ Vector store created for '{collection_name}' at {persist_path}")
    return vector_db

def get_relevant_documents(vector_db, query: str, k: int = 3):
    """
    Performs a similarity search to find evidence for a specific rule.
    """
    if not vector_db:
        return []
    return vector_db.similarity_search(query, k=k)
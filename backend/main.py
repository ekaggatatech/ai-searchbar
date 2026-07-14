import json
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables, get_connection
from sidebar import insert_sidebar
from history import save_search, get_history
from suggestion import get_suggestions
from search import search_documents
from semantic_search import semantic_search
from models import SearchRequest


app = FastAPI(
    title="AI Enterprise Search API"
)


# --------------------------------------------------
# File paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "metadata.json"
)


# --------------------------------------------------
# Initial setup
# --------------------------------------------------

create_tables()
insert_sidebar()


def load_documents():
    """
    Load all documents safely from metadata.json.
    """

    try:
        with open(
            METADATA_PATH,
            "r",
            encoding="utf-8"
        ) as file:
            data = json.load(file)

        if isinstance(data, list):
            return data

        if (
            isinstance(data, dict)
            and isinstance(
                data.get("documents"),
                list
            )
        ):
            return data["documents"]

        print(
            "metadata.json must contain "
            "a list of documents."
        )

        return []

    except FileNotFoundError:
        print(
            f"metadata.json not found at: "
            f"{METADATA_PATH}"
        )

        return []

    except json.JSONDecodeError as error:
        print(
            "Invalid metadata.json:",
            error
        )

        return []


DOCUMENTS = load_documents()


# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def get_document_id(document):
    """
    Support doc_id, docId and id formats.
    """

    if not isinstance(document, dict):
        return None

    return (
        document.get("doc_id")
        or document.get("docId")
        or document.get("id")
    )


def get_document_department(document):
    """
    Support department and category fields.
    """

    if not isinstance(document, dict):
        return ""

    return str(
        document.get("department")
        or document.get("category")
        or ""
    ).strip()


def normalize_document(document):
    """
    Return a consistent document format
    for the React frontend.
    """

    normalized = dict(document)

    document_id = get_document_id(document)

    if document_id is not None:
        normalized["doc_id"] = str(
            document_id
        )

    if not normalized.get("department"):
        normalized["department"] = (
            get_document_department(document)
            or "Other"
        )

    return normalized


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": (
            "AI Enterprise Search "
            "Backend Running correctly"
        ),
        "documents_loaded": len(DOCUMENTS),
    }


# --------------------------------------------------
# Sidebar
# --------------------------------------------------

@app.get("/sidebar")
def sidebar():
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM sidebar"
        )

        rows = cursor.fetchall()

        return [
            dict(row)
            for row in rows
        ]

    finally:
        conn.close()


# --------------------------------------------------
# Suggestions
# --------------------------------------------------

@app.get("/suggestions")
def suggestions(query: str):
    return get_suggestions(query)


# --------------------------------------------------
# Search history
# --------------------------------------------------

@app.post("/history")
def add_history(search: SearchRequest):
    clean_query = search.query.strip()

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    save_search(clean_query)

    return {
        "message": (
            "Search saved successfully"
        )
    }


@app.get("/history")
def history():
    return {
        "recent_searches": get_history()
    }


@app.delete("/history")
def delete_history_by_query(query: str):
    clean_query = query.strip()

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM search_history
            WHERE query = ?
            """,
            (clean_query,),
        )

        conn.commit()

        return {
            "message": (
                "Deleted successfully"
            )
        }

    finally:
        conn.close()


@app.delete("/history/{history_id}")
def delete_history(history_id: int):
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM search_history
            WHERE id = ?
            """,
            (history_id,),
        )

        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail=(
                    "History item not found"
                ),
            )

        return {
            "message": (
                "Deleted successfully"
            )
        }

    finally:
        conn.close()


# --------------------------------------------------
# Keyword search
# --------------------------------------------------

@app.post("/search")
def search(search: SearchRequest):
    clean_query = search.query.strip()

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    print(
        "Search Query:",
        clean_query
    )

    save_search(clean_query)

    results = search_documents(
        clean_query
    )

    normalized_results = [
        normalize_document(document)
        for document in results
    ]

    return {
        "query": clean_query,
        "total_results": len(
            normalized_results
        ),
        "results": normalized_results,
    }


# --------------------------------------------------
# AI semantic search
# --------------------------------------------------

@app.post("/ai-search")
def ai_search(search: SearchRequest):
    clean_query = search.query.strip()

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    save_search(clean_query)

    results = semantic_search(
        clean_query,
        search.top_k,
    )

    normalized_results = [
        normalize_document(document)
        for document in results
    ]

    return {
        "query": clean_query,
        "total_results": len(
            normalized_results
        ),
        "results": normalized_results,
    }


# --------------------------------------------------
# Dynamic document page
# --------------------------------------------------

@app.get("/document/{doc_id}")
def get_document(doc_id: str):
    requested_id = str(
        doc_id
    ).strip().lower()

    for document in DOCUMENTS:
        current_id = get_document_id(
            document
        )

        if current_id is None:
            continue

        if (
            str(current_id)
            .strip()
            .lower()
            == requested_id
        ):
            return normalize_document(
                document
            )

    raise HTTPException(
        status_code=404,
        detail="Document not found",
    )


# --------------------------------------------------
# Dynamic category page
# --------------------------------------------------

@app.get("/category/{category}")
def get_category(category: str):
    requested_category = (
        str(category)
        .strip()
        .lower()
        .replace("-", " ")
    )

    results = []

    for document in DOCUMENTS:
        department = (
            get_document_department(
                document
            )
            .lower()
            .replace("-", " ")
        )

        if department == requested_category:
            results.append(
                normalize_document(
                    document
                )
            )

    return results
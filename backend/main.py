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
    title="AI Enterprise Search API",
    version="1.0.0",
)


# --------------------------------------------------
# File paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "metadata.json",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------
# Development environment mein React kisi bhi
# localhost port par run ho sakta hai.
#
# allow_origins=["*"] ke saath
# allow_credentials=False hona chahiye.
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Initial database setup
# --------------------------------------------------

create_tables()
insert_sidebar()


# --------------------------------------------------
# Load metadata documents
# --------------------------------------------------

def load_documents():
    """
    Load documents from metadata.json.

    Supported formats:

    1. Direct list:
       [
           {...},
           {...}
       ]

    2. Object containing documents:
       {
           "documents": [
               {...},
               {...}
           ]
       }
    """

    try:
        with open(
            METADATA_PATH,
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        if isinstance(data, list):
            print(
                f"{len(data)} documents loaded "
                "from metadata.json"
            )
            return data

        if (
            isinstance(data, dict)
            and isinstance(
                data.get("documents"),
                list,
            )
        ):
            documents = data["documents"]

            print(
                f"{len(documents)} documents loaded "
                "from metadata.json"
            )

            return documents

        print(
            "metadata.json must contain either "
            "a list or a documents list."
        )

        return []

    except FileNotFoundError:
        print(
            "metadata.json not found at:",
            METADATA_PATH,
        )
        return []

    except json.JSONDecodeError as error:
        print(
            "metadata.json contains invalid JSON:",
            error,
        )
        return []

    except Exception as error:
        print(
            "Unexpected metadata loading error:",
            error,
        )
        return []


DOCUMENTS = load_documents()


# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def get_document_id(document):
    """
    Support id, doc_id and docId.
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
    Return a consistent document structure
    for the React frontend.
    """

    if not isinstance(document, dict):
        return {}

    normalized = dict(document)

    document_id = get_document_id(document)

    if document_id is not None:
        normalized["id"] = str(document_id)
        normalized["doc_id"] = str(document_id)

    department = get_document_department(document)

    normalized["department"] = (
        department or "Other"
    )

    if not normalized.get("title"):
        normalized["title"] = "Untitled Document"

    if not normalized.get("description"):
        normalized["description"] = (
            "No description is available."
        )

    if not isinstance(
        normalized.get("keywords"),
        list,
    ):
        keywords = normalized.get("keywords")

        if isinstance(keywords, str):
            normalized["keywords"] = [
                keyword.strip()
                for keyword in keywords.split(",")
                if keyword.strip()
            ]
        else:
            normalized["keywords"] = []

    return normalized


# --------------------------------------------------
# Root health check
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "success": True,
        "message": (
            "AI Enterprise Search "
            "Backend Running correctly"
        ),
        "documents_loaded": len(DOCUMENTS),
        "metadata_path": METADATA_PATH,
    }


# --------------------------------------------------
# Backend health endpoint
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
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

    except Exception as error:
        print(
            "Sidebar load error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load sidebar",
        )

    finally:
        conn.close()


# --------------------------------------------------
# Suggestions
# --------------------------------------------------

@app.get("/suggestions")
def suggestions(query: str = ""):
    clean_query = query.strip()

    if not clean_query:
        return []

    try:
        results = get_suggestions(
            clean_query
        )

        if not isinstance(results, list):
            return []

        return results

    except Exception as error:
        print(
            "Suggestion error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load suggestions"
            ),
        )


# --------------------------------------------------
# Search history
# --------------------------------------------------

@app.post("/history")
def add_history(search: SearchRequest):
    clean_query = search.query.strip()

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail=(
                "Search query cannot be empty"
            ),
        )

    try:
        save_search(clean_query)

        return {
            "success": True,
            "message": (
                "Search saved successfully"
            ),
        }

    except Exception as error:
        print(
            "Save history error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save search history"
            ),
        )


@app.get("/history")
def history():
    try:
        recent_searches = get_history()

        if not isinstance(
            recent_searches,
            list,
        ):
            recent_searches = []

        return {
            "recent_searches": (
                recent_searches
            )
        }

    except Exception as error:
        print(
            "History load error:",
            error,
        )

        return {
            "recent_searches": []
        }


@app.delete("/history")
def delete_history_by_query(
    query: str,
):
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
            "success": True,
            "message": (
                "Search deleted successfully"
            ),
        }

    except Exception as error:
        print(
            "Delete history error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete history"
            ),
        )

    finally:
        conn.close()


@app.delete("/history/{history_id}")
def delete_history(
    history_id: int,
):
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
            "success": True,
            "message": (
                "Search deleted successfully"
            ),
        }

    finally:
        conn.close()


# --------------------------------------------------
# Keyword search
# --------------------------------------------------

@app.post("/search")
def search(search_request: SearchRequest):
    clean_query = (
        search_request.query.strip()
    )

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail=(
                "Search query cannot be empty"
            ),
        )

    try:
        save_search(clean_query)

        results = search_documents(
            clean_query
        )

        if not isinstance(results, list):
            results = []

        normalized_results = [
            normalize_document(document)
            for document in results
            if isinstance(document, dict)
        ]

        return {
            "query": clean_query,
            "total_results": len(
                normalized_results
            ),
            "results": normalized_results,
        }

    except Exception as error:
        print(
            "Keyword search error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Keyword search failed",
        )


# --------------------------------------------------
# AI semantic search
# --------------------------------------------------

@app.post("/ai-search")
def ai_search(
    search_request: SearchRequest,
):
    clean_query = (
        search_request.query.strip()
    )

    if not clean_query:
        raise HTTPException(
            status_code=400,
            detail=(
                "Search query cannot be empty"
            ),
        )

    try:
        save_search(clean_query)

        results = semantic_search(
            clean_query,
            search_request.top_k,
        )

        if not isinstance(results, list):
            results = []

        normalized_results = [
            normalize_document(document)
            for document in results
            if isinstance(document, dict)
        ]

        return {
            "query": clean_query,
            "total_results": len(
                normalized_results
            ),
            "results": normalized_results,
        }

    except Exception as error:
        print(
            "AI semantic search error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"AI search failed: {str(error)}"
            ),
        )


# --------------------------------------------------
# Dynamic document page
# --------------------------------------------------

@app.get("/document/{doc_id}")
def get_document(doc_id: str):
    requested_id = (
        str(doc_id)
        .strip()
        .lower()
    )

    if not requested_id:
        raise HTTPException(
            status_code=400,
            detail="Document ID is required",
        )

    latest_documents = load_documents()

    for document in latest_documents:
        current_id = get_document_id(
            document
        )

        if current_id is None:
            continue

        current_id = (
            str(current_id)
            .strip()
            .lower()
        )

        if current_id == requested_id:
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
        .replace("_", " ")
    )

    if not requested_category:
        raise HTTPException(
            status_code=400,
            detail="Category is required",
        )

    latest_documents = load_documents()

    results = []

    for document in latest_documents:
        department = (
            get_document_department(
                document
            )
            .lower()
            .replace("-", " ")
            .replace("_", " ")
        )

        if department == requested_category:
            results.append(
                normalize_document(document)
            )

    return results
# --------------------------------------------------
# All documents for dynamic dashboard
# --------------------------------------------------

@app.get("/documents")
def get_all_documents():
    """
    Return latest documents from metadata.json.

    File har request par dobara load hoti hai,
    isliye metadata.json ke changes backend
    restart kiye bina bhi frontend par aa sakte hain.
    """

    latest_documents = load_documents()

    normalized_documents = [
        normalize_document(document)
        for document in latest_documents
        if isinstance(document, dict)
    ]

    return {
        "total_documents": len(
            normalized_documents
        ),
        "documents": normalized_documents,
    }
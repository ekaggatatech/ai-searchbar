import json
import os


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
METADATA_PATH = os.path.join(BASE_DIR, "metadata.json")


SIDEBAR_ITEMS = [
    {
        "name": "Dashboard",
        "route": "/",
        "keywords": ["dashboard", "home", "overview", "main"],
        "children": [
            {"title": "Overview", "route": "/"}
        ],
    },
    {
        "name": "AI Search",
        "route": "/search",
        "keywords": ["ai", "search", "semantic", "document", "find"],
        "children": [
            {"title": "Semantic Search", "route": "/search"}
        ],
    },
    {
        "name": "HR",
        "route": "/category/hr",
        "keywords": ["hr", "human", "employee", "leave", "attendance", "holiday", "recruitment", "joining", "work", "policy"],
        "children": [],
    },
    {
        "name": "Finance",
        "route": "/category/finance",
        "keywords": ["finance", "income", "salary", "payslip", "pay", "tax", "budget", "money", "payment", "expense", "reimbursement", "invoice", "account"],
        "children": [],
    },
    {
        "name": "IT",
        "route": "/category/it",
        "keywords": ["it", "computer", "software", "hardware", "password", "network", "vpn", "security", "system", "email", "login", "laptop"],
        "children": [],
    },
    {
        "name": "History",
        "route": "/history",
        "keywords": ["history", "recent", "previous", "past", "search"],
        "children": [
            {"title": "Recent Searches", "route": "/history"}
        ],
    },
    {
        "name": "Favorites",
        "route": "/favorites",
        "keywords": ["favorites", "saved", "bookmark", "important"],
        "children": [
            {"title": "Saved Documents", "route": "/favorites"}
        ],
    },
    {
        "name": "Settings",
        "route": "/settings",
        "keywords": ["settings", "setting", "profile", "account", "notification", "preferences", "privacy", "policy"],
        "children": [
            {"title": "Profile Settings", "route": "/settings"},
            {"title": "Notification Settings", "route": "/settings"},
            {"title": "Account Settings", "route": "/settings"},
        ],
    },
]


def load_documents():
    with open(METADATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_tokens(text):
    return text.lower().strip().split()


def matches_text(query, text):
    query = query.lower().strip()
    text = text.lower()

    if query in text:
        return True

    query_tokens = get_tokens(query)

    return any(token in text for token in query_tokens)


def matches_sidebar(query, item):
    searchable_text = " ".join([
        item["name"],
        " ".join(item.get("keywords", [])),
        " ".join(child.get("title", "") for child in item.get("children", [])),
    ])

    return matches_text(query, searchable_text)


def matches_document(query, doc):
    searchable_text = " ".join([
        str(doc.get("title", "")),
        str(doc.get("description", "")),
        str(doc.get("department", "")),
        " ".join(doc.get("keywords", [])) if isinstance(doc.get("keywords", []), list) else str(doc.get("keywords", "")),
    ])

    return matches_text(query, searchable_text)


def get_suggestions(query: str):
    query = query.lower().strip()

    if not query:
        return []

    documents = load_documents()
    suggestions = []

    for item in SIDEBAR_ITEMS:
        name = item["name"]
        sidebar_matched = matches_sidebar(query, item)

        children = []

        for child in item.get("children", []):
            if sidebar_matched or matches_text(query, child.get("title", "")):
                children.append(child)

        for doc in documents:
            department = doc.get("department", "").lower()

            if department == name.lower():
                if sidebar_matched or matches_document(query, doc):
                    children.append({
                        "title": doc.get("title"),
                        "doc_id": doc.get("doc_id")
                    })

        if sidebar_matched or len(children) > 0:
            suggestions.append({
                "name": item["name"],
                "route": item["route"],
                "children": children[:5]
            })

    return suggestions[:8]
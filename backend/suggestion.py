from semantic_search import semantic_search


# Application pages that are not stored inside FAISS/metadata.json
APP_PAGES = [
    {
        "name": "Dashboard",
        "route": "/",
        "keywords": [
            "dashboard",
            "home",
            "main page",
            "overview",
        ],
    },
    {
        "name": "AI Search",
        "route": "/search",
        "keywords": [
            "ai search",
            "search",
            "semantic search",
            "find document",
        ],
    },
    {
        "name": "History",
        "route": "/history",
        "keywords": [
            "history",
            "search history",
            "recent search",
            "recent searches",
            "previous search",
            "past search",
            "old search",
            "what i searched",
        ],
    },
    {
        "name": "Favorites",
        "route": "/favorites",
        "keywords": [
            "favorite",
            "favorites",
            "favourite",
            "favourites",
            "saved document",
            "saved documents",
            "bookmarked document",
            "bookmarks",
            "liked document",
        ],
    },
    {
        "name": "Settings",
        "route": "/settings",
        "keywords": [
            "settings",
            "setting",
            "preferences",
            "configuration",
            "account settings",
        ],
    },
]


def get_document_id(document):
    """
    Return document ID while supporting different possible ID field names.
    """
    return (
        document.get("doc_id")
        or document.get("docId")
        or document.get("id")
    )


def normalize_text(value):
    """
    Convert text into a lowercase normalized string.
    """
    return " ".join(str(value).lower().strip().split())


def calculate_page_score(query, page):
    """
    Calculate relevance score for application pages such as
    History, Favorites and Settings.

    Higher score means a better match.
    """
    normalized_query = normalize_text(query)
    page_name = normalize_text(page["name"])

    if not normalized_query:
        return 0

    # Exact page-name match
    if normalized_query == page_name:
        return 100

    # Query contains complete page name
    if page_name in normalized_query:
        return 90

    # Page name contains query
    if normalized_query in page_name:
        return 80

    query_words = set(normalized_query.split())
    best_score = 0

    for keyword in page.get("keywords", []):
        normalized_keyword = normalize_text(keyword)

        if normalized_query == normalized_keyword:
            best_score = max(best_score, 95)
            continue

        if normalized_keyword in normalized_query:
            best_score = max(best_score, 85)
            continue

        if normalized_query in normalized_keyword:
            best_score = max(best_score, 75)
            continue

        keyword_words = set(normalized_keyword.split())
        common_words = query_words.intersection(keyword_words)

        if common_words:
            overlap_score = int(
                (len(common_words) / len(keyword_words)) * 60
            )
            best_score = max(best_score, overlap_score)

    return best_score


def get_application_page_suggestions(query):
    """
    Return matching application pages that are not stored in FAISS.

    Response structure is kept compatible with the existing frontend.
    """
    matched_pages = []

    for page in APP_PAGES:
        score = calculate_page_score(query, page)

        if score <= 0:
            continue

        matched_pages.append({
            "name": page["name"],
            "route": page["route"],
            "children": [],
            "score": score,
            "type": "page",
        })

    matched_pages.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return matched_pages


def get_semantic_document_suggestions(query):
    """
    Search metadata documents using FAISS semantic search and
    group the results department-wise.
    """
    semantic_results = semantic_search(
        query,
        top_k=8,
    )

    grouped_results = {}

    for document in semantic_results:
        department = str(
            document.get("department", "Other")
        ).strip()

        if not department:
            department = "Other"

        department_key = normalize_text(department).replace(" ", "-")

        if department_key not in grouped_results:
            grouped_results[department_key] = {
                "name": department,
                "route": f"/category/{department_key}",
                "children": [],
                "type": "category",
                "best_distance": float("inf"),
            }

        document_id = get_document_id(document)

        # Do not show documents without a valid ID
        if not document_id:
            continue

        document_id = str(document_id)

        already_exists = any(
            str(child.get("doc_id")) == document_id
            for child in grouped_results[
                department_key
            ]["children"]
        )

        if already_exists:
            continue

        distance = document.get("distance")

        try:
            numeric_distance = float(distance)
        except (TypeError, ValueError):
            numeric_distance = float("inf")

        grouped_results[department_key]["best_distance"] = min(
            grouped_results[department_key]["best_distance"],
            numeric_distance,
        )

        grouped_results[department_key]["children"].append({
            "title": document.get(
                "title",
                "Untitled Document",
            ),
            "doc_id": document_id,
            "description": document.get(
                "description",
                "",
            ),
            "distance": distance,
            "route": f"/document/{document_id}",
            "type": "document",
        })

    suggestions = []

    sorted_groups = sorted(
        grouped_results.values(),
        key=lambda group: group["best_distance"],
    )

    for group in sorted_groups:
        if not group["children"]:
            continue

        # Rank documents inside each department by FAISS distance
        group["children"].sort(
            key=lambda child: (
                float(child["distance"])
                if child.get("distance") is not None
                else float("inf")
            )
        )

        group.pop("best_distance", None)
        suggestions.append(group)

    return suggestions


def get_suggestions(query: str):
    """
    Return both:

    1. Application navigation suggestions
       such as History and Favorites.

    2. FAISS semantic document suggestions.

    The existing frontend response format remains unchanged.
    """
    clean_query = normalize_text(query)

    if len(clean_query) < 2:
        return []

    try:
        page_suggestions = get_application_page_suggestions(
            clean_query
        )

        semantic_suggestions = get_semantic_document_suggestions(
            clean_query
        )

        # Application page matches appear first when strongly relevant.
        strong_page_matches = [
            page
            for page in page_suggestions
            if page["score"] >= 60
        ]

        for page in strong_page_matches:
            page.pop("score", None)

        return strong_page_matches + semantic_suggestions

    except Exception as error:
        print(
            f"Semantic suggestion error: "
            f"{type(error).__name__}: {error}"
        )

        # Even if FAISS fails, navigation pages should still work.
        fallback_pages = get_application_page_suggestions(
            clean_query
        )

        for page in fallback_pages:
            page.pop("score", None)

        return fallback_pages
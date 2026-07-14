import json

import faiss
import numpy as np

from embedding import get_embedding


INDEX_PATH = "faiss_index/company.index"
DOCUMENTS_PATH = "faiss_index/documents.json"


INDEX = faiss.read_index(INDEX_PATH)

with open(DOCUMENTS_PATH, "r", encoding="utf-8") as file:
    DOCUMENTS = json.load(file)


def semantic_search(query: str, top_k: int = 5):
    clean_query = query.strip()

    if not clean_query:
        return []

    if not DOCUMENTS:
        return []

    safe_top_k = min(top_k, len(DOCUMENTS))

    query_vector = get_embedding(clean_query)

    query_vector = np.array(
        [query_vector],
        dtype="float32"
    )

    distances, indices = INDEX.search(
        query_vector,
        safe_top_k
    )

    results = []

    for distance, index in zip(
        distances[0],
        indices[0]
    ):
        if index == -1:
            continue

        if index < 0 or index >= len(DOCUMENTS):
            continue

        document = DOCUMENTS[index].copy()

        document["distance"] = float(distance)

        results.append(document)

    return results
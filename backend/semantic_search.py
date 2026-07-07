import json
import faiss
import numpy as np

from embedding import get_embedding

INDEX = faiss.read_index("faiss_index/company.index")

with open("faiss_index/documents.json", "r") as file:

    DOCUMENTS = json.load(file)


def semantic_search(query, top_k=5):

    vector = get_embedding(query)

    vector = np.array([vector]).astype("float32")

    distances, indices = INDEX.search(vector, top_k)

    results = []

    for i, idx in enumerate(indices[0]):

        document = DOCUMENTS[idx]

        document["distance"] = float(distances[0][i])

        results.append(document)

    return results
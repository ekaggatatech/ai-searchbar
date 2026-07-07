from pathlib import Path
import json
import faiss
import numpy as np

from embedding import get_embedding

BASE_DIR = Path(__file__).parent

METADATA_FILE = BASE_DIR / "metadata.json"

INDEX_FILE = BASE_DIR / "faiss_index" / "company.index"

DOCS_FILE = BASE_DIR / "faiss_index" / "documents.json"


def build_index():

    with open(METADATA_FILE, "r", encoding="utf-8") as file:
        documents = json.load(file)

    vectors = []

    for doc in documents:

        text = (
            doc["title"] + " "
            + doc["description"] + " "
            + " ".join(doc["keywords"])
        )

        vector = get_embedding(text)

        vectors.append(vector)

    vectors = np.array(vectors).astype("float32")

    dimension = vectors.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(vectors)

    faiss.write_index(index, str(INDEX_FILE))

    with open(DOCS_FILE, "w", encoding="utf-8") as file:
        json.dump(documents, file, indent=4)

    print("FAISS Index Created Successfully")


if __name__ == "__main__":
    build_index()
import json

from history import save_search

METADATA_FILE = "metadata.json"


def load_metadata():

    with open(METADATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def search_documents(query):

    save_search(query)

    documents = load_metadata()

    results = []

    query = query.lower()

    for doc in documents:

        score = 0

        if query in doc["title"].lower():
            score += 5

        if query in doc["description"].lower():
            score += 3

        if query in doc["department"].lower():
            score += 2

        for keyword in doc["keywords"]:

            if query in keyword.lower():
                score += 1

        if score > 0:

            doc["score"] = score

            results.append(doc)

    results.sort(key=lambda x: x["score"], reverse=True)

    return results
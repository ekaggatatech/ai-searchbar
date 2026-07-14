import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCategoryDocuments =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response = await api.get(
            `/category/${encodeURIComponent(
              categoryName
            )}`
          );

          const categoryDocuments =
            Array.isArray(response.data)
              ? response.data
              : Array.isArray(
                  response.data?.documents
                )
              ? response.data.documents
              : [];

          setDocuments(
            categoryDocuments
          );
        } catch (error) {
          console.error(
            "Category load error:",
            error
          );

          setDocuments([]);
          setError(
            "Unable to load category documents."
          );
        } finally {
          setLoading(false);
        }
      };

    if (categoryName) {
      loadCategoryDocuments();
    }
  }, [categoryName]);

  const getDocumentId = (document) => {
    return (
      document?.doc_id ||
      document?.docId ||
      document?.id ||
      null
    );
  };

  const handleDocumentClick = (
    document
  ) => {
    const documentId =
      getDocumentId(document);

    if (!documentId) {
      console.error(
        "Document ID missing:",
        document
      );

      alert(
        "Document ID is missing. Please check metadata.json."
      );

      return;
    }

    navigate(
      `/document/${encodeURIComponent(
        String(documentId)
      )}`
    );
  };

  const handleCardKeyDown = (
    event,
    document
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleDocumentClick(document);
    }
  };

  const formatCategoryName = (
    value
  ) => {
    return String(value || "")
      .replace(/-/g, " ")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="category-page">
        <h2>
          Loading category...
        </h2>
      </div>
    );
  }

  return (
    <div className="category-page">
      <h1>
        {formatCategoryName(
          categoryName
        )}
      </h1>

      {error && (
        <p>{error}</p>
      )}

      {!error &&
        documents.length === 0 && (
          <p>
            No documents found in this
            category.
          </p>
        )}

      <div className="category-grid">
        {documents.map(
          (document, index) => {
            const documentId =
              getDocumentId(
                document
              );

            return (
              <div
                className="category-card"
                key={
                  documentId ||
                  `${categoryName}-${index}`
                }
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleDocumentClick(
                    document
                  )
                }
                onKeyDown={(event) =>
                  handleCardKeyDown(
                    event,
                    document
                  )
                }
              >
                <h3>
                  {document.title ||
                    "Untitled Document"}
                </h3>

                <p>
                  {document.description ||
                    "Open this document page."}
                </p>

                <span>
                  {document.department ||
                    categoryName}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
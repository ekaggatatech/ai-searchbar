import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../api/api";
import "./DocumentPage.css";

export default function DocumentPage() {
  const { docId } = useParams();

  const [document, setDocument] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDocument = async () => {
      if (!docId) {
        setError("Document ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setDocument(null);

        const response = await api.get(
          `/document/${encodeURIComponent(docId)}`
        );

        const documentData =
          response.data?.document ||
          response.data;

        if (
          !documentData ||
          documentData?.detail ===
            "Document not found"
        ) {
          setError("Document not found");
          return;
        }

        setDocument(documentData);
      } catch (error) {
        console.error(
          "Document load error:",
          error
        );

        if (
          error.response?.status === 404
        ) {
          setError("Document not found");
        } else {
          setError(
            "Unable to load document"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [docId]);

  const getDocumentId = () => {
    return (
      document?.doc_id ||
      document?.docId ||
      document?.id ||
      docId
    );
  };

  const getDepartment = () => {
    return (
      document?.department ||
      document?.category ||
      "Document"
    );
  };

  const getKeywords = () => {
    if (
      Array.isArray(document?.keywords)
    ) {
      return document.keywords;
    }

    if (
      typeof document?.keywords ===
      "string"
    ) {
      return document.keywords
        .split(",")
        .map((keyword) =>
          keyword.trim()
        )
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div className="doc-page">
        <h2>
          Loading document...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doc-page">
        <div className="doc-card">
          <h1>{error}</h1>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="doc-page">
        <div className="doc-card">
          <h1>
            Document not found
          </h1>
        </div>
      </div>
    );
  }

  const title =
    document.title ||
    "Document";

  const description =
    document.description ||
    "This is your document page.";

  const keywords =
    getKeywords();

  return (
    <div className="doc-page">
      <div className="doc-card">
        <h1>
          This is your {title} page.
        </h1>

        <span className="doc-badge">
          {getDepartment()}
        </span>

        <h2>{title}</h2>

        <p className="doc-desc">
          {description}
        </p>

        <div className="doc-section">
          <h3>Document ID</h3>

          <p>{getDocumentId()}</p>
        </div>

        {keywords.length > 0 && (
          <div className="doc-section">
            <h3>Keywords</h3>

            <div className="keyword-list">
              {keywords.map(
                (keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
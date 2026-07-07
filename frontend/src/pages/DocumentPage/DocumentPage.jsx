import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import "./DocumentPage.css";

export default function DocumentPage() {
  const { docId } = useParams();
  const [document, setDocument] = useState(null);

  useEffect(() => {
    loadDocument();
  }, [docId]);

  const loadDocument = async () => {
    try {
      const res = await api.get(`/document/${docId}`);
      setDocument(res.data);
    } catch (error) {
      console.log("Document load error", error);
    }
  };

  if (!document) {
    return <div className="doc-page">Loading document...</div>;
  }

  return (
    <div className="doc-page">
      <div className="doc-card">
        <span className="doc-badge">{document.department}</span>

        <h1>{document.title}</h1>

        <p className="doc-desc">{document.description}</p>

        <div className="doc-section">
          <h3>Document ID</h3>
          <p>{document.doc_id}</p>
        </div>

        <div className="doc-section">
          <h3>Keywords</h3>
          <div className="keyword-list">
            {(document.keywords || []).map((keyword, index) => (
              <span key={index}>{keyword}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
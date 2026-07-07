import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadCategory();
  }, [categoryName]);

  const loadCategory = async () => {
    try {
      const res = await api.get(`/category/${categoryName}`);
      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="category-page">

      <h1>{categoryName.toUpperCase()}</h1>

      <div className="category-grid">

        {documents.map((doc) => (

          <div
            className="category-card"
            key={doc.doc_id}
            onClick={() => navigate(`/document/${doc.doc_id}`)}
          >
            <h3>{doc.title}</h3>

            <p>{doc.description}</p>

            <span>{doc.department}</span>

          </div>

        ))}

      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/history");

      console.log("History response:", res.data);

      setHistory(res.data.recent_searches || []);
    } catch (err) {
      console.error("History error:", err);
      setHistory([]);
    }
  };

  return (
    <div>
      <h2>Search History</h2>

      {history.length === 0 ? (
        <p>No recent searches found.</p>
      ) : (
        history.map((item, index) => (
          <div key={index}>
            🔍 {item}
          </div>
        ))
      )}
    </div>
  );
}
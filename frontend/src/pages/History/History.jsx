import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../../api/api";

import "./History.css";

export default function History() {

    const [history, setHistory] = useState([]);

    useEffect(() => {

        loadHistory();

    }, []);

    const loadHistory = async () => {

        try {

            const res = await api.get("/history");

            setHistory(res.data);

        } catch (err) {

            console.log(err);

        }

    };

    const deleteHistory = async (id) => {

        try {

            await api.delete(`/history/${id}`);

            loadHistory();

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="history-page">

            <h1>Recent Searches</h1>

            {history.map((item) => (

                <div className="history-card" key={item.id}>

                    <span>{item.query}</span>

                    <button onClick={() => deleteHistory(item.id)}>

                        <DeleteIcon />

                    </button>

                </div>

            ))}

        </div>

    );

}
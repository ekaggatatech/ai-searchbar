import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import api from "../../api/api";
import "./SearchBar.css";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 0) {
                fetchSuggestions(query);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const loadRecentSearches = async () => {
        try {
            const res = await api.get("/history");
            setRecentSearches(res.data.recent_searches || []);
        } catch (error) {
            console.log("Recent searches load error", error);
            setRecentSearches([]);
        }
    };

    const fetchSuggestions = async (text) => {
        try {
            const res = await api.get(
                `/suggestions?query=${encodeURIComponent(text)}`
            );
            setSuggestions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.log("Suggestion error", error);
        }
    };

    const removeDuplicateResults = (items) => {
        const seen = new Set();

        return items.filter((item) => {
            const key = item.route || item.doc_id || item.id || item.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const handleSearch = async (searchText = query) => {
        const finalQuery = searchText.trim();
        if (!finalQuery) return;

        try {
            await api.post("/history", { query: finalQuery });

            const suggestionRes = await api.get(
                `/suggestions?query=${encodeURIComponent(finalQuery)}`
            );

            const sidebarResults = [];

            if (Array.isArray(suggestionRes.data)) {
                suggestionRes.data.forEach((item) => {
                    sidebarResults.push({
                        id: item.route,
                        title: item.name,
                        description: `Open ${item.name} page`,
                        department: "Page",
                        route: item.route,
                        result_type: "page",
                    });

                    if (item.children && item.children.length > 0) {
                        item.children.forEach((child) => {
                            sidebarResults.push({
                                id: child.doc_id,
                                doc_id: child.doc_id,
                                title: child.title,
                                description: "Related document",
                                department: item.name,
                                result_type: "document",
                            });
                        });
                    }
                });
            }

            const res = await api.post("/ai-search", {
                query: finalQuery,
                top_k: 10,
            });

            const aiResults = res.data.results || [];

            const finalResults = removeDuplicateResults([
                ...sidebarResults,
                ...aiResults,
            ]);

            setResults(finalResults);
            setSuggestions([]);
            setQuery(finalQuery);

            await loadRecentSearches();
        } catch (error) {
            console.log("Search error", error);
        }
    };

    const handleRecentClick = async (item) => {
        await handleSearch(item);
    };

    const deleteRecentSearch = async (queryText) => {
        try {
            await api.delete(`/history?query=${encodeURIComponent(queryText)}`);
            await loadRecentSearches();
        } catch (error) {
            console.log("Delete history error", error);
        }
    };

    const handleParentClick = (item) => {
        setSuggestions([]);
        setQuery(item.name);
    };

    const handleChildClick = (child) => {
        setSuggestions([]);
        setQuery(child.title);
        handleSearch(child.title);
    };

    const handleResultClick = (item) => {
        console.log("Clicked result:", item);
    };

    return (
        <div className="search-wrapper">
            <div className="search-title">
                <h1>AI Powered Enterprise Search</h1>
                <p>Find HR, Finance, IT, Admin and company documents instantly</p>
            </div>

            <div className="search-box">
                <SearchIcon className="search-icon" />

                <input
                    type="text"
                    placeholder="Search leave policy, payslip, IT security..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />

                {query && (
                    <button
                        className="clear-btn"
                        onClick={() => {
                            setQuery("");
                            setSuggestions([]);
                            setResults([]);
                        }}
                    >
                        <CloseIcon />
                    </button>
                )}

                <button className="search-btn" onClick={() => handleSearch()}>
                    Search
                </button>
            </div>

            {suggestions.length > 0 && (
                <div className="suggestion-box">
                    {suggestions.map((item, index) => (
                        <div className="suggestion-group" key={index}>
                            <div
                                className="suggestion-item parent-suggestion"
                                onClick={() => handleParentClick(item)}
                            >
                                <SearchIcon />
                                <span>{item.name}</span>
                                <small>Page</small>
                            </div>

                            {item.children && item.children.length > 0 && (
                                <div className="child-suggestions">
                                    {item.children.map((child, childIndex) => (
                                        <div
                                            className="suggestion-item child-suggestion"
                                            key={childIndex}
                                            onClick={() => handleChildClick(child)}
                                        >
                                            <span>↳ {child.title}</span>
                                            <small>Document</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {recentSearches.length > 0 && (
                <div className="recent-box">
                    <h3>Recent Searches</h3>

                    <div className="recent-list">
                        {recentSearches.map((item, index) => (
                            <div className="recent-chip" key={index}>
                                <span
                                    className="recent-text"
                                    onClick={() => handleRecentClick(item)}
                                >
                                    {item}
                                </span>

                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRecentSearch(item);
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="results-grid">
                {results.map((item) => (
                    <div
                        className="result-card"
                        key={item.route || item.doc_id || item.id}
                        onClick={() => handleResultClick(item)}
                    >
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <span>{item.department}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
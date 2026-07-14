import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import api from "../../api/api";
import "./SearchBar.css";

export default function SearchBar() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [results, setResults] = useState([]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanQuery = query.trim();

            if (cleanQuery.length >= 2) {
                fetchSuggestions(cleanQuery);
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const loadRecentSearches = async () => {
        try {
            const response = await api.get("/history");

            const historyData = Array.isArray(
                response.data?.recent_searches
            )
                ? response.data.recent_searches
                : Array.isArray(response.data)
                ? response.data
                : [];

            setRecentSearches(historyData);
        } catch (error) {
            console.error(
                "Recent searches load error:",
                error
            );

            setRecentSearches([]);
        }
    };

    const fetchSuggestions = async (text) => {
        try {
            const response = await api.get(
                `/suggestions?query=${encodeURIComponent(text)}`
            );

            setSuggestions(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Suggestion load error:",
                error
            );

            setSuggestions([]);
        }
    };

    const createCategoryRoute = (categoryName) => {
        const normalizedCategory = String(
            categoryName || ""
        )
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");

        if (!normalizedCategory) {
            return null;
        }

        return `/category/${normalizedCategory}`;
    };

    const getDocumentId = (item) => {
        if (!item) {
            return null;
        }

        return (
            item.doc_id ||
            item.docId ||
            (
                item.result_type !== "page" &&
                item.type !== "page" &&
                item.id &&
                !String(item.id).startsWith("/")
                    ? item.id
                    : null
            )
        );
    };

    const createDocumentRoute = (item) => {
        const documentId = getDocumentId(item);

        if (!documentId) {
            return null;
        }

        return `/document/${encodeURIComponent(
            String(documentId)
        )}`;
    };

    const navigateToItem = (item) => {
        if (!item) {
            return;
        }

        setSuggestions([]);

        /*
         * Priority 1:
         * Backend se direct route mila ho.
         *
         * Examples:
         * /history
         * /favorites
         * /settings
         * /category/hr
         * /document/DOC003
         */
        if (
            typeof item.route === "string" &&
            item.route.trim().startsWith("/")
        ) {
            navigate(item.route.trim());
            return;
        }

        /*
         * Priority 2:
         * Document ID available ho.
         */
        const documentRoute = createDocumentRoute(item);

        if (documentRoute) {
            navigate(documentRoute);
            return;
        }

        /*
         * Priority 3:
         * Category result ho.
         */
        if (
            item.result_type === "category" ||
            item.type === "category"
        ) {
            const categoryRoute = createCategoryRoute(
                item.name ||
                item.title ||
                item.department
            );

            if (categoryRoute) {
                navigate(categoryRoute);
                return;
            }
        }

        /*
         * Priority 4:
         * Parent suggestion ke name se category route.
         */
        if (
            item.name &&
            Array.isArray(item.children)
        ) {
            const categoryRoute = createCategoryRoute(
                item.name
            );

            if (categoryRoute) {
                navigate(categoryRoute);
                return;
            }
        }

        /*
         * Priority 5:
         * Department fallback.
         */
        if (
            item.department &&
            item.department !== "Page" &&
            item.department !== "Category"
        ) {
            const categoryRoute = createCategoryRoute(
                item.department
            );

            if (categoryRoute) {
                navigate(categoryRoute);
                return;
            }
        }

        console.error(
            "Navigation route could not be created:",
            item
        );
    };

    const removeDuplicateResults = (items) => {
        const seen = new Set();

        return items.filter((item) => {
            const documentId = getDocumentId(item);

            const key =
                item.route ||
                documentId ||
                `${item.title}-${item.department}`;

            if (!key || seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    };

    const convertSuggestionsToResults = (
        suggestionItems
    ) => {
        const convertedResults = [];

        suggestionItems.forEach((item) => {
            const parentType =
                item.type === "category"
                    ? "category"
                    : "page";

            let parentRoute = item.route;

            if (!parentRoute && item.name) {
                parentRoute = createCategoryRoute(
                    item.name
                );
            }

            if (item.name) {
                convertedResults.push({
                    id:
                        parentRoute ||
                        item.name,
                    title: item.name,
                    description:
                        item.description ||
                        `Open ${item.name} page`,
                    department:
                        parentType === "category"
                            ? "Category"
                            : "Page",
                    route: parentRoute,
                    result_type: parentType,
                    type: parentType,
                    name: item.name,
                });
            }

            if (Array.isArray(item.children)) {
                item.children.forEach((child) => {
                    const documentId =
                        getDocumentId(child);

                    if (!documentId) {
                        return;
                    }

                    convertedResults.push({
                        ...child,
                        id: documentId,
                        doc_id: documentId,
                        title:
                            child.title ||
                            "Untitled Document",
                        description:
                            child.description ||
                            "Open this document",
                        department:
                            item.name ||
                            child.department ||
                            "Document",
                        route:
                            child.route ||
                            createDocumentRoute(child),
                        result_type: "document",
                        type: "document",
                    });
                });
            }
        });

        return convertedResults;
    };

    const normalizeAIResults = (responseData) => {
        const rawResults = Array.isArray(
            responseData?.results
        )
            ? responseData.results
            : Array.isArray(responseData)
            ? responseData
            : [];

        return rawResults.map((item) => {
            const documentId = getDocumentId(item);

            return {
                ...item,
                id:
                    documentId ||
                    item.id,
                doc_id:
                    documentId ||
                    item.doc_id,
                title:
                    item.title ||
                    "Untitled Document",
                description:
                    item.description ||
                    "Open this document",
                department:
                    item.department ||
                    item.category ||
                    "Document",
                route:
                    item.route ||
                    (
                        documentId
                            ? `/document/${encodeURIComponent(
                                  String(documentId)
                              )}`
                            : null
                    ),
                result_type:
                    documentId
                        ? "document"
                        : item.result_type,
                type:
                    documentId
                        ? "document"
                        : item.type,
            };
        });
    };

    const handleSearch = async (
        searchText = query
    ) => {
        const finalQuery =
            typeof searchText === "string"
                ? searchText.trim()
                : "";

        if (!finalQuery) {
            return;
        }

        try {
            await api.post("/history", {
                query: finalQuery,
            });

            const [
                suggestionResponse,
                searchResponse,
            ] = await Promise.all([
                api.get(
                    `/suggestions?query=${encodeURIComponent(
                        finalQuery
                    )}`
                ),

                api.post("/ai-search", {
                    query: finalQuery,
                    top_k: 10,
                }),
            ]);

            const suggestionData = Array.isArray(
                suggestionResponse.data
            )
                ? suggestionResponse.data
                : [];

            const suggestionResults =
                convertSuggestionsToResults(
                    suggestionData
                );

            const semanticResults =
                normalizeAIResults(
                    searchResponse.data
                );

            const finalResults =
                removeDuplicateResults([
                    ...suggestionResults,
                    ...semanticResults,
                ]);

            console.log(
                "Final clickable results:",
                finalResults
            );

            setResults(finalResults);
            setSuggestions([]);
            setQuery(finalQuery);

            await loadRecentSearches();
        } catch (error) {
            console.error(
                "Search error:",
                error
            );
        }
    };

    const handleParentClick = (item) => {
        setQuery(item.name || "");
        navigateToItem(item);
    };

    const handleChildClick = (child) => {
        setQuery(child.title || "");
        navigateToItem(child);
    };

    const handleResultClick = (item) => {
        console.log(
            "Clicked search result:",
            item
        );

        navigateToItem(item);
    };

    const handleRecentClick = async (item) => {
        const recentQuery =
            typeof item === "string"
                ? item
                : item?.query ||
                  item?.title ||
                  "";

        if (!recentQuery) {
            return;
        }

        await handleSearch(recentQuery);
    };

    const deleteRecentSearch = async (item) => {
        const queryText =
            typeof item === "string"
                ? item
                : item?.query ||
                  item?.title ||
                  "";

        if (!queryText) {
            return;
        }

        try {
            await api.delete(
                `/history?query=${encodeURIComponent(
                    queryText
                )}`
            );

            await loadRecentSearches();
        } catch (error) {
            console.error(
                "Delete history error:",
                error
            );
        }
    };

    const clearSearch = () => {
        setQuery("");
        setSuggestions([]);
        setResults([]);
    };

    return (
        <div className="search-wrapper">
            <div className="search-title">
                <h1>
                    AI Powered Enterprise Search
                </h1>

                <p>
                    Find HR, Finance, IT, Admin and
                    company documents instantly
                </p>
            </div>

            <div className="search-box">
                <SearchIcon className="search-icon" />

                <input
                    type="text"
                    placeholder="Search leave policy, payslip, IT security..."
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handleSearch();
                        }
                    }}
                />

                {query && (
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={clearSearch}
                    >
                        <CloseIcon />
                    </button>
                )}

                <button
                    type="button"
                    className="search-btn"
                    onClick={() => handleSearch()}
                >
                    Search
                </button>
            </div>

            {suggestions.length > 0 && (
                <div className="suggestion-box">
                    {suggestions.map(
                        (item, index) => (
                            <div
                                className="suggestion-group"
                                key={
                                    item.route ||
                                    item.name ||
                                    index
                                }
                            >
                                <div
                                    className="suggestion-item parent-suggestion"
                                    role="button"
                                    tabIndex={0}
                                    onMouseDown={(event) => {
                                        event.preventDefault();

                                        handleParentClick(item);
                                    }}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key ===
                                                "Enter" ||
                                            event.key === " "
                                        ) {
                                            event.preventDefault();

                                            handleParentClick(item);
                                        }
                                    }}
                                >
                                    <SearchIcon />

                                    <span>
                                        {item.name}
                                    </span>

                                    <small>
                                        {item.type ===
                                        "category"
                                            ? "Category"
                                            : "Page"}
                                    </small>
                                </div>

                                {Array.isArray(
                                    item.children
                                ) &&
                                    item.children.length >
                                        0 && (
                                        <div className="child-suggestions">
                                            {item.children.map(
                                                (
                                                    child,
                                                    childIndex
                                                ) => (
                                                    <div
                                                        className="suggestion-item child-suggestion"
                                                        key={
                                                            child.doc_id ||
                                                            child.id ||
                                                            childIndex
                                                        }
                                                        role="button"
                                                        tabIndex={0}
                                                        onMouseDown={(
                                                            event
                                                        ) => {
                                                            event.preventDefault();

                                                            handleChildClick(
                                                                child
                                                            );
                                                        }}
                                                        onKeyDown={(
                                                            event
                                                        ) => {
                                                            if (
                                                                event.key ===
                                                                    "Enter" ||
                                                                event.key ===
                                                                    " "
                                                            ) {
                                                                event.preventDefault();

                                                                handleChildClick(
                                                                    child
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <span>
                                                            ↳{" "}
                                                            {
                                                                child.title
                                                            }
                                                        </span>

                                                        <small>
                                                            Document
                                                        </small>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        )
                    )}
                </div>
            )}

            {recentSearches.length > 0 && (
                <div className="recent-box">
                    <h3>Recent Searches</h3>

                    <div className="recent-list">
                        {recentSearches.map(
                            (item, index) => {
                                const recentText =
                                    typeof item ===
                                    "string"
                                        ? item
                                        : item?.query ||
                                          item?.title ||
                                          "";

                                return (
                                    <div
                                        className="recent-chip"
                                        key={`${recentText}-${index}`}
                                    >
                                        <span
                                            className="recent-text"
                                            onClick={() =>
                                                handleRecentClick(
                                                    item
                                                )
                                            }
                                        >
                                            {recentText}
                                        </span>

                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={(
                                                event
                                            ) => {
                                                event.stopPropagation();

                                                deleteRecentSearch(
                                                    item
                                                );
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            )}

            <div className="results-grid">
                {results.map((item, index) => (
                    <div
                        className="result-card"
                        key={
                            item.route ||
                            item.doc_id ||
                            item.id ||
                            `${item.title}-${index}`
                        }
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                            handleResultClick(item)
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key === "Enter" ||
                                event.key === " "
                            ) {
                                event.preventDefault();

                                handleResultClick(item);
                            }
                        }}
                    >
                        <h3>{item.title}</h3>

                        <p>{item.description}</p>

                        <span>
                            {item.department}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
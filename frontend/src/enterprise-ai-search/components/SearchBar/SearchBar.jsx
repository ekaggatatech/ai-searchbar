import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import api from "../../../api/api";
import "./SearchBar.css";

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage =
    location.pathname === "/search";

  const [query, setQuery] = useState("");

  const [suggestions, setSuggestions] =
    useState([]);

  /*
   * Dropdown open ya close hai.
   *
   * Search empty hai:
   * Recent Searches show hongi.
   *
   * Search mein text hai:
   * Suggestions show hongi.
   */
  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const [recentSearches, setRecentSearches] =
    useState([]);

  const [results, setResults] = useState([]);

  const [isSearching, setIsSearching] =
    useState(false);

  /*
   * Purani suggestion API request ko dropdown
   * dobara open karne se rokta hai.
   */
  const suggestionsEnabledRef = useRef(false);

  /*
   * Search component ka outer container.
   *
   * Iska use outside click detect karne ke liye hoga.
   */
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  /*
   * Page change hone par dropdown,
   * suggestions aur recent searches hide hongi.
   */
  useEffect(() => {
    suggestionsEnabledRef.current = false;

    setIsDropdownOpen(false);
    setSuggestions([]);
  }, [location.pathname]);

  /*
   * Search component ke bahar click karne par
   * dropdown close hoga.
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(
          event.target
        )
      ) {
        closeDropdown();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * User type karna stop karega to 300ms baad
   * backend se suggestions load hongi.
   */
  useEffect(() => {
    const cleanQuery = query.trim();

    /*
     * Empty query par Recent Searches dikhengi.
     * Suggestions fetch nahi hongi.
     */
    if (!isDropdownOpen || cleanQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(cleanQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, isDropdownOpen]);

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

      setRecentSearches(
        historyData.slice(0, 5)
      );
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
        `/suggestions?query=${encodeURIComponent(
          text
        )}`
      );

      /*
       * User suggestion select kar chuka hai ya
       * dropdown close ho chuka hai to old API
       * response ignore hoga.
       */
      if (!suggestionsEnabledRef.current) {
        return;
      }

      const suggestionData = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setSuggestions(suggestionData);
    } catch (error) {
      console.error(
        "Suggestion load error:",
        error
      );

      if (suggestionsEnabledRef.current) {
        setSuggestions([]);
      }
    }
  };

  const saveRecentSearch = async (
    searchText
  ) => {
    const cleanText =
      typeof searchText === "string"
        ? searchText.trim()
        : "";

    if (!cleanText) {
      return;
    }

    try {
      await api.post("/history", {
        query: cleanText,
      });

      await loadRecentSearches();
    } catch (error) {
      console.error(
        "Recent search save error:",
        error
      );
    }
  };

  /*
   * Suggestions aur Recent Searches
   * dono close karega.
   */
  const closeDropdown = () => {
    suggestionsEnabledRef.current = false;

    setIsDropdownOpen(false);
    setSuggestions([]);
  };

  /*
   * Search bar click/focus:
   *
   * Empty query:
   * Recent Searches show hongi.
   *
   * Existing query:
   * Suggestions load/show hongi.
   */
  const handleSearchFocus = () => {
    suggestionsEnabledRef.current = true;

    setIsDropdownOpen(true);

    if (query.trim() === "") {
      setSuggestions([]);
      loadRecentSearches();
    }
  };

  const createCategoryRoute = (
    categoryName
  ) => {
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
      (item.result_type !== "page" &&
      item.type !== "page" &&
      item.id &&
      !String(item.id).startsWith("/")
        ? item.id
        : null)
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

    /*
     * Result ya suggestion select karne ke baad
     * Recent Searches aur Suggestions hide hongi.
     */
    closeDropdown();

    if (
      typeof item.route === "string" &&
      item.route.trim().startsWith("/")
    ) {
      navigate(item.route.trim());
      return;
    }

    const documentRoute =
      createDocumentRoute(item);

    if (documentRoute) {
      navigate(documentRoute);
      return;
    }

    if (
      item.result_type === "category" ||
      item.type === "category"
    ) {
      const categoryRoute =
        createCategoryRoute(
          item.name ||
            item.title ||
            item.department
        );

      if (categoryRoute) {
        navigate(categoryRoute);
        return;
      }
    }

    if (
      item.name &&
      Array.isArray(item.children)
    ) {
      const categoryRoute =
        createCategoryRoute(item.name);

      if (categoryRoute) {
        navigate(categoryRoute);
        return;
      }
    }

    if (
      item.department &&
      item.department !== "Page" &&
      item.department !== "Category"
    ) {
      const categoryRoute =
        createCategoryRoute(
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

  const removeDuplicateResults = (
    items
  ) => {
    const seen = new Set();

    return items.filter((item) => {
      const documentId =
        getDocumentId(item);

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
        parentRoute =
          createCategoryRoute(item.name);
      }

      if (item.name) {
        convertedResults.push({
          id: parentRoute || item.name,
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

  const normalizeAIResults = (
    responseData
  ) => {
    const rawResults = Array.isArray(
      responseData?.results
    )
      ? responseData.results
      : Array.isArray(responseData)
      ? responseData
      : [];

    return rawResults.map((item) => {
      const documentId =
        getDocumentId(item);

      return {
        ...item,
        id: documentId || item.id,
        doc_id:
          documentId || item.doc_id,
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
          (documentId
            ? `/document/${encodeURIComponent(
                String(documentId)
              )}`
            : null),
        result_type: documentId
          ? "document"
          : item.result_type,
        type: documentId
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

    if (!finalQuery || isSearching) {
      return;
    }

    setIsSearching(true);

    /*
     * Search button ya Enter dabane ke baad
     * dropdown close hoga.
     */
    closeDropdown();

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

      const suggestionData =
        Array.isArray(
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

      setQuery(finalQuery);
      setResults(finalResults);
      setSuggestions([]);

      await loadRecentSearches();

      /*
       * Search results sirf /search page par show hote hain.
       * Agar user kisi aur page par hai to search page open hoga.
       */
      if (!isSearchPage) {
        navigate("/search");
      }
    } catch (error) {
      console.error(
        "Search error:",
        error
      );
    } finally {
      setIsSearching(false);
    }
  };

  /*
   * Category ya Page suggestion select.
   */
  const handleParentClick = async (item) => {
    const selectedText =
      item?.name || item?.title || query;

    /*
     * Click karte hi Recent Searches aur
     * Suggestions dono hide hongi.
     */
    closeDropdown();

    setQuery(selectedText);

    await saveRecentSearch(selectedText);

    navigateToItem(item);
  };

  /*
   * Document suggestion select.
   */
  const handleChildClick = async (child) => {
    const selectedText =
      child?.title || query;

    /*
     * Click karte hi Recent Searches aur
     * Suggestions dono hide hongi.
     */
    closeDropdown();

    setQuery(selectedText);

    await saveRecentSearch(selectedText);

    navigateToItem(child);
  };

  /*
   * Recent Search select karne par:
   *
   * 1. Recent dropdown hide hoga.
   * 2. Query search bar mein set hogi.
   * 3. Search execute hoga.
   */
  const handleRecentClick = async (
    item
  ) => {
    const recentQuery =
      typeof item === "string"
        ? item
        : item?.query ||
          item?.title ||
          "";

    if (!recentQuery) {
      return;
    }

    closeDropdown();
    setQuery(recentQuery);

    await handleSearch(recentQuery);
  };

  const deleteRecentSearch = async (
    item
  ) => {
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

  /*
   * Clear button:
   *
   * Query clear hogi aur input focused rehne par
   * Recent Searches show hongi.
   */
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);

    suggestionsEnabledRef.current = true;

    setIsDropdownOpen(true);
    loadRecentSearches();
  };

  const cleanQuery = query.trim();

  const shouldShowRecentSearches =
    isDropdownOpen &&
    cleanQuery === "" &&
    recentSearches.length > 0;

  const shouldShowSuggestions =
    isDropdownOpen &&
    cleanQuery.length >= 2 &&
    suggestions.length > 0;

  return (
    <div
      className="search-wrapper"
      ref={searchWrapperRef}
    >
      <div className="search-box">
        <SearchIcon className="search-icon" />

        <input
          type="text"
          placeholder="Search leave policy, payslip, IT security..."
          value={query}
          onFocus={handleSearchFocus}
          onClick={handleSearchFocus}
          onChange={(event) => {
            const inputValue =
              event.target.value;

            suggestionsEnabledRef.current = true;

            setIsDropdownOpen(true);
            setQuery(inputValue);

            /*
             * User type karna start karega to
             * Recent Searches automatically hide hongi.
             */
            if (inputValue.trim().length < 2) {
              setSuggestions([]);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }

            if (event.key === "Escape") {
              closeDropdown();
            }
          }}
        />

        {query && (
          <button
            type="button"
            className="clear-btn"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <CloseIcon />
          </button>
        )}

        <button
          type="button"
          className="search-btn"
          disabled={
            !query.trim() || isSearching
          }
          onClick={() => handleSearch()}
        >
          {isSearching
            ? "Searching..."
            : "Search"}
        </button>
      </div>

      {/* User type karega tab sirf Suggestions show hongi */}
      {shouldShowSuggestions && (
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
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      handleParentClick(item);
                    }
                  }}
                >
                  <SearchIcon />

                  <span>{item.name}</span>

                  <small>
                    {item.type === "category"
                      ? "Category"
                      : "Page"}
                  </small>
                </div>

                {Array.isArray(
                  item.children
                ) &&
                  item.children.length > 0 && (
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
                                event.key === " "
                              ) {
                                event.preventDefault();

                                handleChildClick(
                                  child
                                );
                              }
                            }}
                          >
                            <span>
                              ↳ {child.title}
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

      {/* Empty SearchBar par click karne par Recent Searches */}
      {shouldShowRecentSearches && (
        <div className="recent-box">
          <h3>Recent Searches</h3>

          <div className="recent-list">
            {recentSearches.map(
              (item, index) => {
                const recentText =
                  typeof item === "string"
                    ? item
                    : item?.query ||
                      item?.title ||
                      "";

                return (
                  <div
                    className="recent-chip"
                    key={`${recentText}-${index}`}
                  >
                    <button
                      type="button"
                      className="recent-text"
                      onMouseDown={(event) => {
                        event.preventDefault();

                        handleRecentClick(item);
                      }}
                    >
                      <SearchIcon
                        className="recent-search-icon"
                        fontSize="small"
                      />

                      <span>{recentText}</span>
                    </button>

                    <button
                      type="button"
                      className="remove-btn"
                      aria-label={`Remove ${recentText}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
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

      {isSearchPage && (
        <div className="results-grid">
          {results.map(
            (item, index) => (
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
                  navigateToItem(item)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    navigateToItem(item);
                  }
                }}
              >
                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span>
                  {item.department}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
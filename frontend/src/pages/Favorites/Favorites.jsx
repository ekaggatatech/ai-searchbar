import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../api/api";

import "./Favorites.css";

const FAVORITES_STORAGE_KEY = "favorites";

function getDocumentId(document) {
  return (
    document?.doc_id ||
    document?.docId ||
    document?.id ||
    ""
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently added";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeStoredFavorite(item) {
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return {
      doc_id: String(item),
    };
  }

  return item;
}

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError("");

    try {
      const storedFavorites =
        JSON.parse(
          localStorage.getItem(
            FAVORITES_STORAGE_KEY
          ) || "[]"
        );

      if (!Array.isArray(storedFavorites)) {
        setFavorites([]);
        return;
      }

      const normalizedFavorites =
        storedFavorites.map(
          normalizeStoredFavorite
        );

      const hydratedFavorites =
        await Promise.all(
          normalizedFavorites.map(
            async (favorite) => {
              const documentId =
                getDocumentId(favorite);

              const alreadyHasDetails =
                favorite.title &&
                favorite.department;

              if (
                alreadyHasDetails ||
                !documentId
              ) {
                return favorite;
              }

              try {
                const response = await api.get(
                  `/document/${encodeURIComponent(
                    documentId
                  )}`
                );

                return {
                  ...favorite,
                  ...response.data,
                };
              } catch (requestError) {
                console.error(
                  `Unable to load favorite ${documentId}:`,
                  requestError
                );

                return {
                  ...favorite,
                  title:
                    favorite.title ||
                    "Unavailable Document",
                  department:
                    favorite.department ||
                    "General",
                  description:
                    "This document is currently unavailable.",
                  unavailable: true,
                };
              }
            }
          )
        );

      setFavorites(hydratedFavorites);
    } catch (loadError) {
      console.error(
        "Unable to load favorites:",
        loadError
      );

      setError(
        "Unable to load your favorite documents."
      );

      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = (
    updatedFavorites
  ) => {
    setFavorites(updatedFavorites);

    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(updatedFavorites)
    );
  };

  const removeFavorite = (
    documentToRemove
  ) => {
    const documentId =
      getDocumentId(documentToRemove);

    const updatedFavorites =
      favorites.filter((document) => {
        return (
          String(getDocumentId(document)) !==
          String(documentId)
        );
      });

    saveFavorites(updatedFavorites);
  };

  const clearAllFavorites = () => {
    const shouldClear = window.confirm(
      "Remove all documents from favorites?"
    );

    if (!shouldClear) {
      return;
    }

    saveFavorites([]);
  };

  const openDocument = (document) => {
    const documentId =
      getDocumentId(document);

    if (!documentId || document.unavailable) {
      return;
    }

    navigate(
      `/document/${encodeURIComponent(
        documentId
      )}`
    );
  };

  const departments = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(
        favorites
          .map(
            (document) =>
              document.department ||
              document.category ||
              "General"
          )
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueDepartments];
  }, [favorites]);

  const filteredFavorites =
    useMemo(() => {
      const normalizedSearch =
        searchTerm.trim().toLowerCase();

      return favorites.filter(
        (document) => {
          const department =
            document.department ||
            document.category ||
            "General";

          const matchesDepartment =
            selectedDepartment === "All" ||
            department ===
              selectedDepartment;

          const searchableText = [
            document.title,
            document.description,
            department,
            getDocumentId(document),
            ...(Array.isArray(
              document.keywords
            )
              ? document.keywords
              : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesDepartment &&
            matchesSearch
          );
        }
      );
    }, [
      favorites,
      searchTerm,
      selectedDepartment,
    ]);

  if (loading) {
    return (
      <main className="favorites-page">
        <section className="favorites-state">
          <div className="favorites-loader" />

          <h2>Loading favorites</h2>

          <p>
            Your saved documents are being
            prepared.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="favorites-page">
        <section className="favorites-state error">
          <div className="state-symbol">!</div>

          <h2>Unable to load favorites</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadFavorites}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      <section className="favorites-hero">
        <div>
          <span className="favorites-label">
            Saved resources
          </span>

          <h1>Favorite Documents</h1>

          <p>
            Access the company documents that
            matter most to you.
          </p>
        </div>

        <div className="favorites-summary">
          <span>Saved documents</span>

          <strong>
            {favorites.length}
          </strong>
        </div>
      </section>

      <section className="favorites-toolbar">
        <div className="favorites-search">
          <span>⌕</span>

          <input
            type="text"
            value={searchTerm}
            placeholder="Search your favorites..."
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={selectedDepartment}
          onChange={(event) =>
            setSelectedDepartment(
              event.target.value
            )
          }
        >
          {departments.map(
            (department) => (
              <option
                key={department}
                value={department}
              >
                {department === "All"
                  ? "All Departments"
                  : department}
              </option>
            )
          )}
        </select>

        {favorites.length > 0 && (
          <button
            type="button"
            className="clear-favorites-button"
            onClick={clearAllFavorites}
          >
            Clear All
          </button>
        )}
      </section>

      {favorites.length === 0 ? (
        <section className="favorites-empty-state">
          <div className="empty-favorite-icon">
            ☆
          </div>

          <h2>No favorite documents yet</h2>

          <p>
            Open any company document and mark it
            as favorite. It will then appear on
            this page.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/search")
            }
          >
            Explore Documents
          </button>
        </section>
      ) : filteredFavorites.length ===
        0 ? (
        <section className="favorites-empty-state">
          <div className="empty-favorite-icon">
            ⌕
          </div>

          <h2>No matching documents</h2>

          <p>
            Try changing the search text or
            department filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedDepartment("All");
            }}
          >
            Reset Filters
          </button>
        </section>
      ) : (
        <>
          <div className="favorites-results-heading">
            <div>
              <h2>Your saved documents</h2>

              <p>
                Showing{" "}
                {filteredFavorites.length} of{" "}
                {favorites.length} documents
              </p>
            </div>
          </div>

          <section className="favorites-grid">
            {filteredFavorites.map(
              (document, index) => {
                const documentId =
                  getDocumentId(document);

                const department =
                  document.department ||
                  document.category ||
                  "General";

                return (
                  <article
                    className={`favorite-document-card ${
                      document.unavailable
                        ? "unavailable"
                        : ""
                    }`}
                    key={
                      documentId ||
                      `${document.title}-${index}`
                    }
                  >
                    <div className="favorite-card-top">
                      <div className="document-type-icon">
                        <span>▤</span>
                      </div>

                      <button
                        type="button"
                        className="favorite-star-button"
                        onClick={() =>
                          removeFavorite(
                            document
                          )
                        }
                        aria-label={`Remove ${
                          document.title ||
                          "document"
                        } from favorites`}
                        title="Remove from favorites"
                      >
                        ★
                      </button>
                    </div>

                    <div className="favorite-card-content">
                      <div className="favorite-badges">
                        <span className="favorite-department">
                          {department}
                        </span>

                        {document.status && (
                          <span className="favorite-status">
                            {document.status}
                          </span>
                        )}
                      </div>

                      <h3>
                        {document.title ||
                          "Untitled Document"}
                      </h3>

                      <p>
                        {document.description ||
                          "No document description is available."}
                      </p>
                    </div>

                    <div className="favorite-document-meta">
                      <div>
                        <span>Document ID</span>

                        <strong>
                          {documentId ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Last updated</span>

                        <strong>
                          {formatDate(
                            document.last_updated ||
                              document.updated_at
                          )}
                        </strong>
                      </div>
                    </div>

                    {Array.isArray(
                      document.keywords
                    ) &&
                      document.keywords.length >
                        0 && (
                        <div className="favorite-keywords">
                          {document.keywords
                            .slice(0, 3)
                            .map(
                              (
                                keyword,
                                keywordIndex
                              ) => (
                                <span
                                  key={`${keyword}-${keywordIndex}`}
                                >
                                  {keyword}
                                </span>
                              )
                            )}
                        </div>
                      )}

                    <div className="favorite-card-actions">
                      <button
                        type="button"
                        className="remove-favorite-button"
                        onClick={() =>
                          removeFavorite(
                            document
                          )
                        }
                      >
                        Remove
                      </button>

                      <button
                        type="button"
                        className="open-document-button"
                        disabled={
                          document.unavailable
                        }
                        onClick={() =>
                          openDocument(document)
                        }
                      >
                        {document.unavailable
                          ? "Unavailable"
                          : "Open Document →"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        </>
      )}
    </main>
  );
}
import { useNavigate } from "react-router-dom";

import WorkIcon from "@mui/icons-material/Work";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ComputerIcon from "@mui/icons-material/Computer";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";

import "./Search.css";

export default function Search() {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "hr",
      title: "HR Documents",
      description:
        "Find leave policies, employee benefits, holidays and workplace documents.",
      icon: <WorkIcon />,
      route: "/category/hr",
      badge: "HR",
    },
    {
      id: "finance",
      title: "Finance Documents",
      description:
        "Access payslips, reimbursements, salary details and finance policies.",
      icon: <AccountBalanceWalletIcon />,
      route: "/category/finance",
      badge: "Finance",
    },
    {
      id: "it",
      title: "IT & Security",
      description:
        "Search IT policies, password rules, security guidelines and technical help.",
      icon: <ComputerIcon />,
      route: "/category/it",
      badge: "IT",
    },
    {
      id: "history",
      title: "Search History",
      description:
        "View and reuse your previously searched queries.",
      icon: <HistoryIcon />,
      route: "/history",
      badge: "History",
    },
    {
      id: "favorites",
      title: "Saved Documents",
      description:
        "Open documents and pages that you saved as favorites.",
      icon: <FavoriteIcon />,
      route: "/favorites",
      badge: "Saved",
    },
    {
      id: "explore",
      title: "Explore Documents",
      description:
        "Search all company information using intelligent semantic search.",
      icon: <SearchIcon />,
      route: "/search",
      badge: "Explore",
    },
  ];

  const exampleSearches = [
    "How many annual leaves do employees receive?",
    "Show me the IT security policy",
    "How can I download my payslip?",
    "What is the work from home policy?",
  ];

  const focusHeaderSearch = (searchText = "") => {
    const searchInput = document.querySelector(
      ".search-box input"
    );

    if (!searchInput) {
      console.error("Header search input not found");
      return;
    }

    if (searchText) {
      const inputValueSetter =
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;

      if (inputValueSetter) {
        inputValueSetter.call(
          searchInput,
          searchText
        );

        searchInput.dispatchEvent(
          new Event("input", {
            bubbles: true,
          })
        );
      }
    }

    searchInput.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCardClick = (route) => {
    if (!route) {
      return;
    }

    if (route === "/search") {
      focusHeaderSearch();
      return;
    }

    navigate(route);
  };

  const handleCardKeyDown = (
    event,
    route
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleCardClick(route);
    }
  };

  return (
    <main className="search-page">
      <div className="search-page-container">
        {/* AI Search Hero Section */}
        <section className="search-hero">
          <div className="hero-content">
            <div className="hero-label">
              <SearchIcon />

              <span>
                AI-powered enterprise search
              </span>
            </div>

            <h1>
              What are you looking for?
            </h1>

            <p>
              Search company policies,
              documents and department
              information using natural
              language. You do not need to
              enter exact keywords.
            </p>
          </div>

          <div
            className="hero-visual"
            aria-hidden="true"
          >
            <div className="hero-visual-icon">
              <SearchIcon />
            </div>

            <span className="visual-dot dot-one" />
            <span className="visual-dot dot-two" />
            <span className="visual-dot dot-three" />
          </div>
        </section>

        {/* Example Search Queries */}
        <section className="example-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                Try searching
              </span>

              <h2>
                Search using natural language
              </h2>
            </div>

            <p>
              Select an example or type your
              own question in the search bar.
            </p>
          </div>

          <div className="example-search-list">
            {exampleSearches.map(
              (searchText) => (
                <button
                  type="button"
                  className="example-search-chip"
                  key={searchText}
                  onClick={() =>
                    focusHeaderSearch(
                      searchText
                    )
                  }
                >
                  <SearchIcon />

                  <span>
                    {searchText}
                  </span>
                </button>
              )
            )}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="quick-access-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                Quick access
              </span>

              <h2>
                Explore company resources
              </h2>
            </div>

            <p>
              Open a department directly or
              continue searching from the
              header search bar.
            </p>
          </div>

          <div className="quick-access-grid">
            {quickActions.map((item) => (
              <article
                className="quick-access-card"
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleCardClick(item.route)
                }
                onKeyDown={(event) =>
                  handleCardKeyDown(
                    event,
                    item.route
                  )
                }
              >
                <div className="quick-card-top">
                  <div className="quick-card-icon">
                    {item.icon}
                  </div>

                  <span className="quick-card-badge">
                    {item.badge}
                  </span>
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <div className="quick-card-action">
                  <span>
                    {item.route === "/search"
                      ? "Start searching"
                      : "Open section"}
                  </span>

                  <span
                    className="card-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* AI Search Explanation */}
        <section className="search-help-card">
          <div className="help-icon">
            <SearchIcon />
          </div>

          <div className="help-content">
            <h2>How AI Search works</h2>

            <p>
              Enter a question or topic in the
              header search bar. AI Search
              understands the meaning of your
              query and returns related pages,
              categories and documents.
            </p>
          </div>

          <div className="help-steps">
            <div className="help-step">
              <span>1</span>

              <p>
                Enter your question
              </p>
            </div>

            <div className="help-step">
              <span>2</span>

              <p>
                Select a suggestion
              </p>
            </div>

            <div className="help-step">
              <span>3</span>

              <p>
                Open the document
              </p>
            </div>
          </div>
        </section>

        <div
          className="results-container"
          aria-live="polite"
        />
      </div>
    </main>
  );
}
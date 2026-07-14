import SearchBar from "../SearchBar/SearchBar";
import "./Header.css";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2>Enterprise AI Search</h2>
        <p>Search across your organization</p>
      </div>

      <div className="header-search">
        <SearchBar />
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-btn"
          aria-label="Notifications"
        >
          <NotificationsNoneIcon />
        </button>

        <button
          type="button"
          className="header-profile-btn"
          aria-label="Profile"
        >
          <AccountCircleIcon />
        </button>
      </div>
    </header>
  );
}
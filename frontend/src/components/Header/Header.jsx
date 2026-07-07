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

      <div className="header-right">

        <button className="icon-btn">
          <NotificationsNoneIcon />
        </button>

        <button className="profile-btn">
          <AccountCircleIcon />
        </button>

      </div>

    </header>
  );
}
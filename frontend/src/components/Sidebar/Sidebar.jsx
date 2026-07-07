import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { SidebarContext } from "../../context/SidebarContext";

import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import WorkIcon from "@mui/icons-material/Work";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ComputerIcon from "@mui/icons-material/Computer";
import MenuIcon from "@mui/icons-material/Menu";

import "./Sidebar.css";

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useContext(SidebarContext);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MenuIcon />
        </button>

        {!collapsed && <h2>AI Search</h2>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          <HomeIcon />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/search" className="sidebar-link">
          <SearchIcon />
          {!collapsed && <span>AI Search</span>}
        </NavLink>

        <NavLink to="/category/hr" className="sidebar-link">
          <WorkIcon />
          {!collapsed && <span>HR</span>}
        </NavLink>

        <NavLink to="/category/finance" className="sidebar-link">
          <AccountBalanceWalletIcon />
          {!collapsed && <span>Finance</span>}
        </NavLink>

        <NavLink to="/category/it" className="sidebar-link">
          <ComputerIcon />
          {!collapsed && <span>IT</span>}
        </NavLink>

        <NavLink to="/history" className="sidebar-link">
          <HistoryIcon />
          {!collapsed && <span>History</span>}
        </NavLink>

        <NavLink to="/favorites" className="sidebar-link">
          <FavoriteIcon />
          {!collapsed && <span>Favorites</span>}
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          <SettingsIcon />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>
    </aside>
  );
}
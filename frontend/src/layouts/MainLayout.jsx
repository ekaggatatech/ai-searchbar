import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

import "./MainLayout.css";

export default function MainLayout() {
  const location = useLocation();

  /*
   * Header ke andar SearchBar hai.
   * Isliye Header sirf AI Search page par dikhayenge.
   */
  const isSearchPage =
    location.pathname === "/search";

  const isDocumentPage =
    location.pathname.startsWith(
      "/document/"
    );

  const isCategoryPage =
    location.pathname.startsWith(
      "/category/"
    );

  return (
    <div className="main-layout">
      <Sidebar />

      <div className="main-content">
        {isSearchPage && <Header />}

        <div
          className={`page-content ${
            isDocumentPage
              ? "document-page-content"
              : ""
          } ${
            isCategoryPage
              ? "category-page-content"
              : ""
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
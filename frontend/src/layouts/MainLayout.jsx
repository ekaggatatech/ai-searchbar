import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import { Header } from "../enterprise-ai-search";

import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

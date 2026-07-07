import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import Search from "../pages/Search/Search";
import DocumentPage from "../pages/DocumentPage/DocumentPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import History from "../pages/History/History";
import Favorites from "../pages/Favorites/Favorites";
import Settings from "../pages/Settings/Settings";
import NotFound from "../pages/NotFound/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="document/:docId" element={<DocumentPage />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="history" element={<History />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import Search from "../pages/Search/Search";
import DocumentPage from "../pages/DocumentPage/DocumentPage";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import History from "../pages/History/History";
import Favorites from "../pages/Favorites/Favorites";
import Settings from "../pages/Settings/Settings";
import NotFound from "../pages/NotFound/NotFound";

import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";

import {
  AuthProvider,
} from "../context/AuthContext/AuthContext";

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

import {
  SearchProvider,
} from "../enterprise-ai-search/context/SearchContext/SearchContext";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            {/* Protected application routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Home />}
              />

              <Route
                path="search"
                element={<Search />}
              />

              <Route
                path="document/:docId"
                element={<DocumentPage />}
              />

              <Route
                path="category/:categoryName"
                element={<CategoryPage />}
              />

              <Route
                path="history"
                element={<History />}
              />

              <Route
                path="favorites"
                element={<Favorites />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Route>
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
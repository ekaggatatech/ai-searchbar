import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner" />

        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children;
}
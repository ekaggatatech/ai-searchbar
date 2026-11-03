import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext/AuthContext";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const destination =
    location.state?.from?.pathname || "/";

  useEffect(() => {
    const registeredEmail =
      location.state?.registeredEmail;

    if (registeredEmail) {
      setFormData((previousData) => ({
        ...previousData,
        email: registeredEmail,
      }));

      setMessage(
        "Account created successfully. Please sign in."
      );
    }
  }, [location.state]);

  useEffect(() => {
    if (
      !isAuthLoading &&
      isAuthenticated
    ) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    navigate,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  const validateForm = () => {
    const cleanEmail =
      formData.email.trim();

    if (!cleanEmail) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Please enter your password.";
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const result = login({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem(
        "enterprise_portal_remember_email",
        formData.email
          .trim()
          .toLowerCase()
      );
    } else {
      localStorage.removeItem(
        "enterprise_portal_remember_email"
      );
    }

    navigate(destination, {
      replace: true,
    });
  };

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem(
        "enterprise_portal_remember_email"
      );

    if (rememberedEmail) {
      setFormData((previousData) => ({
        ...previousData,
        email: rememberedEmail,
      }));

      setRememberMe(true);
    }
  }, []);

  if (isAuthLoading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner" />

        <p>Loading secure portal...</p>
      </div>
    );
  }

  return (
    <main className="login-page">
      <section className="login-brand-section">
        <div className="login-brand-overlay" />

        <div className="login-brand-content">
          <div className="company-logo">
            <span>EK</span>
          </div>

          <p className="company-label">
            Enterprise Knowledge Portal
          </p>

          <h1>
            Find company knowledge faster
            with AI-powered search.
          </h1>

          <p className="brand-description">
            Access employee policies,
            departmental resources, salary
            information, security guidelines
            and important company documents
            from one secure portal.
          </p>

          <div className="login-feature-list">
            <div className="login-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Semantic document search
                </strong>

                <p>
                  Search using natural
                  language instead of exact
                  keywords.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Department resources
                </strong>

                <p>
                  Quickly access HR, Finance
                  and IT documents.
                </p>
              </div>
            </div>

            <div className="login-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Personalized workspace
                </strong>

                <p>
                  Save favorites, view search
                  history and recently opened
                  documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="login-brand-footer">
          Secure access for authorized
          employees
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-form-wrapper">
          <div className="mobile-company-logo">
            <span>EK</span>

            <p>
              Enterprise Knowledge Portal
            </p>
          </div>

          <div className="login-heading">
            <span className="login-heading-label">
              Employee Portal
            </span>

            <h2>Welcome back</h2>

            <p>
              Sign in with your registered
              employee account to continue.
            </p>
          </div>

          {message && (
            <div
              className="auth-message success-message"
              role="status"
            >
              <span>✓</span>

              <p>{message}</p>
            </div>
          )}

          {error && (
            <div
              className="auth-message error-message"
              role="alert"
            >
              <span>!</span>

              <p>{error}</p>
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-field">
              <label htmlFor="email">
                Work email
              </label>

              <div className="input-wrapper">
                <span
                  className="input-symbol"
                  aria-hidden="true"
                >
                  @
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="employee@company.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-field">
              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password-button"
                  onClick={() =>
                    setMessage(
                      "Password recovery will be available in the production version."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <span
                  className="input-symbol"
                  aria-hidden="true"
                >
                  ●
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
                disabled={isSubmitting}
              />

              <span className="custom-checkbox">
                ✓
              </span>

              <span>
                Remember my email
              </span>
            </label>

            <button
              type="submit"
              className="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in to portal"}

              {!isSubmitting && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />

            <p>New to the portal?</p>

            <span />
          </div>

          <Link
            to="/signup"
            className="create-account-link"
          >
            Create a new employee account
          </Link>

          <p className="login-security-note">
            By signing in, you agree to follow
            the company’s information security
            and acceptable-use policies.
          </p>
        </div>
      </section>
    </main>
  );
}
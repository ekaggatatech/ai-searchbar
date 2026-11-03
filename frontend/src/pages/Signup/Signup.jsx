import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext/AuthContext";

import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const {
    signup,
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      department: "",
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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

  const departments = [
    "Human Resources",
    "Finance",
    "Information Technology",
    "Administration",
    "Marketing",
    "Sales",
    "Operations",
    "Engineering",
    "Management",
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const cleanName = formData.name.trim();
    const cleanEmail =
      formData.email.trim();

    if (!cleanName) {
      return "Please enter your full name.";
    }

    if (cleanName.length < 3) {
      return "Name must contain at least 3 characters.";
    }

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

    if (!formData.department) {
      return "Please select your department.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
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

    const result = signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department:
        formData.department,
    });

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  if (isAuthLoading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner" />

        <p>Preparing secure registration...</p>
      </div>
    );
  }

  return (
    <main className="signup-page">
      <section className="signup-brand-section">
        <div className="signup-brand-overlay" />

        <div className="signup-brand-content">
          <div className="company-logo">
            <span>EK</span>
          </div>

          <p className="company-label">
            Enterprise Knowledge Portal
          </p>

          <h1>
            Create your employee workspace.
          </h1>

          <p className="brand-description">
            Register your account to access
            company policies, departmental
            resources, AI-powered document
            search and personalized tools.
          </p>

          <div className="signup-feature-list">
            <div className="signup-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Personalized dashboard
                </strong>

                <p>
                  Your dashboard displays your
                  name, department and activity.
                </p>
              </div>
            </div>

            <div className="signup-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  AI-powered search
                </strong>

                <p>
                  Find relevant policies and
                  documents using natural
                  language.
                </p>
              </div>
            </div>

            <div className="signup-feature">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Saved resources
                </strong>

                <p>
                  Manage favorites, search
                  history and recently viewed
                  documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="signup-brand-footer">
          Secure employee registration portal
        </p>
      </section>

      <section className="signup-form-section">
        <div className="signup-form-wrapper">
          <div className="mobile-company-logo">
            <span>EK</span>

            <p>
              Enterprise Knowledge Portal
            </p>
          </div>

          <div className="signup-heading">
            <span className="signup-heading-label">
              Employee Registration
            </span>

            <h2>Create an account</h2>

            <p>
              Enter your details to create your
              employee portal account.
            </p>
          </div>

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
            className="signup-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="signup-form-grid">
              <div className="form-field">
                <label htmlFor="name">
                  Full name
                </label>

                <div className="input-wrapper">
                  <span
                    className="input-symbol"
                    aria-hidden="true"
                  >
                    👤
                  </span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

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

              <div className="form-field full-width-field">
                <label htmlFor="department">
                  Department
                </label>

                <div className="input-wrapper select-wrapper">
                  <span
                    className="input-symbol"
                    aria-hidden="true"
                  >
                    ◫
                  </span>

                  <select
                    id="department"
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">
                      Select your department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  Password
                </label>

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
                    value={
                      formData.password
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
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

              <div className="form-field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">
                  <span
                    className="input-symbol"
                    aria-hidden="true"
                  >
                    ●
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="password-requirement">
              <span>✓</span>

              <p>
                Use at least 6 characters for
                your password.
              </p>
            </div>

            <button
              type="submit"
              className="signup-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating account..."
                : "Create employee account"}

              {!isSubmitting && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />

            <p>Already registered?</p>

            <span />
          </div>

          <Link
            to="/login"
            className="login-account-link"
          >
            Sign in to your account
          </Link>

          <p className="signup-security-note">
            This registration system uses
            local browser storage for the
            project demonstration.
          </p>
        </div>
      </section>
    </main>
  );
}
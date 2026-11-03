import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext/AuthContext";

import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [preferences, setPreferences] = useState(() => {
    try {
      const savedPreferences =
        localStorage.getItem(
          "searchPreferences"
        );

      if (!savedPreferences) {
        return {
          searchSuggestions: true,
          saveHistory: true,
          emailNotifications: false,
        };
      }

      return {
        searchSuggestions: true,
        saveHistory: true,
        emailNotifications: false,
        ...JSON.parse(savedPreferences),
      };
    } catch (error) {
      console.error(
        "Unable to load preferences:",
        error
      );

      return {
        searchSuggestions: true,
        saveHistory: true,
        emailNotifications: false,
      };
    }
  });

  const updatePreference = (
    preferenceName
  ) => {
    const updatedPreferences = {
      ...preferences,
      [preferenceName]:
        !preferences[preferenceName],
    };

    setPreferences(updatedPreferences);

    localStorage.setItem(
      "searchPreferences",
      JSON.stringify(updatedPreferences)
    );
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const getInitials = () => {
    const userName =
      user?.name || "Employee";

    const words = userName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "E";
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };

  return (
    <main className="settings-page">
      <section className="settings-header">
        <div>
          <span className="settings-label">
            Employee Portal
          </span>

          <h1>Settings</h1>

          <p>
            Manage your profile, AI Search
            preferences and account security.
          </p>
        </div>
      </section>

      <div className="settings-layout">
        <section className="settings-main">
          <article className="settings-card profile-card">
            <div className="settings-card-header">
              <div>
                <h2>Profile Information</h2>

                <p>
                  Your employee account details.
                </p>
              </div>

              <span className="profile-status">
                Active
              </span>
            </div>

            <div className="profile-content">
              <div className="profile-avatar">
                {getInitials()}
              </div>

              <div className="profile-details">
                <h3>
                  {user?.name || "Employee"}
                </h3>

                <p>
                  {user?.role || "Employee"}
                </p>

                <div className="profile-information-grid">
                  <div className="profile-information">
                    <span>Email address</span>

                    <strong>
                      {user?.email ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="profile-information">
                    <span>Department</span>

                    <strong>
                      {user?.department ||
                        "General"}
                    </strong>
                  </div>

                  <div className="profile-information">
                    <span>Employee ID</span>

                    <strong>
                      {user?.id ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="profile-information">
                    <span>Account status</span>

                    <strong className="active-value">
                      Active
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="settings-card">
            <div className="settings-card-header">
              <div>
                <h2>
                  AI Search Preferences
                </h2>

                <p>
                  Control how enterprise search
                  behaves for your account.
                </p>
              </div>
            </div>

            <div className="preference-list">
              <div className="preference-item">
                <div>
                  <h3>
                    Semantic search suggestions
                  </h3>

                  <p>
                    Display AI-generated suggestions
                    while you type.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle-button ${
                    preferences.searchSuggestions
                      ? "enabled"
                      : ""
                  }`}
                  onClick={() =>
                    updatePreference(
                      "searchSuggestions"
                    )
                  }
                  aria-pressed={
                    preferences.searchSuggestions
                  }
                >
                  <span />
                </button>
              </div>

              <div className="preference-item">
                <div>
                  <h3>Save search history</h3>

                  <p>
                    Store recent searches for
                    faster access.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle-button ${
                    preferences.saveHistory
                      ? "enabled"
                      : ""
                  }`}
                  onClick={() =>
                    updatePreference(
                      "saveHistory"
                    )
                  }
                  aria-pressed={
                    preferences.saveHistory
                  }
                >
                  <span />
                </button>
              </div>

              <div className="preference-item">
                <div>
                  <h3>Email notifications</h3>

                  <p>
                    Receive updates about important
                    enterprise documents.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle-button ${
                    preferences.emailNotifications
                      ? "enabled"
                      : ""
                  }`}
                  onClick={() =>
                    updatePreference(
                      "emailNotifications"
                    )
                  }
                  aria-pressed={
                    preferences.emailNotifications
                  }
                >
                  <span />
                </button>
              </div>
            </div>
          </article>

          <article className="settings-card security-card">
            <div className="settings-card-header">
              <div>
                <h2>Security</h2>

                <p>
                  Manage your active account
                  session.
                </p>
              </div>
            </div>

            <div className="security-information">
              <div>
                <span className="security-icon">
                  🔒
                </span>

                <div>
                  <h3>Current session</h3>

                  <p>
                    Logout from this device and
                    return to the login page.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          </article>
        </section>

        <aside className="settings-sidebar">
          <article className="settings-side-card">
            <span className="side-card-icon">
              ⚙
            </span>

            <h3>Account Settings</h3>

            <p>
              Your account information comes
              directly from the active login
              session.
            </p>
          </article>

          <article className="settings-side-card help-card">
            <span className="side-card-icon">
              ?
            </span>

            <h3>Need Help?</h3>

            <p>
              Contact the IT support team if you
              cannot access your account or company
              documents.
            </p>

            <button type="button">
              Contact IT Support
            </button>
          </article>
        </aside>
      </div>
    </main>
  );
}
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext/AuthContext";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const employeeName = user?.name || "Employee";
  const employeeDepartment =
    user?.department || "General Administration";

  const employeeInitials = useMemo(() => {
    return employeeName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }, [employeeName]);

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const departmentMessage = useMemo(() => {
    const department = employeeDepartment.toLowerCase();

    if (
      department.includes("human") ||
      department === "hr"
    ) {
      return "Review employee policies, attendance guidelines and workforce resources.";
    }

    if (department.includes("finance")) {
      return "Access payroll policies, reimbursement guidance and finance resources.";
    }

    if (
      department.includes("information") ||
      department.includes("technology") ||
      department === "it" ||
      department.includes("engineering")
    ) {
      return "Access security policies, technical guides and IT support resources.";
    }

    if (
      department.includes("marketing") ||
      department.includes("sales")
    ) {
      return "Access company communication, sales and customer management resources.";
    }

    return "Access company policies, departmental documents and employee services.";
  }, [employeeDepartment]);

  const getDepartmentRoute = () => {
    const department = employeeDepartment.toLowerCase();

    if (
      department.includes("human") ||
      department === "hr"
    ) {
      return "/category/hr";
    }

    if (department.includes("finance")) {
      return "/category/finance";
    }

    if (
      department.includes("information") ||
      department.includes("technology") ||
      department === "it" ||
      department.includes("engineering")
    ) {
      return "/category/it";
    }

    if (department.includes("sales")) {
      return "/category/sales";
    }

    if (
      department.includes("administration") ||
      department.includes("operations")
    ) {
      return "/category/administration";
    }

    return "/search";
  };

  const quickActions = [
    {
      id: "leave-policy",
      icon: "LP",
      title: "Leave Policy",
      description:
        "View leave types, eligibility, sick leave, casual leave and company leave rules.",
      documentId: "DOC001",
      buttonLabel: "View policy",
    },
    {
      id: "employee-handbook",
      icon: "EH",
      title: "Employee Handbook",
      description:
        "Read company rules, employee responsibilities and workplace guidelines.",
      documentId: "DOC005",
      buttonLabel: "Open handbook",
    },
    {
      id: "salary-structure",
      icon: "SS",
      title: "Salary Structure",
      description:
        "View salary components, payroll process, basic pay and allowances.",
      documentId: "DOC003",
      buttonLabel: "View salary details",
    },
    {
      id: "it-security",
      icon: "IT",
      title: "IT Security Policy",
      description:
        "Review password, VPN, cybersecurity and network-security guidelines.",
      documentId: "DOC006",
      buttonLabel: "View security policy",
    },
    {
      id: "attendance-policy",
      icon: "AP",
      title: "Attendance Policy",
      description:
        "View office timings, attendance requirements and late-entry rules.",
      documentId: "DOC002",
      buttonLabel: "View attendance rules",
    },
    {
      id: "remote-work-policy",
      icon: "RW",
      title: "Remote Work Policy",
      description:
        "Read work-from-home, hybrid-working and remote-work guidelines.",
      documentId: "DOC015",
      buttonLabel: "View remote policy",
    },
  ];

  const announcements = [
    {
      id: 1,
      category: "Human Resources",
      title: "Review the updated Leave Policy",
      description:
        "Employees should review the latest leave rules and approval requirements.",
      label: "Updated",
      documentId: "DOC001",
    },
    {
      id: 2,
      category: "Information Technology",
      title: "Password and account security reminder",
      description:
        "Use strong passwords and follow the organization’s cybersecurity guidelines.",
      label: "Security",
      documentId: "DOC006",
    },
    {
      id: 3,
      category: "Finance",
      title: "Expense reimbursement requirements",
      description:
        "Attach valid invoices and approval information when submitting official claims.",
      label: "Finance",
      documentId: "DOC004",
    },
  ];

  const openDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  return (
    <main className="enterprise-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">
            Employee Knowledge Portal
          </span>

          <h1>
            Welcome back, <span>{employeeName}</span>
          </h1>

          <p className="dashboard-date">
            {currentDate}
          </p>

          <p className="dashboard-description">
            {departmentMessage}
          </p>

          <div className="dashboard-hero-actions">
            <button
              type="button"
              className="primary-dashboard-button"
              onClick={() => navigate("/search")}
            >
              Search company knowledge
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="secondary-dashboard-button"
              onClick={() => openDocument("DOC005")}
            >
              Open employee handbook
            </button>
          </div>
        </div>

        <aside className="employee-summary-card">
          <div className="employee-avatar">
            {employeeInitials || "EP"}
          </div>

          <div className="employee-summary-heading">
            <p>Signed in as</p>
            <h2>{employeeName}</h2>
            <span>{employeeDepartment}</span>
          </div>

          <div className="employee-summary-details">
            <div>
              <span>Portal access</span>
              <strong>Active</strong>
            </div>

            <div>
              <span>Account type</span>
              <strong>Employee</strong>
            </div>
          </div>

          <button
            type="button"
            className="profile-settings-button"
            onClick={() => navigate("/settings")}
          >
            Manage profile
          </button>
        </aside>
      </section>

      <section className="dashboard-statistics">
        <article
          className="dashboard-stat-card"
          role="button"
          tabIndex={0}
          onClick={() => openDocument("DOC001")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              openDocument("DOC001");
            }
          }}
        >
          <div className="stat-icon stat-icon-blue">
            AL
          </div>

          <div>
            <span>Available leave</span>
            <strong>18 days</strong>
            <p>View leave policy</p>
          </div>
        </article>

        <article
          className="dashboard-stat-card"
          role="button"
          tabIndex={0}
          onClick={() => openDocument("DOC002")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              openDocument("DOC002");
            }
          }}
        >
          <div className="stat-icon stat-icon-green">
            AT
          </div>

          <div>
            <span>Attendance</span>
            <strong>Policy</strong>
            <p>View working-hour rules</p>
          </div>
        </article>

        <article
          className="dashboard-stat-card"
          role="button"
          tabIndex={0}
          onClick={() => openDocument("DOC004")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              openDocument("DOC004");
            }
          }}
        >
          <div className="stat-icon stat-icon-orange">
            ER
          </div>

          <div>
            <span>Expense claims</span>
            <strong>Rules</strong>
            <p>View reimbursement policy</p>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon stat-icon-purple">
            SD
          </div>

          <div>
            <span>Saved documents</span>
            <strong>View</strong>

            <button
              type="button"
              className="stat-link-button"
              onClick={() => navigate("/favorites")}
            >
              Open favorites
            </button>
          </div>
        </article>
      </section>

      <section className="dashboard-content-section">
        <div className="dashboard-section-heading">
          <div>
            <span>Employee services</span>
            <h2>Quick access</h2>

            <p>
              Open frequently used policies and company
              documents directly.
            </p>
          </div>

          <button
            type="button"
            className="section-action-button"
            onClick={() => navigate("/search")}
          >
            Browse all resources
          </button>
        </div>

        <div className="quick-action-grid">
          {quickActions.map((item) => (
            <article
              className="quick-action-card"
              key={item.id}
            >
              <div className="quick-action-icon">
                {item.icon}
              </div>

              <div className="quick-action-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <button
                type="button"
                className="quick-action-button"
                onClick={() =>
                  openDocument(item.documentId)
                }
              >
                {item.buttonLabel}
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <div className="dashboard-panel announcements-panel">
          <div className="panel-heading">
            <div>
              <span>Company updates</span>
              <h2>Announcements</h2>
            </div>

            <span className="live-status">
              Latest
            </span>
          </div>

          <div className="announcement-list">
            {announcements.map((announcement) => (
              <article
                className="announcement-item"
                key={announcement.id}
              >
                <div className="announcement-marker" />

                <div className="announcement-content">
                  <div className="announcement-meta">
                    <span>
                      {announcement.category}
                    </span>

                    <time>
                      {announcement.label}
                    </time>
                  </div>

                  <h3>{announcement.title}</h3>

                  <p>{announcement.description}</p>

                  <button
                    type="button"
                    className="quick-action-button"
                    onClick={() =>
                      openDocument(
                        announcement.documentId
                      )
                    }
                  >
                    Open document
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <span>Your workspace</span>
              <h2>Quick navigation</h2>
            </div>
          </div>

          <div className="activity-navigation">
            <button
              type="button"
              onClick={() => navigate("/history")}
            >
              <div>
                <strong>Search history</strong>
                <span>
                  Review your recent searches
                </span>
              </div>

              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/favorites")}
            >
              <div>
                <strong>Saved resources</strong>
                <span>
                  Open favorite documents
                </span>
              </div>

              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(getDepartmentRoute())
              }
            >
              <div>
                <strong>My department</strong>
                <span>
                  {employeeDepartment} resources
                </span>
              </div>

              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
            >
              <div>
                <strong>Account settings</strong>
                <span>
                  Update your employee profile
                </span>
              </div>

              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="dashboard-help-card">
            <span>AI</span>

            <div>
              <h3>Need different information?</h3>

              <p>
                Use Enterprise AI Search to find documents
                that are not available in Quick Access.
              </p>

              <button
                type="button"
                onClick={() => navigate("/search")}
              >
                Open Enterprise AI Search
              </button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
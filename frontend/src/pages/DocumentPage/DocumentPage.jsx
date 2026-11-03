import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

import api from "../../api/api";

import "./DocumentPage.css";


const HIDDEN_FIELDS = new Set([
  "id",
  "doc_id",
  "docId",
  "title",
  "description",
  "department",
  "category",
  "keywords",
  "content",
  "sections",
  "status",
  "version",
  "last_updated",
  "updated_at",
  "updated_by",
  "owner",
  "effective_date",
]);


const SALARY_FIELD_CONFIG = {
  basic_salary: {
    label: "Basic Salary",
    icon: <PaymentsOutlinedIcon />,
  },

  hra: {
    label: "House Rent Allowance",
    icon: <HomeOutlinedIcon />,
  },

  allowances: {
    label: "Allowances",
    icon: <AccountBalanceWalletOutlinedIcon />,
  },

  deductions: {
    label: "Deductions",
    icon: <DoNotDisturbOnOutlinedIcon />,
  },

  gross_salary: {
    label: "Gross Salary",
    icon: <TrendingUpOutlinedIcon />,
  },

  net_salary: {
    label: "Net Salary",
    icon: <AccountBalanceWalletOutlinedIcon />,
  },
};


function formatFieldName(fieldName) {
  return String(fieldName)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Not specified";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function renderValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not specified";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([key, itemValue]) =>
          `${formatFieldName(key)}: ${itemValue}`
      )
      .join(" • ");
  }

  return String(value);
}


export default function DocumentPage() {
  const { docId } = useParams();

  const navigate = useNavigate();

  const [documentData, setDocumentData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadDocument = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/document/${encodeURIComponent(docId)}`
      );

      setDocumentData(response.data);
    } catch (requestError) {
      console.error(
        "Document loading error:",
        requestError
      );

      setDocumentData(null);

      if (
        requestError.response?.status === 404
      ) {
        setError(
          "The requested document could not be found."
        );
      } else {
        setError(
          "Unable to load this document. Please check the backend connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDocument();
  }, [docId]);


  const department =
    documentData?.department ||
    documentData?.category ||
    "General";


  const documentIdentifier =
    documentData?.doc_id ||
    documentData?.docId ||
    documentData?.id ||
    docId;


  const status =
    documentData?.status ||
    "Active";


  const version =
    documentData?.version ||
    "1.0";


  const updatedDate =
    documentData?.last_updated ||
    documentData?.updated_at ||
    documentData?.effective_date;


  const owner =
    documentData?.owner ||
    documentData?.updated_by ||
    `${department} Department`;


  const keywords = Array.isArray(
    documentData?.keywords
  )
    ? documentData.keywords
    : [];


  const salaryFields = useMemo(() => {
    if (!documentData) {
      return [];
    }

    return Object.entries(
      SALARY_FIELD_CONFIG
    )
      .filter(([fieldName]) =>
        documentData[fieldName] !== undefined
      )
      .map(([fieldName, config]) => ({
        fieldName,
        value: documentData[fieldName],
        ...config,
      }));
  }, [documentData]);


  const additionalFields = useMemo(() => {
    if (!documentData) {
      return [];
    }

    return Object.entries(documentData)
      .filter(([fieldName, value]) => {
        if (HIDDEN_FIELDS.has(fieldName)) {
          return false;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            SALARY_FIELD_CONFIG,
            fieldName
          )
        ) {
          return false;
        }

        return (
          value !== null &&
          value !== undefined &&
          value !== ""
        );
      })
      .map(([fieldName, value]) => ({
        fieldName,
        label: formatFieldName(fieldName),
        value,
      }));
  }, [documentData]);


  const contentParagraphs = useMemo(() => {
    const rawContent =
      documentData?.content;

    if (!rawContent) {
      return [];
    }

    if (Array.isArray(rawContent)) {
      return rawContent;
    }

    return String(rawContent)
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [documentData]);


  const sections = Array.isArray(
    documentData?.sections
  )
    ? documentData.sections
    : [];


  const handlePrint = () => {
    window.print();
  };


  const handleDownload = () => {
    if (!documentData) {
      return;
    }

    const printableContent = `
${documentData.title || "Company Document"}

Department: ${department}
Document ID: ${documentIdentifier}
Status: ${status}
Version: ${version}
Owner: ${owner}
Last Updated: ${formatDate(updatedDate)}

Description:
${documentData.description || "No description available."}

${Object.entries(documentData)
  .filter(
    ([fieldName]) =>
      ![
        "title",
        "description",
        "keywords",
      ].includes(fieldName)
  )
  .map(
    ([fieldName, value]) =>
      `${formatFieldName(fieldName)}: ${renderValue(value)}`
  )
  .join("\n")}
    `.trim();

    const fileBlob = new Blob(
      [printableContent],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const fileUrl =
      URL.createObjectURL(fileBlob);

    const downloadLink =
      window.document.createElement("a");

    downloadLink.href = fileUrl;

    downloadLink.download =
      `${documentIdentifier}-${documentData.title || "document"}`
        .replace(/\s+/g, "-")
        .toLowerCase() + ".txt";

    window.document.body.appendChild(
      downloadLink
    );

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(fileUrl);
  };


  const openDepartmentPage = () => {
    const categoryRoute = String(department)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    navigate(
      `/category/${encodeURIComponent(
        categoryRoute
      )}`
    );
  };


  if (loading) {
    return (
      <main className="document-page">
        <section className="document-state-card">
          <div className="document-loader" />

          <h2>Loading document</h2>

          <p>
            Please wait while the latest document
            information is being loaded.
          </p>
        </section>
      </main>
    );
  }


  if (error || !documentData) {
    return (
      <main className="document-page">
        <section className="document-state-card error">
          <ReportProblemOutlinedIcon
            className="state-icon"
          />

          <h2>Unable to open document</h2>

          <p>
            {error ||
              "The requested document is unavailable."}
          </p>

          <div className="state-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
              Go Back
            </button>

            <button
              type="button"
              className="primary"
              onClick={loadDocument}
            >
              <RefreshOutlinedIcon />
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="document-page">
      <nav className="document-breadcrumb">
        <button
          type="button"
          onClick={() => navigate("/")}
        >
          <HomeOutlinedIcon />
          Dashboard
        </button>

        <span>/</span>

        <button
          type="button"
          onClick={openDepartmentPage}
        >
          {department}
        </button>

        <span>/</span>

        <strong>
          {documentData.title}
        </strong>
      </nav>


      <section className="document-header">
        <div className="document-header-main">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </button>

          <div className="document-title-icon">
            <DescriptionOutlinedIcon />
          </div>

          <div className="document-heading">
            <div className="document-badges">
              <span className="department-badge">
                {department}
              </span>

              <span
                className={`status-badge ${String(
                  status
                )
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <VerifiedOutlinedIcon />
                {status}
              </span>
            </div>

            <h1>
              {documentData.title ||
                "Untitled Document"}
            </h1>

            <p>
              {documentData.description ||
                "No description is available for this document."}
            </p>
          </div>
        </div>

        <div className="document-actions">
          <button
            type="button"
            onClick={handlePrint}
          >
            <PrintOutlinedIcon />
            Print
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={handleDownload}
          >
            <DownloadOutlinedIcon />
            Download
          </button>
        </div>
      </section>


      <section className="document-meta-grid">
        <article className="document-meta-card">
          <DescriptionOutlinedIcon />

          <div>
            <span>Document ID</span>

            <strong>
              {documentIdentifier}
            </strong>
          </div>
        </article>

        <article className="document-meta-card">
          <BusinessOutlinedIcon />

          <div>
            <span>Document Owner</span>

            <strong>{owner}</strong>
          </div>
        </article>

        <article className="document-meta-card">
          <CalendarMonthOutlinedIcon />

          <div>
            <span>Last Updated</span>

            <strong>
              {formatDate(updatedDate)}
            </strong>
          </div>
        </article>

        <article className="document-meta-card">
          <PersonOutlineOutlinedIcon />

          <div>
            <span>Version</span>

            <strong>v{version}</strong>
          </div>
        </article>
      </section>


      <div className="document-layout">
        <section className="document-main-content">
          <article className="document-content-card">
            <div className="section-heading">
              <div>
                <span className="section-label">
                  Overview
                </span>

                <h2>
                  Document Information
                </h2>
              </div>
            </div>

            <p className="document-overview-text">
              {documentData.description ||
                "This document contains company information and applicable guidelines."}
            </p>
          </article>


          {salaryFields.length > 0 && (
            <article className="document-content-card">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    Compensation
                  </span>

                  <h2>
                    Salary Components
                  </h2>
                </div>
              </div>

              <div className="salary-component-grid">
                {salaryFields.map(
                  ({
                    fieldName,
                    label,
                    value,
                    icon,
                  }) => (
                    <div
                      className="salary-component-card"
                      key={fieldName}
                    >
                      <div className="salary-component-icon">
                        {icon}
                      </div>

                      <div>
                        <span>{label}</span>

                        <strong>
                          {renderValue(value)}
                        </strong>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="salary-note">
                <strong>
                  Important:
                </strong>

                <span>
                  Actual salary values may vary
                  according to employee designation,
                  experience, tax declarations and
                  company policy.
                </span>
              </div>
            </article>
          )}


          {contentParagraphs.length > 0 && (
            <article className="document-content-card">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    Details
                  </span>

                  <h2>
                    Policy Description
                  </h2>
                </div>
              </div>

              <div className="document-rich-content">
                {contentParagraphs.map(
                  (paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  )
                )}
              </div>
            </article>
          )}


          {sections.map((section, index) => (
            <article
              className="document-content-card"
              key={
                section.id ||
                section.title ||
                index
              }
            >
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    Section {index + 1}
                  </span>

                  <h2>
                    {section.title ||
                      `Section ${index + 1}`}
                  </h2>
                </div>
              </div>

              {section.description && (
                <p className="document-overview-text">
                  {section.description}
                </p>
              )}

              {Array.isArray(section.items) && (
                <ul className="document-list">
                  {section.items.map(
                    (item, itemIndex) => (
                      <li key={itemIndex}>
                        {typeof item === "string"
                          ? item
                          : renderValue(item)}
                      </li>
                    )
                  )}
                </ul>
              )}
            </article>
          ))}


          {additionalFields.length > 0 && (
            <article className="document-content-card">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    Additional details
                  </span>

                  <h2>
                    Additional Information
                  </h2>
                </div>
              </div>

              <div className="additional-information-grid">
                {additionalFields.map(
                  ({
                    fieldName,
                    label,
                    value,
                  }) => (
                    <div
                      className="information-row"
                      key={fieldName}
                    >
                      <span>{label}</span>

                      <strong>
                        {renderValue(value)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </article>
          )}
        </section>


        <aside className="document-sidebar-panel">
          <section className="sidebar-information-card">
            <h3>Document Details</h3>

            <div className="sidebar-detail-row">
              <span>Status</span>

              <strong className="active-text">
                {status}
              </strong>
            </div>

            <div className="sidebar-detail-row">
              <span>Department</span>

              <strong>
                {department}
              </strong>
            </div>

            <div className="sidebar-detail-row">
              <span>Version</span>

              <strong>
                v{version}
              </strong>
            </div>

            <div className="sidebar-detail-row">
              <span>Document ID</span>

              <strong>
                {documentIdentifier}
              </strong>
            </div>
          </section>


          {keywords.length > 0 && (
            <section className="sidebar-information-card">
              <h3>Keywords</h3>

              <div className="keyword-list">
                {keywords.map(
                  (keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
                    >
                      {keyword}
                    </span>
                  )
                )}
              </div>
            </section>
          )}


          <section className="sidebar-information-card help-card">
            <h3>Need clarification?</h3>

            <p>
              Contact the {department} department
              for questions related to this
              document.
            </p>

            <button
              type="button"
              onClick={openDepartmentPage}
            >
              View {department} Documents
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
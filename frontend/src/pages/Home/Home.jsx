import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <section className="dashboard-intro">
        <h1>Welcome to Enterprise AI Search</h1>

        <p>
          Enterprise AI Search is an AI-powered internal search platform
          designed to help employees quickly find company information,
          policies, documents and organizational resources.
        </p>

        <p>
          The system uses semantic search technology to understand the
          meaning of a user&apos;s query instead of depending only on exact
          keywords.
        </p>
      </section>

      <section className="dashboard-section">
        <h2>What You Can Search</h2>

        <div className="dashboard-features">
          <div className="dashboard-feature-card">
            <h3>HR Documents</h3>
            <p>
              Find leave policies, attendance rules, employee handbooks
              and other HR information.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>Finance Documents</h3>
            <p>
              Access salary information, reimbursement policies, payslip
              details and finance resources.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>IT Documents</h3>
            <p>
              Find password guides, laptop policies, cybersecurity
              information and IT support documents.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>Company Knowledge</h3>
            <p>
              Search policies and internal resources across different
              departments from one place.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Platform Features</h2>

        <div className="dashboard-features">
          <div className="dashboard-feature-card">
            <h3>AI Semantic Search</h3>
            <p>
              Understands natural-language queries and returns relevant
              documents based on meaning.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>Smart Suggestions</h3>
            <p>
              Displays relevant pages and documents while the user is
              typing.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>Dynamic Navigation</h3>
            <p>
              Opens the correct category or document page directly from
              search results.
            </p>
          </div>

          <div className="dashboard-feature-card">
            <h3>Recent Searches</h3>
            <p>
              Stores recent queries so users can quickly perform the same
              search again.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
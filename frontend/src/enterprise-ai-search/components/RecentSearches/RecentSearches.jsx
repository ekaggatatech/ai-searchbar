import "./RecentSearches.css";

export default function RecentSearches({
    recentSearches = [],
    onRecentClick,
    onDeleteRecent,
}) {
    if (!recentSearches.length) return null;

    return (
        <div className="recent-wrapper">
            <h3>Recent Searches</h3>

            <div className="recent-list">
                {recentSearches.map((item) => (
                    <div className="recent-chip" key={item.id}>
                        <button
                            className="recent-text"
                            type="button"
                            onClick={() => onRecentClick(item.query)}
                        >
                            {item.query}
                        </button>

                        <button
                            className="recent-close"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRecent(item.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
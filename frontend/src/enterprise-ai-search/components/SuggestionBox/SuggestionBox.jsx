import SearchIcon from "@mui/icons-material/Search";
import "./SuggestionBox.css";

export default function SuggestionBox({
  suggestions,
  onParentClick,
  onChildClick,
}) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestion-box">
      {suggestions.map((item, index) => (
        <div
          className="suggestion-group"
          key={item.route || item.name || index}
        >
          <div
            className="suggestion-item parent-suggestion"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => {
              event.preventDefault();
              onParentClick(item);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onParentClick(item);
              }
            }}
          >
            <SearchIcon />

            <span>{item.name}</span>

            <small>
              {item.type === "category" ? "Category" : "Page"}
            </small>
          </div>

          {Array.isArray(item.children) &&
            item.children.length > 0 && (
              <div className="child-suggestions">
                {item.children.map((child, childIndex) => (
                  <div
                    className="suggestion-item child-suggestion"
                    key={
                      child.doc_id ||
                      child.id ||
                      childIndex
                    }
                    role="button"
                    tabIndex={0}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChildClick(child);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        onChildClick(child);
                      }
                    }}
                  >
                    <span>↳ {child.title}</span>
                    <small>Document</small>
                  </div>
                ))}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
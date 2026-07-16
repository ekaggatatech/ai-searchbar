import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      query,
      setQuery,
      results,
      setResults,
      suggestions,
      setSuggestions,
      loading,
      setLoading,
      clearSearch,
    }),
    [
      query,
      results,
      suggestions,
      loading,
    ]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error(
      "useSearch must be used inside SearchProvider"
    );
  }

  return context;
}
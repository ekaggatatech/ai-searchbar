import SearchBar from "../components/SearchBar/SearchBar";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-search">
        <SearchBar />
      </div>
    </header>
  );
}

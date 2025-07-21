import { useState } from "react";
import "./App.css";
import BreakingNewsTicker from "./Components/BreakingNewsTicker";
import NewsList from "./Components/NewsList";
import logo from "./assets/logo.png";

function App() {
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // New state
  const [showNavbarDropdown, setShowNavbarDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (category) => {
    setCategory(category);
    setSearchTerm("");
    setSearchInput(""); //  Reset search input
    setShowNavbarDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setCategory(""); // Clear category
    setSearchTerm(searchInput); // ✅ Use controlled input value
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-4 py-3 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <img src={logo} alt="Logo" className="w-20 h-10" />
          </a>

          {/* Hamburger for small screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            ☰
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNavbarDropdown(!showNavbarDropdown)}
                className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
              >
                Categories
              </button>
              {showNavbarDropdown && (
                <div className="absolute bg-white text-black shadow-md mt-2 rounded w-40 z-10">
                  {['world', 'business', 'technology', 'sports', 'entertainment'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search"
                value={searchInput} // ✅ Controlled input
                onChange={(e) => setSearchInput(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400 text-black"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-4 lg:hidden">
            <div className="bg-gray-800 p-3 rounded">
              <div className="grid grid-cols-2 gap-2">
                {['world', 'business', 'technology', 'sports', 'entertainment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search"
                value={searchInput} // ✅ Controlled input
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-grow px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400 text-black"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col sm:flex-row gap-4">
        {/* Breaking News Sidebar */}
        <aside className="w-full sm:w-1/3 lg:w-1/4">
          <BreakingNewsTicker />
        </aside>

        {/* News Cards */}
        <section className="w-full sm:w-2/3 lg:w-3/4">
          <NewsList category={category} searchTerm={searchTerm} />
        </section>
      </div>
    </>
  );
}

export default App;

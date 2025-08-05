import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faSun, faMoon, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const MainHeader = ({ open, setOpen, showTopHeader, setShowTopHeader }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const toggleMenu = () => {
    setOpen(!open);
  };

  const toggleTopHeader = () => {
    setShowTopHeader(!showTopHeader);
  };

  return (
    <div className="w-full py-6 bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950 shadow-xl lg:hidden fixed top-0 left-0 right-0 z-[250] border-b-2 border-blue-200 dark:border-blue-800 transition-all duration-500 backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-green-100/20 dark:from-blue-900/20 dark:to-emerald-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 dark:from-blue-400 dark:via-green-400 dark:to-yellow-400"></div>
      
      <div className="relative flex items-center justify-between px-4">
        {/* Left: Hamburger Menu Button */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            open
              ? isDarkMode
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
              : isDarkMode
              ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg"
              : "bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 shadow-lg border border-gray-200"
          }`}
          onClick={toggleMenu}
        >
          <FontAwesomeIcon
            icon={open ? faTimes : faBars}
            className={`text-lg transition-all duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {/* Center: Title Section */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex flex-col items-center group transition-transform duration-300 hover:scale-105">
            <span className={`text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-300 via-green-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg"
                : "bg-gradient-to-r from-blue-700 via-green-700 to-yellow-600 bg-clip-text text-transparent drop-shadow-md"
            }`}>
              Roster Hub
            </span>
            <span className={`text-xs font-medium tracking-wide ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Team Management
            </span>
          </Link>
          
          {/* Dropdown Icon for TopHeader - Only visible on small screens */}
          <button
            className={`mt-3 lg:hidden px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg ${
              showTopHeader
                ? isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border border-blue-400"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border border-blue-300"
                : isDarkMode
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-gray-200 hover:text-white border border-gray-500"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 hover:text-gray-900 border border-gray-400"
            }`}
            onClick={toggleTopHeader}
            aria-label={showTopHeader ? "Hide navigation" : "Show navigation"}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={showTopHeader ? faChevronUp : faChevronDown}
                className={`text-sm transition-all duration-300 ${showTopHeader ? 'rotate-180' : 'rotate-0'}`}
              />
              <span className="text-xs font-medium">
                {showTopHeader ? "Hide Menu" : "Show Menu"}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Theme Toggle Button */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 shadow-lg"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg"
          }`}
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <FontAwesomeIcon
            icon={isDarkMode ? faSun : faMoon}
            className="text-lg transition-all duration-300 hover:rotate-0 hover:scale-110 active:scale-95"
          />
        </button>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-green-400 opacity-60"></div>
    </div>
  );
};

export default MainHeader;
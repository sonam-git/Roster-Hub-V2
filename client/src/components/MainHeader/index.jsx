import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const MainHeader = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full text-center py-4 bg-gray-100 dark:bg-gray-600 shadow-md md:hidden sticky top-0 z-50">
      <Link to="/" className="inline-flex items-center space-x-2">
        <img src={isDarkMode ? darkLogo : lightLogo} alt="logo" className="h-12" />
        <span className="text-lg font-semibold dark:text-white">Roster Hub</span>
      </Link>
      {/* Dark/Light mode toggle for small screens */}
      <button
        onClick={toggleDarkMode}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white dark:bg-gray-700 shadow hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}
      >
        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-xl text-yellow-500 dark:text-gray-200" />
      </button>
    </div>
  );
};

export default MainHeader;

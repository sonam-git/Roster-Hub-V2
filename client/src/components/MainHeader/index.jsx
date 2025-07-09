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
    <div className="w-full text-center py-4 bg-gradient-to-r from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 shadow-lg md:hidden sticky top-0 z-50 border-b border-green-200 dark:border-green-800 transition-colors duration-300">
      <Link to="/" className="inline-flex items-center space-x-3">
        <img src={isDarkMode ? darkLogo : lightLogo} alt="logo" className={
          `h-16 w-16 rounded-full border-2 shadow p-1 transition ` +
          (isDarkMode
            ? "border-blue-400 bg-gray-900 ring-4 ring-gray-800"
            : "border-green-500 bg-white ring-4 ring-white")
        } />
        <span className={
          isDarkMode
            ? "text-xl font-extrabold tracking-tight bg-gradient-to-r from-green-300 via-blue-400 to-yellow-200 bg-clip-text text-transparent drop-shadow"
            : "text-xl font-extrabold tracking-tight text-green-700 drop-shadow "
        }>
          Roster Hub
        </span>
      </Link>
      {/* Dark/Light mode toggle for small screens */}
      <button
        onClick={toggleDarkMode}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white dark:bg-gray-700 shadow-lg hover:bg-green-100 dark:hover:bg-blue-900 border border-green-200 dark:border-blue-800 transition-colors"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}
      >
        <FontAwesomeIcon
          icon={isDarkMode ? faSun : faMoon}
          className={
            isDarkMode
              ? "text-2xl text-white drop-shadow"
              : "text-2xl text-gray-800 drop-shadow"
          }
        />
      </button>
    </div>
  );
};

export default MainHeader;

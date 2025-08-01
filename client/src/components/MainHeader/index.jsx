import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const MainHeader = ({ open, setOpen }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div className="w-full py-6 bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950 shadow-xl md:hidden fixed top-0 left-0 right-0 z-[250] border-b-2 border-blue-200 dark:border-blue-800 transition-all duration-500 backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-green-100/20 dark:from-blue-900/20 dark:to-emerald-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 dark:from-blue-400 dark:via-green-400 dark:to-yellow-400"></div>
      
      <div className="relative flex items-center justify-between px-6">
        {/* Logo Section - Hidden on small screens */}
        <div className="relative hidden">
          <img 
            src={isDarkMode ? darkLogo : lightLogo} 
            alt="Roster Hub Logo" 
            className={`h-14 w-14 rounded-full border-3 shadow-lg p-1 transition-all duration-300 ${
              isDarkMode
                ? "border-blue-400 bg-gray-800 ring-4 ring-blue-500/30 shadow-blue-500/50"
                : "border-green-500 bg-white ring-4 ring-green-500/30 shadow-green-500/50"
            }`}
          />
          {/* Animated pulse ring */}
          <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-30 ${
            isDarkMode ? "border-blue-400" : "border-green-500"
          }`}></div>
        </div>

        {/* Left side: Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white focus:ring-gray-400/50 shadow-lg shadow-gray-500/30"
              : "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-100 text-gray-800 focus:ring-gray-400/50 shadow-lg shadow-gray-400/30"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <FontAwesomeIcon
            icon={open ? faTimes : faBars}
            className="text-lg transition-transform duration-300"
          />
        </button>

        {/* Center: Title Section */}
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

        {/* Right side: Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`relative p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 focus:outline-none focus:ring-4 ${
            isDarkMode
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 focus:ring-yellow-400/50 shadow-lg shadow-yellow-500/30"
              : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white focus:ring-blue-400/50 shadow-lg shadow-blue-500/30"
          }`}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {/* Background glow effect */}
          <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
            isDarkMode ? "bg-yellow-400" : "bg-blue-500"
          }`}></div>
          
          <FontAwesomeIcon
            icon={isDarkMode ? faSun : faMoon}
            className="relative text-lg transition-transform duration-300 hover:rotate-180"
          />
          
          {/* Animated pulse effect */}
          <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${
            isDarkMode ? "border-yellow-300/50" : "border-blue-300/50"
          }`}></div>
        </button>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-green-400 opacity-60"></div>
    </div>
  );
};

export default MainHeader;
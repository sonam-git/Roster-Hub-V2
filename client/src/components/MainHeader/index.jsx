import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";

const MainHeader = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full text-center py-4 dark:bg-gray-600 shadow-md md:hidden sticky top-0 z-50">
      <Link to="/" className="inline-flex items-center space-x-2">
        <img src={isDarkMode ? darkLogo : lightLogo} alt="logo" className="h-12" />
        <span className="text-lg font-semibold dark:text-white">Roster Hub</span>
      </Link>
    </div>
  );
};

export default MainHeader;

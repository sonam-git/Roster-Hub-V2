import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { 
  HiBars3, 
  HiXMark, 
  HiSun, 
  HiMoon, 
  HiChevronDown, 
  HiChevronUp 
} from "react-icons/hi2";

const MainHeader = ({ open, setOpen }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Status Bar Safe Area - Only on mobile */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[301] transition-colors duration-500 ${
        isDarkMode 
          ? "bg-gradient-to-r from-gray-900 via-blue-950 to-emerald-950" 
          : "bg-gradient-to-r from-blue-50 via-white to-green-50"
      }`} style={{ height: 'env(safe-area-inset-top, 20px)' }}>
        {/* Optional gradient decoration */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 dark:from-blue-400 dark:via-green-400 dark:to-yellow-400"></div>
      </div>
      
      <div className={`w-full py-6 bg-gradient-to-r from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-emerald-950 shadow-xl lg:hidden fixed left-0 right-0 z-[300] border-b-2 border-blue-200 dark:border-blue-800 transition-all duration-500 backdrop-blur-sm ${
        'top-0'
      }`} style={{ top: 'env(safe-area-inset-top, 20px)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-green-100/20 dark:from-blue-900/20 dark:to-emerald-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 dark:from-blue-400 dark:via-green-400 dark:to-yellow-400"></div>
      
      <div className="relative flex items-center justify-between px-4">
        {/* Left: Hamburger Menu Button */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-all duration-500 ease-out transform hover:scale-110 active:scale-95 will-change-transform ${
            open
              ? isDarkMode
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg scale-105"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg scale-105"
              : isDarkMode
              ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg scale-100"
              : "bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 shadow-lg border border-gray-200 scale-100"
          }`}
          onClick={toggleMenu}
        >
          {open ? (
            <HiXMark className={`text-2xl transition-all duration-500 ease-out rotate-180 scale-110`} />
          ) : (
            <HiBars3 className={`text-2xl transition-all duration-500 ease-out rotate-0 scale-100`} />
          )}
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
        </div>

        {/* Right: Theme Toggle Button */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-all duration-500 ease-out transform hover:scale-110 active:scale-95 ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 shadow-lg"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg"
          }`}
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <HiSun className="text-2xl transition-all duration-500 ease-out hover:rotate-0 hover:scale-110 active:scale-95" />
          ) : (
            <HiMoon className="text-2xl transition-all duration-500 ease-out hover:rotate-0 hover:scale-110 active:scale-95" />
          )}
        </button>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-green-400 opacity-60"></div>
    </div>
    </>
  );
};

export default MainHeader;
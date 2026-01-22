// src/components/Hero.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaTrophy, 
  FaChartLine 
} from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";


const Hero = () => {
  
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="relative overflow-hidden min-h-screen">
 

      {/* Theme Toggle Button - Fixed in top right */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          // Sun icon for light mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col justify-center">
        {/* Top Section: Logo and Title */}
        <div className={`text-center mb-12 transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Logo */}
          <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60">
            <img
              src={isDarkMode ? "/RH-Logo.png" : "/RH-Logo-Light.png"}
              alt="RosterHub Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Title and tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
            RosterHub
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Streamline your team management and player coordination
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-gray-50 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px] border border-blue-700"
          >
            Create new team
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gray-50 dark:bg-gray-800.  text-blue-600 dark:text-blue-600 border border-gray-300 dark:border-gray-600 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px] hover:bg-blue-600 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Sign in
          </button>
        </div>

        {/* Feature Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto transition-all duration-700 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Team Management */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Team Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Create detailed player profiles, track skills, and manage your team roster with ease.
            </p>
          </div>

          {/* Performance Analytics */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <FaChartLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Performance Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Track player progress with advanced metrics, ratings, and detailed performance reports.
            </p>
          </div>

          {/* Game Scheduling */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <FaTrophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Game Scheduling
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Schedule matches, track scores, and celebrate victories with comprehensive game management.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
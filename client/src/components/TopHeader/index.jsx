import React, { useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation,Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faCalendarAlt, faPlus, faInbox, faStar, faHome, faInfoCircle, faMoon, faSun, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import controlImage from "../../assets/images/iconizer-arrow-left.png";
import Auth from "../../utils/auth";
import { FaChevronDown } from "react-icons/fa";
// import lightLogo from "../../assets/images/roster-hub-logo.png";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";

const BUTTONS = [
  { key: "home", label: "Home", icon: faHome, path: "/" },
  { key: "gameschedule", label: "Upcoming", icon: faCalendarAlt, path: "/games-shortcut" },
   { key: "roster", label: "Roster", icon: faPersonRunning, action: "roster" },
  { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-schedule#create" },
 { key: "search", label: "Search", icon: faSearch, action: "search", path: "/game-search" },
  { key: "messages", label: "Inbox", icon: faInbox, path: "/message" },
  { key: "skilllist", label: "Skills", icon: faStar, path: "/skills-shortcut" },
  { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
];

export default function TopHeader({ className, onToggleMenu, open, isVisible = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profilesData } = useQuery(QUERY_PROFILES);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const isLoggedIn = Auth.loggedIn();
  const [showRosterDropdown, setShowRosterDropdown] = React.useState(false);
  const rosterBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showRosterDropdown && rosterBtnRef.current) {
      const rect = rosterBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showRosterDropdown]);

  useEffect(() => {
    if (!showRosterDropdown) return;
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        rosterBtnRef.current &&
        !rosterBtnRef.current.contains(e.target)
      ) {
        setShowRosterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showRosterDropdown]);

  return (
    <div className={`w-full flex flex-col md:flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 py-2 shadow-md sticky z-[10] px-2 sm:px-4 ${isVisible ? 'top-44 lg:top-0' : 'top-0'} ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Logo and Title (always visible, beautiful UI) */}
      <Link
        to={"/"}
        className="hidden md:flex items-center gap-3 no-underline group"
        style={{ textDecoration: "none" }}
      >
        <div className="flex items-center gap-3 w-full md:w-auto justify-center py-1 px-2">
          <div className="relative flex items-center justify-center">
            <img
              src={isDarkMode ? darkLogo : lightLogo}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl shadow-lg border-2 border-blue-400/30 bg-gradient-to-br from-blue-100/60 to-purple-100/40 dark:from-blue-900/40 dark:to-purple-900/30 drop-shadow-xl transition-all duration-500"
              alt="logo"
              style={{ objectFit: 'contain', background: 'transparent' }}
            />
            {/* Animated ring effect */}
            <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 dark:border-purple-400/40 opacity-30 animate-pulse pointer-events-none"></span>
          </div>
          <div className={`flex flex-col transition-all duration-300 overflow-hidden ${
            open 
              ? "opacity-100 translate-x-0 w-auto ml-3 lg:ml-0" 
              : "opacity-0 -translate-x-4 w-0 ml-0"
          }`}>
            <h1 className={`font-oswald font-bold text-lg sm:text-xl transition-colors duration-200 whitespace-nowrap tracking-wide ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              ROSTERHUB
            </h1>
            <p className={`text-xs whitespace-nowrap font-oswald tracking-wider ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              TEAM MANAGEMENT
            </p>
          </div>
        </div>
      </Link>
      {/* Center: Menu buttons or promo text */}
      <div className={`flex flex-row items-center justify-center flex-1 w-full md:w-auto mt-4 md:mt-0`}>
        {isLoggedIn ? (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 md:justify-center md:flex-wrap">
              {BUTTONS.map(btn => {
                if (btn.key === "roster") {
                  return (
                    <div key={btn.key} className="relative flex-shrink-0">
                      <button
                        ref={rosterBtnRef}
                        className={`flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl min-w-[80px] sm:min-w-0 justify-center backdrop-blur-sm ${
                          isDarkMode
                            ? "bg-gradient-to-br from-gray-800/80 to-gray-700/80 hover:from-gray-700/90 hover:to-gray-600/90 text-gray-200 shadow-gray-800/50 hover:shadow-gray-700/70"
                            : "bg-gradient-to-br from-white/90 to-gray-50/90 hover:from-gray-50/95 hover:to-gray-100/95 text-gray-700 shadow-gray-200/50 hover:shadow-gray-300/70"
                        }`}
                        onClick={() => setShowRosterDropdown((prev) => !prev)}
                      >
                        <FontAwesomeIcon icon={btn.icon} className="text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm font-oswald font-bold tracking-wide truncate">{btn.label.toUpperCase()}</span>
                        <FaChevronDown 
                          className={`text-xs sm:text-sm transition-transform duration-200 ${
                            showRosterDropdown ? 'rotate-180' : 'rotate-0'
                          }`} 
                        />
                      </button>
                    </div>
                  );
                }
                
                return (                <button
                  key={btn.key}
                  className={`flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex-shrink-0 min-w-[80px] sm:min-w-0 justify-center backdrop-blur-sm mb-1 md:mb-0 ${
                    location.pathname === btn.path.split('#')[0] 
                      ? isDarkMode
                        ? "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
                        : "bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
                      : isDarkMode
                        ? "bg-gradient-to-br from-gray-800/80 to-gray-700/80 hover:from-gray-700/90 hover:to-gray-600/90 text-gray-200 shadow-gray-800/50 hover:shadow-gray-700/70"
                        : "bg-gradient-to-br from-white/90 to-gray-50/90 hover:from-gray-50/95 hover:to-gray-100/95 text-gray-700 shadow-gray-200/50 hover:shadow-gray-300/70"
                  }`}
                  onClick={() => {
                    if (btn.action === "search") {
                      // Navigate to dedicated game search page
                      navigate("/game-search");
                    } else if (btn.key === "creategame") {
                      navigate("/game-schedule", { state: { showCreateGame: true } });
                    } else {
                      navigate(btn.path);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={btn.icon} className="text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm font-oswald font-bold tracking-wide truncate">{btn.label.toUpperCase()}</span>
                </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full  flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 py-0.5 rounded-2xl shadow-2xl border-2 border-blue-300 dark:border-blue-900 relative">
            <span className="animate-marquee whitespace-nowrap  text-lg sm:text-xl md:text-2xl font-bold tracking-wide px-2 sm:px-4 py-1 rounded-2xl flex items-center gap-4 bg-gradient-to-r from-green-100 via-green-200 to-green-300 dark:text-white dark:bg-gray-800" style={{ fontFamily: 'sans-serif', letterSpacing: '0.04em', boxShadow: '0 4px 24px rgba(59,130,246,0.15)' }}>
              <FontAwesomeIcon icon={faPersonRunning} className="text-green-500 text-2xl sm:text-3xl md:text-4xl drop-shadow-lg animate-spin-slow" />
              <span className="text-blue-700 font-bold" style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '1.3rem', textShadow: 'none' }}>
                Roster Hub
              </span>
              <span className="text-gray-800  font-medium text-base sm:text-lg md:text-xl italic" style={{ fontFamily: 'sans-serif', textShadow: 'none' }}>
                — Create your team's hub with us. Join Roster Hub Today!
              </span>
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-2xl sm:text-3xl md:text-4xl drop-shadow-lg animate-pulse" />
            </span>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 10s linear infinite;
              }
              @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .animate-spin-slow {
                animation: spin-slow 6s linear infinite;
              }
              .animate-pulse {
                animation: pulse 1.5s infinite;
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        )}
      </div>
      {/* Roster Dropdown (fixed position, outside scrolling container) */}
      {showRosterDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] shadow-2xl border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 bg-white/95 dark:bg-gray-800/95 w-72 max-w-[90vw] md:max-w-sm"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-50%)",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-3 sm:px-4 py-2 sm:py-3 border-b border-blue-300 dark:border-blue-500">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-oswald font-semibold tracking-wide text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <FontAwesomeIcon icon={faPersonRunning} className="text-blue-100 text-xs sm:text-sm" />
                TEAM ROSTER
              </h3>
            </div>
            <p className="text-blue-100 text-xs mt-0.5 sm:mt-1">
              {profilesData?.profiles?.length || 0} team members
            </p>
          </div>
          {/* Player List */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto">
            {profilesData?.profiles?.length > 0 ? (
              <ul className="py-1 sm:py-2">
                {profilesData.profiles.map((player) => (
                  <li key={player._id}>
                    <button
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white font-medium flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      onClick={() => {
                        setShowRosterDropdown(false);
                        navigate(`/profiles/${player._id}`);
                      }}
                    >
                      <div className="relative">
                        {player.profilePic ? (
                          <img 
                            src={player.profilePic} 
                            alt={`${player.name}'s avatar`} 
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-colors" 
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-colors">
                            <FontAwesomeIcon 
                              icon={faPersonRunning} 
                              className="text-white text-sm sm:text-base" 
                            />
                          </div>
                        )}
                        {/* Online indicator */}
                        {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {Auth.loggedIn() && Auth.getProfile().data._id === player._id ? "You" : player.name}
                        </p>
                        {player.position && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {player.position}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full font-medium">
                            You
                          </span>
                        )}
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <FontAwesomeIcon icon={faPersonRunning} className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No team members found</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                setShowRosterDropdown(false);
                navigate('/roster');
              }}
              className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <span>View Full Roster</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Right: Dark/Light mode toggle and sidebar toggle (arrow always visible) */}
      <div className="hidden md:flex items-center ml-4 gap-2">
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 bg-gray-100 dark:bg-gray-600 shadow hover:bg-gray-600 dark:hover:bg-gray-400 transition-colors"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-xl text-yellow-500 dark:text-gray-200" />
        </button>
        {/* Sidebar toggle controller - always visible */}
        <img
          src={controlImage}
          className={`hidden lg:block cursor-pointer w-6 md:w-8 lg:w-10 border-dark-blue border-2 rounded-full bg-white transition-transform duration-300 ml-2 ${open ? '' : 'rotate-180'}`}
          style={{ marginTop: 2 }}
          onClick={onToggleMenu}
          alt="toggle menu"
        />
      </div>
    </div>
  );
}
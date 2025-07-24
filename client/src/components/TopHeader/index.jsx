import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faCalendarAlt, faPlus, faInbox, faStar, faHome, faInfoCircle, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import controlImage from "../../assets/images/iconizer-arrow-left.png";
import Auth from "../../utils/auth";
import { FaChevronDown } from "react-icons/fa";

const BUTTONS = [
  { key: "home", label: "Home", icon: faHome, path: "/" },
  { key: "gameschedule", label: "Schedule", icon: faCalendarAlt, path: "/games-shortcut" },
  { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-schedule#create" },
  { key: "messages", label: "Inbox", icon: faInbox, path: "/message" },
  { key: "skilllist", label: "Skills", icon: faStar, path: "/skills-shortcut" },
  { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
];

export default function TopHeader({ className, onToggleMenu, open }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useQuery(QUERY_ME);
  const { data: profilesData } = useQuery(QUERY_PROFILES);
  const username = data?.me?.name || "Player";
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const isLoggedIn = Auth.loggedIn();
  const [showRosterDropdown, setShowRosterDropdown] = React.useState(false);

  return (
    <div className={`w-full flex flex-col sm:flex-row items-center justify-between bg-gray-200 dark:bg-gray-800 py-2 shadow-md sticky top-0 lg:z-[60] px-4 ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Username and soccer icon (only if logged in) */}
      <div className={`hidden sm:flex items-center space-x-2 mb-2 sm:mb-0 w-full sm:w-auto justify-center${isLoggedIn ? '' : ' invisible'}`}>
        <FontAwesomeIcon icon={faPersonRunning} className="ml-2 text-blue-800 dark:text-gray-200 text-2xl" />
        <span className="font-extrabold text-2xl italic tracking-wide text-gray-800 dark:text-white drop-shadow-md flex items-center gap-2" style={{ fontFamily: 'cursive, sans-serif' }}>
          {username}
        </span>
      </div>
      {/* Center: Menu buttons or promo text */}
      <div className={`flex flex-row  flex-wrap sm:flex-nowrap items-center justify-center flex-1 w-full sm:w-auto gap-y-2`}> 
        {isLoggedIn ? (
          <>
            {BUTTONS.map(btn => (
              <button
                key={btn.key}
                className={`dark:text-gray-900 mx-2 px-4 py-1 rounded-full font-semibold transition-colors text-sm flex items-center gap-2  sm:mb-0 ${location.pathname === btn.path.split('#')[0] ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-500 text-gray-800 dark:text-white  hover:bg-gray-300 dark:hover:bg-blue-800 hover:bg-opacity-90 dark:hover:bg-opacity-90"}`}
                onClick={() => {
                  if (btn.key === "creategame") {
                    navigate("/game-schedule", { state: { showCreateGame: true } });
                  } else {
                    navigate(btn.path);
                  }
                }}
              >
                <FontAwesomeIcon icon={btn.icon} className="mr-1" />
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
            {/* Roster Dropdown */}
            <div className="relative">
              <button
                className={`mx-2 px-4 py-1 rounded-full font-semibold transition-colors text-sm flex items-center gap-2 bg-gray-100 dark:bg-gray-500 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-blue-800 hover:bg-opacity-90 dark:hover:bg-opacity-90`}
                onClick={() => setShowRosterDropdown((prev) => !prev)}
              >
                <FontAwesomeIcon icon={faPersonRunning} className="mr-1" />
                <span className="hidden sm:inline">Roster</span>
                <FaChevronDown className="ml-2" />
              </button>
              {showRosterDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-gray-100 dark:bg-gray-600 border border-blue-200 dark:border-gray-700 rounded-xl shadow-lg z-80">
                  <ul className="py-2">
                    {profilesData?.profiles?.map((player) => (
                      <li key={player._id}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-900 dark:text-white font-semibold flex items-center gap-2"
                          onClick={() => {
                            setShowRosterDropdown(false);
                            navigate(`/profiles/${player._id}`);
                          }}
                        >
                          {player.profilePic ? (
                            <img src={player.profilePic} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
                          ) : (
                            <FontAwesomeIcon icon={faPersonRunning} className="w-6 h-6 mr-2 text-gray-600 dark:text-white" />
                          )}
                          {Auth.loggedIn() && Auth.getProfile().data._id === player._id ? "You" : player.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 py-0.5 rounded-2xl shadow-2xl border-2 border-blue-300 dark:border-blue-900 relative">
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

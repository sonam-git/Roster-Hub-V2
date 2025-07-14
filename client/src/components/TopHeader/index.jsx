import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faCalendarAlt, faPlus, faInbox, faStar, faHome, faInfoCircle, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import controlImage from "../../assets/images/iconizer-arrow-left.png";
import Auth from "../../utils/auth";

const BUTTONS = [
  { key: "home", label: "Home", icon: faHome, path: "/" },
  { key: "gameschedule", label: "Game Schedule", icon: faCalendarAlt, path: "/games-shortcut" },
  { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-schedule#create" },
  { key: "inbox", label: "Inbox", icon: faInbox, path: "/message" },
  { key: "skilllist", label: "Skills", icon: faStar, path: "/skills-shortcut" },
  { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
];

export default function TopHeader({ className, onToggleMenu, open }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useQuery(QUERY_ME);
  const username = data?.me?.name || "Player";
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const isLoggedIn = Auth.loggedIn();
  return (
    <div className={`w-full flex flex-col sm:flex-row items-center justify-between bg-gray-200 dark:bg-gray-800 py-2 shadow-md sticky top-0 lg:z-[60] px-4 ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Username and soccer icon (only if logged in) */}
      <div className={`hidden sm:flex items-center space-x-2 mb-2 sm:mb-0 w-full sm:w-auto justify-center${isLoggedIn ? '' : ' invisible'}`}>
        <FontAwesomeIcon icon={faPersonRunning} className="ml-2 text-green-500 text-2xl" />
        <span className="font-extrabold text-2xl italic tracking-wide text-gray-800 dark:text-white drop-shadow-md flex items-center gap-2" style={{ fontFamily: 'cursive, sans-serif' }}>
          {username}
        </span>
      </div>
      {/* Center: Menu buttons or promo text */}
      <div className={`flex flex-row pt-4 flex-wrap sm:flex-nowrap items-center justify-center flex-1 w-full sm:w-auto gap-y-2`}> 
        {isLoggedIn ? (
          BUTTONS.map(btn => (
            <button
              key={btn.key}
              className={`dark:text-gray-900 mx-2 px-4 py-1 rounded-full font-semibold transition-colors text-sm flex items-center gap-2 mb-2 sm:mb-0 ${location.pathname === btn.path.split('#')[0] ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-blue-800 hover:bg-opacity-90 dark:hover:bg-opacity-90"}`}
              onClick={() => {
                if (btn.key === "creategame") {
                  navigate("/game-schedule", { state: { scrollTo: "gameform" } });
                } else {
                  navigate(btn.path);
                }
              }}
            >
              <FontAwesomeIcon icon={btn.icon} className="mr-1" />
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))
        ) : (
          <div className="w-full flex items-center justify-center overflow-hidden">
            <span className="animate-marquee whitespace-nowrap text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-blue-50 dark:bg-gray-700 shadow-lg flex items-center gap-2 sm:gap-4" style={{ fontFamily: 'cursive, sans-serif', letterSpacing: '0.04em' }}>
              <FontAwesomeIcon icon={faPersonRunning} className="text-green-500 text-xl sm:text-2xl md:text-3xl drop-shadow-lg" />
              <span className="text-blue-700 dark:text-blue-200" style={{ fontFamily: 'cursive, sans-serif', fontWeight: 900, fontSize: '1.2rem', textShadow: '0 2px 8px #60a5fa' }}>
                Roster Hub
              </span>
              <span className="text-gray-800 dark:text-gray-200 font-bold text-base sm:text-lg md:text-xl" style={{ fontFamily: 'serif' }}>
                - Create your team's hub with us. Join Roster Hub Today..!
              </span>
              <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xl sm:text-2xl md:text-3xl drop-shadow-lg" />
            </span>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 12s linear infinite;
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

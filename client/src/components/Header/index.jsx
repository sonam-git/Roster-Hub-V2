// src/components/Header.jsx

import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import chartFillImage from "../../assets/images/iconizer-home.png";
import chatImage from "../../assets/images/iconizer-message.png";
import skillImage from "../../assets/images/iconizer-skill.png";
import userImage from "../../assets/images/iconizer-account.png";
import rosterImage from "../../assets/images/iconizer-roster.png";
import logoutImage from "../../assets/images/iconizer-logout.png";
import loginImage from "../../assets/images/iconizer-login.png";
import signupImage from "../../assets/images/iconizer-signup.png";
import calenderImage from "../../assets/images/iconizer-calender.png";

const Header = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // 1) live message count
  const { data: meData } = useQuery(QUERY_ME, {
    pollInterval: 5000,
  });
  const messageCount = meData?.me?.receivedMessages?.length || 0;

  // 2) fetch all games to compute badges
  const { data: allGamesData } = useQuery(QUERY_GAMES, {
    fetchPolicy: "network-only",
  });
  const allGames = allGamesData?.games || [];

  // count pending and confirmed
  const pendingCount = allGames.filter((g) => g.status === "PENDING").length;
  const confirmedCount = allGames.filter((g) => g.status === "CONFIRMED").length;

  // total of those two
  const gameBadgeCount = pendingCount + confirmedCount;

  // handle logout
  const handleLogout = () => {
    navigate("/", {
      replace: true,
      state: { message: "Thank you for using Roster Hub!" },
    });
    Auth.logout();
  };

  const Menus = Auth.loggedIn()
    ? [
        { title: "Home", src: chartFillImage, path: "/" },
        { title: "My Profile", src: userImage, path: "/me" },
        { title: "Roster", src: rosterImage, path: "/roster" },
        { title: "Skill - List", src: skillImage, path: "/skill" },
        {
          title: "Message",
          src: chatImage,
          path: "/message",
          badge: messageCount,
        },
        {
          title: "Schedule",
          src: calenderImage,
          path: "/game-schedule",
          badge: gameBadgeCount,
        },
        { title: "ScoreBoard", src: skillImage, path: "/scoreboard" },
        { title: "Logout", src: logoutImage, action: handleLogout },
      ]
    : [
        { title: "Login", src: loginImage, path: "/login" },
        { title: "Signup", src: signupImage, path: "/signup" },
      ];

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={`flex min-h-screen  ${
        isDarkMode ? "bg-gray-50 text-gray-900" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Mobile horizontal auth buttons when not logged in */}
      {!Auth.loggedIn() && open && (
        <div className="sm:hidden fixed top-20 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-6 shadow-xl border-b border-gray-200 dark:border-gray-700 z-[200] mt-4">
          <div className="flex justify-center gap-3 px-4">
            <Link
              to="/"
              className={`group relative overflow-hidden px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:no-underline ${
                location.pathname === "/" 
                  ? isDarkMode
                    ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white ring-2 ring-gray-500 ring-offset-2 ring-offset-gray-900" 
                    : "bg-gradient-to-r from-gray-600 to-gray-700 text-white ring-2 ring-gray-400 ring-offset-2"
                  : isDarkMode
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-500"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">🏠</span>
                Home
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/login"
              className={`group relative overflow-hidden px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:no-underline ${
                location.pathname === "/login" 
                  ? isDarkMode
                    ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-2 ring-blue-400 ring-offset-2"
                  : isDarkMode
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">🔐</span>
                Login
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/signup"
              className={`group relative overflow-hidden px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:no-underline ${
                location.pathname === "/signup" 
                  ? isDarkMode
                    ? "bg-gradient-to-r from-green-700 to-green-800 text-white ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900" 
                    : "bg-gradient-to-r from-green-600 to-green-700 text-white ring-2 ring-green-400 ring-offset-2"
                  : isDarkMode
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border border-green-500"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">✨</span>
                Signup
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar - hidden on mobile when not logged in and menu is open */}
      <div
        className={`fixed lg:static top-0 left-0 h-full transition-all duration-300 ease-in-out z-50 ${
          open ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        } ${
          isDarkMode 
            ? "bg-gray-900 border-r border-gray-800" 
            : "bg-white border-r border-gray-200"
        } shadow-lg ${!Auth.loggedIn() && open ? 'hidden sm:block' : ''}`}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-hidden ">
          {/* Theme Toggle */}
          <div className="mb-6">
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center gap-1 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-2 border-gray-600" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-2 border-gray-300"
              } ${!open ? 'justify-center px-4 py-2' : 'px-4 py-2'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300  ${
                isDarkMode ? "bg-yellow-500" : "bg-indigo-500"
              }`}>
                <span className="text-white text-sm">
                  {isDarkMode ? "☀️" : "🌙"}
                </span>
              </div>
              
              {/* Smooth text transition */}
              <div className={`transition-all duration-300 overflow-hidden ${
                open 
                  ? "opacity-100 translate-x-0 w-auto" 
                  : "opacity-0 -translate-x-4 w-0"
              }`}>
                <span className="font-medium text-sm whitespace-nowrap">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </div>
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 mt-10 ">
            {Menus.map((Menu, index) => {
              const isActive = location.pathname === Menu.path;
              const isLogout = Menu.title === "Logout";
              
              return (
                <div key={index}>
                  {Menu.path ? (
                    <Link
                      to={Menu.path}
                      className="no-underline"
                      style={{ textDecoration: "none" }}
                      onClick={() => {
                        // Only close menu on mobile devices
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                    >
                      <div
                        className={`flex items-center gap-1 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                          !open ? 'px-4 py-2 justify-center' : 'px-4 py-2'
                        } ${
                          isLogout
                            ? `${
                                isDarkMode 
                                  ? "bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border-2 border-red-700" 
                                  : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-2 border-red-300"
                              }`
                            : isActive
                            ? `${
                                isDarkMode 
                                  ? "bg-blue-900/30 text-blue-300 border-3 border-gray-100" 
                                  : "bg-blue-600 text-white border-3 border-gray-800"
                              }`
                            : `${
                                isDarkMode 
                                  ? "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent" 
                                  : "hover:bg-gray-500 text-gray-600 hover:text-white border border-transparent"
                              }`
                        }`}
                      >
                        
                        {/* menu icon div */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300  ${
                          isLogout
                            ? isDarkMode ? "bg-red-800" : "bg-red-100"
                            : isActive
                            ? isDarkMode ? "bg-blue-100" : "bg-blue-200"
                            : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-gray-100 border border-gray-600 group-hover:bg-gray-400"
                        }`}>
                          <img
                            src={Menu.src}
                            alt={Menu.title}
                            className="w-4 h-4 opacity-80 transition-opacity duration-300 "
                          />
                        </div>
                        
                        {/* Smooth text and badge transition */}
                        <div className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-300 overflow-hidden ${
                          open 
                            ? "opacity-100 translate-x-0 w-auto" 
                            : "opacity-0 -translate-x-4 w-0"
                        }`}>
                          <span className="font-medium text-sm truncate whitespace-nowrap">
                            {Menu.title}
                          </span>
                          {Menu.badge > 0 && (
                            <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2 whitespace-nowrap">
                              {Menu.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (Menu.action) Menu.action();
                        // Only close menu on mobile devices
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-1 rounded-lg transition-all duration-300 group overflow-hidden ${
                        !open ? 'px-4 py-2 justify-center' : 'px-4 py-2'
                      } ${
                        isLogout
                          ? `${
                              isDarkMode 
                                ? "bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border-2 border-red-700" 
                                : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-2 border-red-300"
                            }`
                          : `${
                              isDarkMode 
                                ? "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent" 
                                : "hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent"
                            }`
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isLogout
                          ? isDarkMode ? "bg-red-800" : "bg-red-100"
                          : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <img
                          src={Menu.src}
                          alt={Menu.title}
                          className="w-4 h-4 opacity-80 transition-opacity duration-300"
                        />
                      </div>
                      
                      {/* Smooth text transition */}
                      <div className={`transition-all duration-300 overflow-hidden ${
                        open 
                          ? "opacity-100 translate-x-0 w-auto" 
                          : "opacity-0 -translate-x-4 w-0"
                      }`}>
                        <span className="font-medium text-sm whitespace-nowrap">
                          {Menu.title}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Mobile Menu Toggle */}
        <button
          className={`fixed top-4 left-4 lg:hidden p-3 rounded-2xl z-[250] transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            open
              ? isDarkMode
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl ring-2 ring-red-400 ring-offset-2 ring-offset-gray-900"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl ring-2 ring-red-300 ring-offset-2"
              : isDarkMode
              ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white border border-gray-600 shadow-lg"
              : "bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 border border-gray-200 shadow-lg"
          }`}
          onClick={toggleMenu}
        >
          <FontAwesomeIcon
            icon={open ? faTimes : faBars}
            className={`text-xl transition-all duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        {/* Mobile Overlay */}
        {open && Auth.loggedIn() && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default Header;
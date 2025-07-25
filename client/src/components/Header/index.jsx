// src/components/Header.jsx

import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

// import controlImage from "../../assets/images/iconizer-arrow-left.png";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";
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
          title: "Game - Schedule",
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
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-50 text-gray-900" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`fixed lg:static top-0 left-0 h-full transition-all duration-300 z-50 ${
          open ? "w-64" : "hidden lg:block lg:w-20"
        } ${
          isDarkMode 
            ? "bg-gray-900 border-r border-gray-800" 
            : "bg-white border-r border-gray-200"
        } shadow-lg`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            to={"/"}
            className="flex items-center gap-3 no-underline group"
            style={{ textDecoration: "none" }}
          >
            {/* Logo Image - Hidden on mobile, visible on desktop */}
            <div className="relative hidden lg:block">
              <img
                src={isDarkMode ? darkLogo : lightLogo}
                className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
                alt="RosterHub Logo"
              />
            </div>
            {/* Text Branding - Always visible when menu is open */}
            {open && (
              <div className="flex flex-col ml-12 lg:ml-0">
                <h1 className={`font-bold text-xl transition-colors duration-200 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  RosterHub
                </h1>
                <p className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Team Management
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          {/* Theme Toggle */}
          <div className="mb-6">
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-2 border-gray-600" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-2 border-gray-300"
              } ${!open ? 'justify-center px-3 py-2' : 'p-3'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-yellow-500" : "bg-indigo-500"
              }`}>
                <span className="text-white text-sm">
                  {isDarkMode ? "☀️" : "🌙"}
                </span>
              </div>
              {open && (
                <span className="font-medium text-sm">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
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
                        className={`flex items-center gap-3 rounded-lg transition-all duration-200 group relative ${
                          !open ? 'px-3 py-2 justify-center' : 'p-3'
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
                                  ? "bg-blue-900/30 text-blue-300 border-3 border-blue-500" 
                                  : "bg-blue-50 text-blue-700 border-3 border-blue-500"
                              }`
                            : `${
                                isDarkMode 
                                  ? "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent" 
                                  : "hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent"
                              }`
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isLogout
                            ? isDarkMode ? "bg-red-800" : "bg-red-100"
                            : isActive
                            ? isDarkMode ? "bg-blue-700" : "bg-blue-100"
                            : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                          <img
                            src={Menu.src}
                            alt={Menu.title}
                            className="w-4 h-4 opacity-80"
                          />
                        </div>
                        {open && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="font-medium text-sm truncate">
                              {Menu.title}
                            </span>
                            {Menu.badge > 0 && (
                              <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2">
                                {Menu.badge}
                              </span>
                            )}
                          </div>
                        )}
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
                      className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                        !open ? 'px-3 py-2 justify-center' : 'p-3'
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
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isLogout
                          ? isDarkMode ? "bg-red-800" : "bg-red-100"
                          : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <img
                          src={Menu.src}
                          alt={Menu.title}
                          className="w-4 h-4 opacity-80"
                        />
                      </div>
                      {open && (
                        <span className="font-medium text-sm">
                          {Menu.title}
                        </span>
                      )}
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
          className={`fixed top-4 left-4 lg:hidden p-2 rounded-lg z-50 transition-all duration-200 ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
          }`}
          onClick={toggleMenu}
        >
          <FontAwesomeIcon
            icon={open ? faTimes : faBars}
            className="text-lg"
          />
        </button>

        {/* Mobile Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default Header;

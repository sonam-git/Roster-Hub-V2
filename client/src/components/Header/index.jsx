// src/components/Header.jsx

import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import { 
  HiHome,
  HiUser,
  HiUserGroup,
  HiChatBubbleLeftRight,
  HiCalendarDays,
  HiTrophy,
  HiArrowRightOnRectangle,
  HiArrowLeftOnRectangle,
  HiUserPlus,
  HiSparkles,
  HiInformationCircle
} from "react-icons/hi2";

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
        { title: "Home", icon: HiHome, path: "/", hideOnMobile: true },
        { title: "My Profile", icon: HiUser, path: "/me" },
        { title: "Roster", icon: HiUserGroup, path: "/roster" },
        { title: "Skill - List", icon: HiSparkles, path: "/skill" },
        {
          title: "Message",
          icon: HiChatBubbleLeftRight,
          path: "/message",
          badge: messageCount,
        },
        {
          title: "Schedule",
          icon: HiCalendarDays,
          path: "/game-schedule",
          badge: gameBadgeCount,
        },
        { title: "ScoreBoard", icon: HiTrophy, path: "/scoreboard" },
        // { title: "About", icon: HiInformationCircle, path: "/about" },
        { title: "Logout", icon: HiArrowRightOnRectangle, action: handleLogout },
      ]
    : [
        { title: "Login", icon: HiArrowLeftOnRectangle, path: "/login" },
        { title: "Signup", icon: HiUserPlus, path: "/signup" },
      ];

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-100 text-gray-900" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Mobile horizontal auth buttons when not logged in */}
      {!Auth.loggedIn() && open && (
        <div className="lg:hidden fixed left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl py-4 shadow-2xl border-b border-gray-200 dark:border-gray-700 z-[50]" 
             style={{ top: 'calc(env(safe-area-inset-top, 20px) + 120px)' }}>
          <div className="flex flex-row gap-1 px-2">
            <Link
              to="/"
              className={`group relative overflow-hidden px-2 py-2 font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-lg hover:no-underline flex-1 text-center ${
                location.pathname === "/" 
                  ? isDarkMode
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-1 ring-blue-400" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-1 ring-blue-300"
                  : isDarkMode
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white border border-gray-500"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white border border-gray-400"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-1">
                <span className="text-sm">🏠</span>
                <span className="text-xs font-semibold">Home</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/login"
              className={`group relative overflow-hidden px-2 py-2 font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-lg hover:no-underline flex-1 text-center ${
                location.pathname === "/login" 
                  ? isDarkMode
                     ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-1 ring-blue-400" 
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-1 ring-emerald-300"
                  : isDarkMode
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border border-emerald-500"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border border-emerald-400"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-1">
                <span className="text-sm">🔐</span>
                <span className="text-xs font-semibold">Login</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/signup"
              className={`group relative overflow-hidden px-2 py-2 font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-lg hover:no-underline flex-1 text-center ${
                location.pathname === "/signup" 
                  ? isDarkMode
                   ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-1 ring-blue-400" 
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-1 ring-blue-300"
                  : isDarkMode
                    ? "bg-gradient-to-r from-purple-600 to-emerald-700 hover:from-purple-500 hover:to-emerald-600 text-white border border-emerald-500"
                    : "bg-gradient-to-r from-purple-600 to-emerald-700 hover:from-purple-500 hover:to-emerald-600 text-white border border-emerald-400"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-1">
                <span className="text-sm">✨</span>
                <span className="text-xs font-semibold">SignUp</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {open && Auth.loggedIn() && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-[4] transition-all duration-500 ease-out animate-in fade-in"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Amazon-style Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-500 ease-out z-[5] pt-10 lg:pt-30 transform-gpu will-change-transform ${
          open ? "w-64 sm:w-72 translate-x-0 opacity-100" : "w-16 sm:w-20 -translate-x-full lg:translate-x-0 opacity-100 lg:opacity-100"
        } ${
          isDarkMode 
            ? "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-700" 
            : "bg-gray-100 border-r border-gray-300"
        } shadow-2xl ${!Auth.loggedIn() && open ? 'hidden lg:block' : ''}`}
        style={{
          transformOrigin: 'left center',
        }}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 px-2 sm:px-4 overflow-hidden py-2 mt-2">
          {/* Menu Items */}
          <div className="space-y-1">
            {/* Theme Toggle - styled like other menu items */}
            <div>
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center ${!open ? 'gap-0 justify-center' : 'gap-3'} rounded-lg transition-all duration-300 group relative overflow-hidden ${
                  !open ? 'px-2 py-2' : 'px-3 py-2.5'
                } ${
                  isDarkMode 
                    ? "hover:bg-gray-800 text-gray-300 hover:text-white border border-transparent" 
                    : "hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-transparent"
                }`}
              >
                {/* Theme icon div */}
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-white border border-gray-300 group-hover:bg-gray-50"
                }`}>
                  <span className="text-sm sm:text-lg">
                    {isDarkMode ? "☀️" : "🌙"}
                  </span>
                </div>
                
                {/* Smooth text transition */}
                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                  open 
                    ? "opacity-100 translate-x-0 w-auto" 
                    : "opacity-0 -translate-x-4 w-0"
                }`}>
                  <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                    {isDarkMode ? "Light Theme" : "Dark Theme"}
                  </span>
                </div>
              </button>
            </div>
            
            {/* Divider after theme toggle */}
            {open && Auth.loggedIn() && (
              <div className={`my-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
            )}
            
            {Menus.map((Menu, index) => {
              const isActive = location.pathname === Menu.path;
              const isLogout = Menu.title === "Logout";
              
              // Skip rendering if hideOnMobile is true and screen is mobile (< lg breakpoint)
              const shouldHideOnMobile = Menu.hideOnMobile;
              
              return (
                <div key={index} className={shouldHideOnMobile ? "hidden lg:block" : ""}>
                  {/* Divider before each menu item (except first one) */}
                  {index > 0 && open && (
                    <div className={`my-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
                  )}
                  
                  {/* Additional divider before logout for extra separation */}
                  {isLogout && open && (
                    <div className={`my-3 border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-400'}`}></div>
                  )}
                  
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
                        className={`flex items-center ${!open ? 'gap-0 justify-center' : 'gap-3'} rounded-lg transition-all duration-300 group relative overflow-hidden ${
                          !open ? 'px-2 py-2' : 'px-3 py-2.5'
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
                                  : "hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-transparent"
                              }`
                        }`}
                      >
                        
                        {/* menu icon div */}
                        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300  ${
                          isLogout
                            ? isDarkMode ? "bg-red-800" : "bg-red-100"
                            : isActive
                            ? isDarkMode ? "bg-gray-700 border-2 border-blue-400" : "bg-white border-2 border-blue-500"
                            : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-white border border-gray-300 group-hover:bg-gray-50"
                        }`}>
                          <Menu.icon className={`w-3 h-3 sm:w-4 sm:h-4 transition-opacity duration-300 ${
                            isLogout
                              ? isDarkMode ? "text-red-200" : "text-red-600"
                              : isActive
                              ? isDarkMode ? "text-blue-400" : "text-blue-600"
                              : isDarkMode ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-gray-700"
                          }`} />
                        </div>
                        
                        {/* Smooth text and badge transition */}
                        <div className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-500 ease-out overflow-hidden ${
                          open 
                            ? "opacity-100 translate-x-0 w-auto" 
                            : "opacity-0 -translate-x-4 w-0"
                        }`}>
                          <span className="font-medium text-xs sm:text-sm truncate whitespace-nowrap">
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
                      className={`w-full flex items-center ${!open ? 'gap-0 justify-center' : 'gap-3'} rounded-lg transition-all duration-300 group overflow-hidden ${
                        !open ? 'px-2 py-2' : 'px-3 py-2.5'
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
                                : "hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-transparent"
                            }`
                      }`}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isLogout
                          ? isDarkMode ? "bg-red-800" : "bg-red-100"
                          : isDarkMode ? "bg-gray-700 group-hover:bg-gray-600" : "bg-white border border-gray-300 group-hover:bg-gray-50"
                      }`}>
                        <Menu.icon className={`w-3 h-3 sm:w-4 sm:h-4 transition-opacity duration-300 ${
                          isLogout
                            ? isDarkMode ? "text-red-200" : "text-red-600"
                            : isDarkMode ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-gray-700"
                        }`} />
                      </div>
                      
                      {/* Smooth text transition */}
                      <div className={`transition-all duration-500 ease-out overflow-hidden ${
                        open 
                          ? "opacity-100 translate-x-0 w-auto" 
                          : "opacity-0 -translate-x-4 w-0"
                      }`}>
                        <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
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
      <div className={`flex-1 transition-all duration-500 ease-out transform-gpu ${
        open 
          ? "lg:ml-64 xl:ml-72" 
          : "lg:ml-16 xl:ml-20"
      }`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Header;
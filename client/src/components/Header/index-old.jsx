// src/components/Header.jsx
import  { useContext } from "react";
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
  HiShieldCheck,
  HiInformationCircle,
  HiBars3,
  HiXMark,
  HiSun,
  HiMoon,
} from "react-icons/hi2";
import OrganizationSelector from "../OrganizationSelector/OrganizationSelector";

const Header = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const isLoggedIn = Auth.loggedIn();

  // Safely get organizationId
  let organizationId = null;
  if (isLoggedIn) {
    try {
      const profile = Auth.getProfile();
      organizationId = profile?.data?.organizationId || null;
    } catch (error) {
      console.error('Error getting profile:', error);
    }
  }

  // 1) live message count
  const { data: meData } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
    pollInterval: 5000,
  });
  const messageCount = meData?.me?.receivedMessages?.length || 0;

  // 2) fetch all games to compute badges
  const { data: allGamesData } = useQuery(QUERY_GAMES, {
    skip: !isLoggedIn || !organizationId,
    variables: { organizationId },
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

  // Check if current user is owner
  const currentUser = meData?.me;
  const isOwner = currentUser?.currentOrganization?.owner?._id === currentUser?._id;

  const Menus = Auth.loggedIn()
    ? [
        { title: "Home", icon: HiHome, path: "/", hideOnMobile: true },
        { title: "My Profile", icon: HiUser, path: "/me" },
        { title: "Roster", icon: HiUserGroup, path: "/roster" },
        ...(isOwner ? [{ title: "Admin Panel", icon: HiShieldCheck, path: "/admin" }] : []),
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
        { title: "Game-History", icon: HiInformationCircle, path: "/game-history" },
        { title: "Logout", icon: HiArrowRightOnRectangle, action: handleLogout },
      ]
    : [
        { title: "Login", icon: HiArrowLeftOnRectangle, path: "/login" },
        { title: "Signup", icon: HiUserPlus, path: "/signup" },
      ];

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-50 text-gray-900" : "bg-white text-gray-900"
      }`}
    >
      {/* Mobile Top Bar - AWS Style Professional Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[300] ${
        isDarkMode 
          ? "bg-gray-900 border-b border-gray-800" 
          : "bg-white border-b border-gray-200"
      } shadow-sm`}>
        {/* Status Bar Safe Area */}
        <div className="h-[env(safe-area-inset-top,0px)]"></div>
        
        {/* Main Header Content - Compact AWS Style */}
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Hamburger Menu */}
          <button
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <HiXMark className="w-5 h-5" />
            ) : (
              <HiBars3 className="w-5 h-5" />
            )}
          </button>

          {/* Center: Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`text-lg font-semibold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              RosterHub
            </div>
          </Link>

          {/* Right: Theme Toggle */}
          <button
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <HiSun className="w-5 h-5" />
            ) : (
              <HiMoon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Organization Selector - AWS Style */}
        {isLoggedIn && (
          <div className={`px-4 py-2 border-t ${
            isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"
          }`}>
            <OrganizationSelector />
          </div>
        )}
      </div>

      {/* Mobile Auth Buttons - AWS Style */}
      {!Auth.loggedIn() && open && (
        <div className={`lg:hidden fixed left-0 right-0 z-[50] ${
          isDarkMode ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-200"
        } shadow-sm`}
             style={{ top: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}>
          <div className="flex gap-2 p-4">
            <Link
              to="/"
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-colors no-underline ${
                location.pathname === "/" 
                  ? isDarkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Home
            </Link>
            
            <Link
              to="/login"
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-colors no-underline ${
                location.pathname === "/login" 
                  ? isDarkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Login
            </Link>
            
            <Link
              to="/signup"
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-center transition-colors no-underline ${
                location.pathname === "/signup" 
                  ? isDarkMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {open && Auth.loggedIn() && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-[4]"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Navigation - AWS Style */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 z-[60] lg:z-[5] ${
          open ? "w-64 translate-x-0" : "w-0 lg:w-16 -translate-x-full lg:translate-x-0"
        } ${
          isDarkMode 
            ? "bg-gray-900 border-r border-gray-800" 
            : "bg-gray-50 border-r border-gray-200"
        } overflow-hidden`}
      >
        {/* Sidebar Header - Desktop Only */}
        <div className="hidden lg:flex items-center justify-center h-14 border-b border-gray-200 dark:border-gray-800">
          {open && (
            <Link to="/" className={`text-base font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              RosterHub
            </Link>
          )}
          {!open && (
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <HiHome className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto h-[calc(100vh-3.5rem)] scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-400">
          <div className="space-y-1">
            {Menus.map((Menu, index) => {
              const isActive = location.pathname === Menu.path;
              const isLogout = Menu.title === "Logout";
              const shouldHideOnMobile = Menu.hideOnMobile;
              
              return (
                <div key={index} className={shouldHideOnMobile ? "hidden lg:block" : ""}>
                  {Menu.path ? (
                    <Link
                      to={Menu.path}
                      className="no-underline block"
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          !open ? 'justify-center' : ''
                        } ${
                          isLogout
                            ? isDarkMode
                              ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                              : "text-red-600 hover:bg-red-50 hover:text-red-700"
                            : isActive
                            ? isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900 shadow-sm"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                              : "text-gray-700 hover:bg-white hover:text-gray-900"
                        }`}
                      >
                        <Menu.icon className={`w-5 h-5 flex-shrink-0 ${
                          isLogout
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isActive
                            ? isDarkMode ? "text-blue-400" : "text-blue-600"
                            : ""
                        }`} />
                        
                        {open && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{Menu.title}</span>
                            {Menu.badge > 0 && (
                              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                isDarkMode
                                  ? "bg-red-600 text-white"
                                  : "bg-red-500 text-white"
                              }`}>
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
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        !open ? 'justify-center' : ''
                      } ${
                        isLogout
                          ? isDarkMode
                            ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            : "text-red-600 hover:bg-red-50 hover:text-red-700"
                          : isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                            : "text-gray-700 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      <Menu.icon className={`w-5 h-5 flex-shrink-0 ${
                        isLogout
                          ? isDarkMode ? "text-red-400" : "text-red-600"
                          : ""
                      }`} />
                      
                      {open && (
                        <span className="truncate">{Menu.title}</span>
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
      <div className={`flex-1 transition-all duration-300 ${
        open 
          ? "lg:ml-64" 
          : "lg:ml-16"
      }`}>
        <Outlet />
      </div>
    </div>
  );
};
      {/* Mobile Backdrop Overlay */}
      {open && Auth.loggedIn() && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-[4]"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Navigation - AWS Style */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 z-[60] lg:z-[5] ${
          open ? "w-64 translate-x-0" : "w-0 lg:w-16 -translate-x-full lg:translate-x-0"
        } ${
          isDarkMode 
            ? "bg-gray-900 border-r border-gray-800" 
            : "bg-gray-50 border-r border-gray-200"
        } overflow-hidden`}
      >
        {/* Sidebar Header - Desktop Only */}
        <div className="hidden lg:flex items-center justify-center h-14 border-b border-gray-200 dark:border-gray-800">
          {open && (
            <Link to="/" className={`text-base font-semibold no-underline ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              RosterHub
            </Link>
          )}
          {!open && (
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <HiHome className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto h-[calc(100vh-3.5rem)] scrollbar-thin scrollbar-thumb-gray-600 dark:scrollbar-thumb-gray-400">
          <div className="space-y-1">
            {Menus.map((Menu, index) => {
              const isActive = location.pathname === Menu.path;
              const isLogout = Menu.title === "Logout";
              const shouldHideOnMobile = Menu.hideOnMobile;
              
              return (
                <div key={index} className={shouldHideOnMobile ? "hidden lg:block" : ""}>
                  {Menu.path ? (
                    <Link
                      to={Menu.path}
                      className="no-underline block"
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          !open ? 'justify-center' : ''
                        } ${
                          isLogout
                            ? isDarkMode
                              ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                              : "text-red-600 hover:bg-red-50 hover:text-red-700"
                            : isActive
                            ? isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900 shadow-sm"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                              : "text-gray-700 hover:bg-white hover:text-gray-900"
                        }`}
                      >
                        <Menu.icon className={`w-5 h-5 flex-shrink-0 ${
                          isLogout
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isActive
                            ? isDarkMode ? "text-blue-400" : "text-blue-600"
                            : ""
                        }`} />
                        
                        {open && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{Menu.title}</span>
                            {Menu.badge > 0 && (
                              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                isDarkMode
                                  ? "bg-red-600 text-white"
                                  : "bg-red-500 text-white"
                              }`}>
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
                        if (window.innerWidth < 1024) {
                          setOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        !open ? 'justify-center' : ''
                      } ${
                        isLogout
                          ? isDarkMode
                            ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            : "text-red-600 hover:bg-red-50 hover:text-red-700"
                          : isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                            : "text-gray-700 hover:bg-white hover:text-gray-900"
                      }`}
                    >
                      <Menu.icon className={`w-5 h-5 flex-shrink-0 ${
                        isLogout
                          ? isDarkMode ? "text-red-400" : "text-red-600"
                          : ""
                      }`} />
                      
                      {open && (
                        <span className="truncate">{Menu.title}</span>
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
      <div className={`flex-1 transition-all duration-300 ${
        open 
          ? "lg:ml-64" 
          : "lg:ml-16"
      }`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Header;
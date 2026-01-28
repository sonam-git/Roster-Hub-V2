import React, { useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation,Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faCalendarAlt, faPlus, faStar, faHome, faInfoCircle, faMoon, faSun, faSearch, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import controlImage from "../../assets/images/iconizer-arrow-left.png";
import Auth from "../../utils/auth";
import { FaChevronDown } from "react-icons/fa";
import OrganizationSelector from "../OrganizationSelector/OrganizationSelector";
import RosterModal from "../RosterModal";
import lightLogo from "../../assets/images/RH-Logo-Light.png";
import darkLogo from "../../assets/images/RH-Logo.png";

export default function TopHeader({ className, onToggleMenu, open }) {
  const navigate = useNavigate();
  const location = useLocation();
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
  
  // Query user data to check if owner
  const { data: meData } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  
  const { data: profilesData } = useQuery(QUERY_PROFILES, {
    skip: !isLoggedIn || !organizationId,
    variables: { organizationId },
  });
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  
  // Check if current user is owner
  const currentUser = meData?.me;
  const isOwner = currentUser?.currentOrganization?.owner?._id === currentUser?._id;
  
  // Dynamic buttons based on owner status
  const BUTTONS = isOwner ? [
     { key: "home", label: "Home", icon: faHome, path: "/" },
    { key: "admin", label: "Admin", icon: faShieldAlt, path: "/admin" },
    { key: "gameschedule", label: "Upcoming", icon: faCalendarAlt, path: "/upcoming-games" },
     { key: "scheduleinfo", label: "Schedule", icon: faInfoCircle, path: "/game-schedule" },
    { key: "creategame", label: "Create", icon: faPlus, path: "/game-create" },
    { key: "search", label: "Search", icon: faSearch, action: "search", path: "/game-search" },
    { key: "skilllist", label: "Skills", icon: faStar, path: "/recent-skills" },
    { key: "roster", label: "Roster", icon: faPersonRunning, action: "roster" },
  ] : [
    { key: "home", label: "Home", icon: faHome, path: "/" },
    { key: "gameschedule", label: "Upcoming", icon: faCalendarAlt, path: "/upcoming-games" },
    { key: "scheduleinfo", label: "Schedule", icon: faInfoCircle, path: "/game-schedule" },
    { key: "creategame", label: "Create", icon: faPlus, path: "/game-create" },
    { key: "search", label: "Search", icon: faSearch, action: "search", path: "/game-search" },
    { key: "skilllist", label: "Skills", icon: faStar, path: "/recent-skills" },
    { key: "roster", label: "Roster", icon: faPersonRunning, action: "roster" },
  ];
  const [showRosterDropdown, setShowRosterDropdown] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const rosterBtnRef = useRef(null);
  const mobileRosterBtnRef = useRef(null);

  // Detect if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 976); // lg breakpoint
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <>
      {/* Desktop TopHeader - Hidden below 976px, visible at 976px+ (custom lg breakpoint) */}
      <header className={`hidden lg:flex fixed top-0 left-0 right-0 w-full flex-row items-center justify-between bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-[100] px-6 h-20 ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Logo and Title - AWS-style clean branding */}
      <Link
        to={"/"}
        className="flex items-center gap-3 no-underline group hover:opacity-80 transition-opacity"
        style={{ textDecoration: "none" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img
              src={isDarkMode ? darkLogo : lightLogo}
              className="w-10 h-10 rounded-lg"
              alt="RosterHub logo"
              style={{ objectFit: 'contain', background: 'transparent' }}
            />
          </div>
          <div className={`flex flex-col transition-all duration-300 ${
            open 
              ? "opacity-100" 
              : "opacity-0 w-0 overflow-hidden"
          }`}>
            <h1 className={`font-semibold text-base whitespace-nowrap ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              RosterHub
            </h1>
            <p className={`text-xs whitespace-nowrap ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Team Management
            </p>
          </div>
        </div>
      </Link>
      
      {/* Organization Name Display - Professional branding */}
      {isLoggedIn && currentUser?.currentOrganization?.name && (
        <div className="hidden xl:flex items-center ml-6 border-r border-l border-gray-400 dark:border-gray-700 rounded-lg px-2 py-2 w-48">
          <h1 className={`text-lg font-bold tracking-tight leading-tight text-center break-words w-full ${
            isDarkMode 
              ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400" 
              : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
          }`}>
            {currentUser.currentOrganization.name} 
          </h1>
        </div>
      )}
      
      {/* Center: AWS-style horizontal navigation */}
      <div className={`flex flex-row items-center justify-center flex-1`}>
        {isLoggedIn ? (
          <nav className="w-full max-w-5xl mx-auto">
            {/* AWS-style clean horizontal navigation */}
            <div className="flex items-center justify-center gap-1">
              {BUTTONS.map((btn) => {
                const isActive = location.pathname === btn.path?.split('#')[0];
                
                // Roster button with dropdown
                if (btn.key === "roster") {
                  return (
                    <div key={btn.key} className="hidden lg:block relative">
                      <button
                        ref={rosterBtnRef}
                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-150 ${
                          showRosterDropdown
                            ? isDarkMode
                              ? "text-blue-400 bg-gray-800"
                              : "text-blue-600 bg-gray-50"
                            : isDarkMode
                              ? "text-gray-300 hover:text-white hover:bg-gray-800"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setShowRosterDropdown((prev) => !prev)}
                      >
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={btn.icon} className="text-sm" />
                          {btn.label}
                          <FaChevronDown 
                            className={`text-xs transition-transform duration-200 ${
                              showRosterDropdown ? 'rotate-180' : 'rotate-0'
                            }`} 
                          />
                        </span>
                      </button>
                    </div>
                  );
                }
                
                // Regular navigation items - AWS-style: simple, clean text buttons with icons
                return (
                  <button
                    key={btn.key}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? isDarkMode
                          ? "text-blue-400 bg-gray-800"
                          : "text-blue-600 bg-gray-50"
                        : isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-800"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (btn.action === "search") {
                        navigate("/game-search");
                      } else if (btn.key === "creategame") {
                        navigate("/game-create", { state: { showCreateGame: true } });
                      } else {
                        navigate(btn.path);
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={btn.icon} className="text-sm" />
                      {btn.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : (
          <div className="flex items-center justify-center gap-4 px-6 py-2">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon 
                icon={faPersonRunning} 
                className="text-blue-600 dark:text-blue-400 text-2xl" 
              />
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-white font-semibold text-lg">
                  RosterHub
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Where Champions Connect & Teams Thrive
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Roster Dropdown - AWS-style clean modal */}
      <RosterModal
        isOpen={showRosterDropdown}
        onClose={() => setShowRosterDropdown(false)}
        isMobile={isMobile}
      >
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faPersonRunning} className="text-gray-500 dark:text-gray-400" />
              Team Roster
            </h3>
            <button
              onClick={() => setShowRosterDropdown(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            {profilesData?.profiles?.length || 0} team members
          </p>
        </div>
        
        {/* Player List */}
        <div className={`overflow-y-auto ${isMobile ? 'max-h-64' : 'max-h-56 sm:max-h-64'} bg-gray-50 dark:bg-gray-800`}>
          {profilesData?.profiles?.length > 0 ? (
            <ul className="py-1">
              {profilesData.profiles.map((player) => (
                <li key={player._id}>
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    onClick={() => {
                      setShowRosterDropdown(false);
                      navigate(`/profiles/${player._id}`);
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      {player.profilePic ? (
                        <img 
                          src={player.profilePic} 
                          alt={`${player.name}'s avatar`} 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FontAwesomeIcon 
                            icon={faPersonRunning} 
                            className="text-gray-500 dark:text-gray-400 text-sm" 
                          />
                        </div>
                      )}
                      {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {Auth.loggedIn() && Auth.getProfile().data._id === player._id ? "You" : player.name}
                      </p>
                      {player.position && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {player.position}
                        </p>
                      )}
                    </div>
                    {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                        You
                      </span>
                    )}
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
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setShowRosterDropdown(false);
              navigate('/roster');
            }}
            className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>View Full Roster</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </RosterModal>
      {/* Right: Controls - AWS-style clean buttons */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Organization Selector - Only shown when logged in */}
        {isLoggedIn && <OrganizationSelector />}
        
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg" />
        </button>
        
        {/* Sidebar toggle - AWS-style arrow button */}
        <button
          onClick={onToggleMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          <img
            src={controlImage}
            className={`w-5 h-5 transition-transform duration-300 ${open ? '' : 'rotate-180'}`}
            alt="toggle menu"
          />
        </button>
      </div>
    </header>

      {/* Mobile Bottom Navigation - AWS-style clean navigation bar */}
      {isLoggedIn && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[50]  bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg pb-safe">
        <div className="flex items-center justify-around px-2 py-2.5 overflow-x-auto scrollbar-hide">
          {BUTTONS.map((btn) => {
            const isRoster = btn.key === "roster";
            const isActive = location.pathname === btn.path?.split('#')[0];
            
            return (
              <React.Fragment key={btn.key}>
                {isRoster ? (
                  <button
                    ref={mobileRosterBtnRef}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors min-w-[64px] ${
                      isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setShowRosterDropdown((prev) => !prev)}
                  >
                    <FontAwesomeIcon icon={btn.icon} className="text-lg" />
                    <span className="text-[10px] font-medium">{btn.label}</span>
                  </button>
                ) : (
                  <button
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors min-w-[64px] ${
                      isActive
                        ? isDarkMode
                          ? "bg-gray-800 text-blue-400"
                          : "bg-gray-100 text-blue-600"
                        : isDarkMode
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      if (btn.action === "search") {
                        navigate("/game-search");
                      } else if (btn.key === "creategame") {
                        navigate("/game-create", { state: { showCreateGame: true } });
                      } else {
                        navigate(btn.path);
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={btn.icon} className="text-lg" />
                    <span className="text-[10px] font-medium">{btn.label}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Dark Mode Toggle for Mobile */}
          <button
            onClick={toggleDarkMode}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors min-w-[64px] ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg" />
            <span className="text-[10px] font-medium">Theme</span>
          </button>
        </div>
      </div>
      )}
    </>
  );
}
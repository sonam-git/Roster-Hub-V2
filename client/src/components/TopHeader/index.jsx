import React, { useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation,Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faCalendarAlt, faPlus, faInbox, faStar, faHome, faInfoCircle, faMoon, faSun, faSearch, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import controlImage from "../../assets/images/iconizer-arrow-left.png";
import Auth from "../../utils/auth";
import { FaChevronDown } from "react-icons/fa";
import OrganizationSelector from "../OrganizationSelector/OrganizationSelector";
// import lightLogo from "../../assets/images/roster-hub-logo.png";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";

export default function TopHeader({ className, onToggleMenu, open, isVisible = true }) {
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
    { key: "admin", label: "Admin", icon: faShieldAlt, path: "/admin" },
    { key: "gameschedule", label: "Upcoming", icon: faCalendarAlt, path: "/upcoming-games" },
    { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-create" },
    { key: "search", label: "Search", icon: faSearch, action: "search", path: "/game-search" },
    { key: "messages", label: "Inbox", icon: faInbox, path: "/message" },
    { key: "skilllist", label: "Skills", icon: faStar, path: "/recent-skills" },
    { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
    { key: "roster", label: "Roster", icon: faPersonRunning, action: "roster" },
  ] : [
    { key: "home", label: "Home", icon: faHome, path: "/" },
    { key: "gameschedule", label: "Upcoming", icon: faCalendarAlt, path: "/upcoming-games" },
    { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-create" },
    { key: "search", label: "Search", icon: faSearch, action: "search", path: "/game-search" },
    { key: "messages", label: "Inbox", icon: faInbox, path: "/message" },
    { key: "skilllist", label: "Skills", icon: faStar, path: "/recent-skills" },
    { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
    { key: "roster", label: "Roster", icon: faPersonRunning, action: "roster" },
  ];
  const [showRosterDropdown, setShowRosterDropdown] = React.useState(false);
  const rosterBtnRef = useRef(null);
  const mobileRosterBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showRosterDropdown) return;
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        rosterBtnRef.current &&
        !rosterBtnRef.current.contains(e.target) &&
        mobileRosterBtnRef.current &&
        !mobileRosterBtnRef.current.contains(e.target)
      ) {
        setShowRosterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showRosterDropdown]);

  return (
    <>
      {/* Desktop TopHeader - Hidden below 976px, visible at 976px+ (custom lg breakpoint) */}
      <div className={`hidden lg:flex w-full flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 py-2 shadow-md sticky z-[10] px-2 sm:px-4 ${isVisible ? 'top-0' : 'top-0'} ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Logo and Title (always visible, beautiful UI) */}
      <Link
        to={"/"}
        className="flex items-center gap-3 no-underline group"
        style={{ textDecoration: "none" }}
      >
        <div className="flex items-center gap-3 w-full md:w-auto justify-center py-1 px-2">
          <div className="relative flex items-center justify-center mt-3 ">
            <img
              src={isDarkMode ? darkLogo : lightLogo}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl shadow-lg border-2 border-blue-400/30 bg-gradient-to-br from-blue-100/60 to-purple-100/40 dark:from-blue-900/40 dark:to-purple-900/30 drop-shadow-xl transition-all duration-500"
              alt="logo"
              style={{ objectFit: 'contain', background: 'transparent' }}
            />
            {/* Animated ring effect */}
            <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 dark:border-purple-400/40 opacity-30 animate-pulse pointer-events-none"></span>
          </div>
          <div className={`flex flex-col transition-all duration-300 overflow-hidden  mt-3 ${
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
      
      {/* Invite Code Display - Only for Owners */}
      {isLoggedIn && isOwner && currentUser?.currentOrganization?.inviteCode && (
        <div className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl px-4 py-2 shadow-lg border border-emerald-400/50 ml-4 mt-3">
          <div className="flex flex-col">
            <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">
              Team Code
            </span>
            <code className="text-white font-mono font-black text-lg tracking-widest">
              {currentUser.currentOrganization.inviteCode}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(currentUser.currentOrganization.inviteCode);
              // You could add a toast notification here
              alert("✅ Invite code copied!");
            }}
            className="bg-white hover:bg-gray-100 text-emerald-600 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
            title="Copy invite code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Center: Menu buttons or promo text */}
      <div className={`flex flex-row items-center justify-center flex-1 w-full mt-4 lg:mt-0`}>
        {isLoggedIn ? (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0 lg:justify-center lg:flex-wrap">
              {BUTTONS.map((btn) => {
                // Hide roster button on small screens
                if (btn.key === "roster") {
                  return (
                    <React.Fragment key={btn.key}>
                      <div className="hidden lg:block relative flex-shrink-0">
                        <button
                          ref={rosterBtnRef}
                          className={`flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl min-w-[80px] sm:min-w-0 justify-center backdrop-blur-sm ${
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
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={btn.key}>
                    <button
                      className={`flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-sm font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex-shrink-0 min-w-[80px] sm:min-w-0 justify-center backdrop-blur-sm ${
                        location.pathname === btn.path?.split('#')[0]
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
                          navigate("/game-create", { state: { showCreateGame: true } });
                        } else {
                          navigate(btn.path);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={btn.icon} className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm font-oswald font-bold tracking-wide truncate">{btn.label.toUpperCase()}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full relative flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl border-2 border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-green-600/30 backdrop-blur-sm">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-green-400/10 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-green-500/15 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 animate-pulse delay-1000"></div>
            
            {/* Main content container */}
            <div className="relative z-10 py-2 px-4">
              <span className="animate-marquee whitespace-nowrap text-lg sm:text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3 sm:gap-4 md:gap-6">
                {/* Leading icon with enhanced styling */}
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faPersonRunning} 
                    className="text-green-600 dark:text-green-300 text-2xl sm:text-3xl md:text-4xl drop-shadow-2xl animate-bounce-slow filter brightness-110" 
                  />
                  <div className="absolute inset-0 text-green-300 dark:text-green-100 text-2xl sm:text-3xl md:text-4xl animate-ping opacity-30">
                    <FontAwesomeIcon icon={faPersonRunning} />
                  </div>
                </div>
                
                {/* Brand name with gradient text */}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-300 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent font-oswald font-black text-2xl sm:text-3xl md:text-4xl drop-shadow-lg tracking-wider">
                  ROSTERHUB
                </span>
                
                {/* Marketing message with enhanced styling */}
                <span className="hidden sm:inline-flex items-center gap-2 text-gray-700 dark:text-gray-100 font-medium text-sm sm:text-base md:text-lg italic tracking-wide">
                  <span className="text-yellow-500 dark:text-yellow-300 animate-pulse text-lg">✨</span>
                  <span className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent font-semibold">
                    Where Champions Connect & Teams Thrive!
                  </span>
                  <span className="text-yellow-500 dark:text-yellow-300 animate-pulse text-lg delay-500">🏆</span>
                </span>
                
                {/* Mobile-specific shorter message */}
                <span className="sm:hidden text-gray-700 dark:text-gray-100 font-medium text-sm italic">
                  <span className="text-yellow-500 dark:text-yellow-300 animate-pulse">✨</span>
                  Build Your Dream Team!
                  <span className="text-yellow-500 dark:text-yellow-300 animate-pulse delay-500">🏆</span>
                </span>
                
                {/* Call-to-action with pulse effect */}
                <span className="md:inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 text-white dark:text-gray-900 font-bold text-sm rounded-full shadow-lg animate-pulse border border-green-400/50 dark:border-green-300/50">
                  <span>JOIN NOW</span>
                  <span className="animate-bounce">🚀</span>
                </span>
                
                {/* Trailing star with enhanced animation */}
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faStar} 
                    className="text-yellow-600 dark:text-yellow-200 text-2xl sm:text-3xl md:text-4xl drop-shadow-2xl animate-spin-slow filter brightness-110" 
                  />
                  <div className="absolute inset-0 text-yellow-300 dark:text-yellow-100 text-2xl sm:text-3xl md:text-4xl animate-ping opacity-40 delay-700">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                </div>
              </span>
            </div>
            
            {/* Enhanced animations and styles */}
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 12s linear infinite;
                animation-play-state: running;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
              @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .animate-spin-slow {
                animation: spin-slow 8s linear infinite;
              }
              @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s ease-in-out infinite;
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
              }
              .animate-pulse {
                animation: pulse 2s infinite;
              }
              @keyframes ping {
                75%, 100% {
                  transform: scale(2);
                  opacity: 0;
                }
              }
              .animate-ping {
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
            `}</style>
          </div>
        )}
      </div>
      {/* Roster Dropdown (centered modal-style dropdown) */}
      {isLoggedIn && showRosterDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] transition-all duration-300"
            onClick={() => setShowRosterDropdown(false)}
            aria-label="Close roster dropdown"
          />
          
          {/* Centered Dropdown */}
          <div
            ref={dropdownRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999999] shadow-2xl border-2 border-gray-700 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 bg-gray-900 w-[90vw] sm:w-[85vw] max-w-md"
            style={{
              animation: 'modalSlideIn 0.3s ease-out forwards',
              maxHeight: '80vh'
            }}
          >
            <style>{`
              @keyframes modalSlideIn {
                from {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
              }
            `}</style>
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-oswald font-bold tracking-wide text-sm sm:text-base flex items-center gap-2">
                <FontAwesomeIcon icon={faPersonRunning} className="text-gray-300 text-base sm:text-lg" />
                TEAM ROSTER
              </h3>
              <button
                onClick={() => setShowRosterDropdown(false)}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">
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
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-800 text-white font-medium flex items-center gap-2 sm:gap-3 transition-all duration-200 group border-b border-gray-700 last:border-b-0"
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
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-600 group-hover:border-gray-500 transition-colors" 
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-600 group-hover:border-gray-500 transition-colors">
                            <FontAwesomeIcon 
                              icon={faPersonRunning} 
                              className="text-white text-sm sm:text-base" 
                            />
                          </div>
                        )}
                        {/* Online indicator */}
                        {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-gray-200 transition-colors">
                          {Auth.loggedIn() && Auth.getProfile().data._id === player._id ? "You" : player.name}
                        </p>
                        {player.position && (
                          <p className="text-xs text-gray-400 truncate">
                            {player.position}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {Auth.loggedIn() && Auth.getProfile().data._id === player._id && (
                          <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full font-medium">
                            You
                          </span>
                        )}
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <FontAwesomeIcon icon={faPersonRunning} className="text-4xl text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">No team members found</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-700">
            <button
              onClick={() => {
                setShowRosterDropdown(false);
                navigate('/roster');
              }}
              className="w-full text-center text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <span>View Full Roster</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
        </>
      )}
      {/* Right: Organization Selector, Dark/Light mode toggle and sidebar toggle (arrow always visible) */}
      <div className="hidden lg:flex items-center ml-4 gap-2 mt-3">
        {/* Organization Selector - Only shown when logged in */}
        {isLoggedIn && <OrganizationSelector />}
        
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
          className={`cursor-pointer w-6 md:w-8 lg:w-10 border-dark-blue border-2 rounded-full bg-white transition-transform duration-300 ml-2 ${open ? '' : 'rotate-180'}`}
          style={{ marginTop: 2 }}
          onClick={onToggleMenu}
          alt="toggle menu"
        />
      </div>
    </div>

      {/* Mobile Bottom Navigation - Visible below 976px, hidden at 976px+ (custom lg breakpoint) - Only for logged in users */}
      {isLoggedIn && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-700 shadow-2xl pb-safe">
        <div className="flex items-center justify-around px-1 py-2 overflow-x-auto scrollbar-hide">
          {BUTTONS.map((btn, index) => {
            const isRoster = btn.key === "roster";
            return (
              <React.Fragment key={btn.key} >
                {isRoster ? (
                  <div className="relative flex-shrink-0">
                    <button
                      ref={mobileRosterBtnRef}
                      className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 transform active:scale-95 min-w-[60px] justify-center ${
                        isDarkMode
                          ? "text-gray-200 hover:bg-gray-700/50"
                          : "text-gray-700 hover:bg-gray-200/50"
                      }`}
                      onClick={() => setShowRosterDropdown((prev) => !prev)}
                    >
                      <FontAwesomeIcon icon={btn.icon} className="text-lg" />
                      <span className="text-[10px] font-bold tracking-wide truncate">{btn.label}</span>
                      <FaChevronDown 
                        className={`text-[8px] transition-transform duration-200 ${
                          showRosterDropdown ? 'rotate-0' : 'rotate-180'
                        }`} 
                      />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 transform active:scale-95 flex-shrink-0 min-w-[60px] justify-center ${
                      location.pathname === btn.path?.split('#')[0]
                        ? isDarkMode
                          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg"
                          : "bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white shadow-lg"
                        : isDarkMode
                          ? "text-gray-200 hover:bg-gray-700/50"
                          : "text-gray-700 hover:bg-gray-200/50"
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
                    <span className="text-[10px] font-bold tracking-wide truncate">{btn.label}</span>
                  </button>
                )}
                
                {/* Separator between buttons */}
                {index < BUTTONS.length - 1 && (
                  <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Separator before theme toggle */}
          <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
          
          {/* Dark Mode Toggle for Mobile */}
          <button
            onClick={toggleDarkMode}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 transform active:scale-95 flex-shrink-0 min-w-[60px] justify-center ${
              isDarkMode
                ? "text-gray-200 hover:bg-gray-700/50"
                : "text-gray-700 hover:bg-gray-200/50"
            }`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg" />
            <span className="text-[10px] font-bold tracking-wide">Theme</span>
          </button>
        </div>
      </div>
      )}
    </>
  );
}
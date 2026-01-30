// src/components/Hero.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaFutbol,
  FaComments,
  FaStar,
  FaClipboardList,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";

const features = [
  {
    icon: FaUsers,
    title: "Team Management",
    description: "Create player profiles with positions, jersey numbers, and manage your complete team roster.",
    color: "blue"
  },
  {
    icon: FaCalendarAlt,
    title: "Game Scheduling",
    description: "Schedule matches, collect player availability votes, and track game history.",
    color: "green"
  },
  {
    icon: FaFutbol,
    title: "Formation Builder",
    description: "Create tactical formations with drag-and-drop. Choose from 4-3-3, 3-5-2, and more.",
    color: "purple"
  },
  {
    icon: FaComments,
    title: "Team Communication",
    description: "Real-time messaging between teammates. Share updates, posts, and coordinate easily.",
    color: "amber"
  },
  {
    icon: FaStar,
    title: "Skill Endorsements",
    description: "Endorse teammate skills, rate performances, and track player development.",
    color: "yellow"
  },
  {
    icon: FaClipboardList,
    title: "Game Feedback",
    description: "Collect post-game feedback, analyze performances, and improve as a team.",
    color: "red"
  }
];

const colorClasses = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" }
};


const Hero = () => {
  
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) return;
    
    const itemsPerView = isSmallScreen ? 1 : 3;
    const maxIndex = features.length - itemsPerView;
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= maxIndex) {
          return 0; // Reset to beginning
        }
        return prev + 1;
      });
    }, 3000); // Slide every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSmallScreen, isPaused]);

  const itemsPerView = isSmallScreen ? 1 : 3;
  const maxIndex = features.length - itemsPerView;

  const goToPrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <main className="relative overflow-hidden min-h-screen">
 

      {/* Theme Toggle Button - Fixed in top right */}
      {/* <button
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
      </button> */}

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

        {/* Feature Cards Carousel */}
        <div 
          className={`relative max-w-5xl mx-auto transition-all duration-700 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors hidden md:flex"
            aria-label="Previous"
          >
            <FaChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors hidden md:flex"
            aria-label="Next"
          >
            <FaChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden w-full px-1">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: isSmallScreen 
                  ? `translateX(-${currentIndex * 100}%)`
                  : `translateX(-${currentIndex * (100 / 3)}%)`,
              }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colors = colorClasses[feature.color];
                return (
                  <div 
                    key={index}
                    className="flex-shrink-0 px-1.5 py-1"
                    style={{ width: isSmallScreen ? '100%' : 'calc(100% / 3)' }}
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[150px] sm:min-h-[160px]">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3 flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 flex-shrink-0">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words overflow-visible">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-blue-600 dark:bg-blue-400 w-4' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
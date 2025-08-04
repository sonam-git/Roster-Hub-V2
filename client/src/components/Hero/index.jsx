// src/components/Hero.jsx
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/images/dark-logo.png";
import heroImageDark from "../../assets/images/roster-hub-logo.png";

const Hero = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [showRight, setShowRight] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Helper: is small screen
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  // On mount, start timer for mobile
  useEffect(() => {
    if (isMobile) {
      setShowRight(false);
      timerRef.current = setTimeout(() => setShowRight(true), 5000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line
  }, []);

  return (
    <main className="flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12 font-sans">
      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-6 lg:gap-8">
        {/* Left side: hide on mobile after 5s */}
        {(!isMobile || (isMobile && !showRight)) && (
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center mb-6 lg:mb-0 p-4 lg:p-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold pb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-100 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 drop-shadow-lg">
              Roster Hub
            </h1>
            <p className="text-lg sm:text-xl mb-3 font-medium text-gray-700 dark:text-gray-200">
              Create your team's hub with us
            </p>
            <img
              src={isDarkMode ? heroImage : heroImageDark}
              alt="Roster Hub Logo"
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 animate-bounce mt-4 drop-shadow-xl rounded-full border-4 border-white dark:border-gray-800"
            />
            <h4
              className="text-xs sm:text-sm md:text-base lg:text-xl text-center italic tracking-tight mt-4 sm:mt-6 mb-4 sm:mb-6 text-gray-800 dark:text-white drop-shadow"
            >
              Elevate Your Game, On and Off the Field
            </h4>
          </div>
        )}

        {/* Right side: only show on mobile after 5s, always on lg+ */}
        <div
          className={`
            ${(showRight || !isMobile) ? "block" : "hidden"}
            lg:block
            w-full lg:w-1/2 flex flex-col items-center
          `}
        >
          <div className="bg-gradient-to-br from-green-400 via-blue-400 to-yellow-300 dark:from-green-900 dark:via-blue-900 dark:to-yellow-700 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col items-center w-full max-w-md lg:max-w-lg overflow-x-auto mb-6 border border-green-200 dark:border-green-800">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center break-words w-full tracking-tight drop-shadow">
              Join Roster Hub Today!
            </h2>
            <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-4 sm:mb-5 text-center w-full break-words font-medium">
              Sign up to connect with your team, track games, and share your soccer journey.
            </p>
            <ul className="text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 text-left w-full max-w-lg list-disc list-inside space-y-1 sm:space-y-2 font-normal">
              <li>
                <span className="font-semibold text-yellow-700 dark:text-yellow-200">Dynamic profiles</span> with photos, jersey numbers, positions, and more
              </li>
              <li>
                Endorse teammates’ <span className="font-semibold text-yellow-700 dark:text-yellow-200">skills</span> and give <span className="font-semibold text-yellow-700 dark:text-yellow-200">star ratings</span>
              </li>
              <li>
                Real-time <span className="font-semibold text-yellow-700 dark:text-yellow-200">chat, messaging, likes, and comments</span>
              </li>
              <li>
                Coaches/admins can create <span className="font-semibold text-yellow-700 dark:text-yellow-200">game polls</span> and manage schedules
              </li>
              <li>
                Follow your <span className="font-semibold text-yellow-700 dark:text-yellow-200">favorite pro teams</span> with live match schedules and scores
              </li>
            </ul>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-yellow-400 dark:bg-yellow-300 text-green-900 dark:text-green-900 font-extrabold rounded-full shadow-lg hover:bg-yellow-300 dark:hover:bg-yellow-200 transition hover:no-underline text-base sm:text-lg tracking-wide mt-2"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;

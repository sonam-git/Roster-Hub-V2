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
    <main className="flex items-center justify-center px-2 py-12 font-sans bg-gradient-to-b from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        {/* Left side: hide on mobile after 5s */}
        {(!isMobile || (isMobile && !showRight)) && (
          <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0 p-6">
            <h1 className="text-5xl font-extrabold pb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 drop-shadow-lg">
              Roster Hub
            </h1>
            <p className="text-xl mb-3 font-medium text-gray-700 dark:text-gray-200">
              Create your team's hub with us
            </p>
            <img
              src={isDarkMode ? heroImage : heroImageDark}
              alt="Roster Hub Logo"
              className="w-56 h-56 md:w-64 md:h-64 animate-bounce mt-4 drop-shadow-xl rounded-full border-4 border-white dark:border-gray-800"
            />
            <h4
              className="text-md sm:text-md md:text-xl lg:text-2xl text-center font-bold tracking-tight mt-6 mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-green-500 via-blue-500 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 bg-clip-text text-transparent drop-shadow"
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
            md:w-1/2 flex flex-col items-center
          `}
        >
          <div className="bg-gradient-to-br from-green-400 via-blue-400 to-yellow-300 dark:from-green-900 dark:via-blue-900 dark:to-yellow-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full overflow-x-auto mb-6 border border-green-200 dark:border-green-800">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center break-words w-full tracking-tight drop-shadow">
              Join Roster Hub Today!
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-5 text-center w-full break-words font-medium">
              Sign up to connect with your team, track games, and share your soccer journey.
            </p>
            <ul className="text-base text-gray-900 dark:text-gray-100 mb-6 text-left w-full max-w-lg list-disc list-inside space-y-2 font-normal">
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
              className="px-8 py-3 bg-yellow-400 dark:bg-yellow-300 text-green-900 dark:text-green-900 font-extrabold rounded-full shadow-lg hover:bg-yellow-300 dark:hover:bg-yellow-200 transition hover:no-underline text-lg tracking-wide mt-2"
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

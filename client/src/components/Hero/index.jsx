// src/components/Hero.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../ThemeContext"; // Import ThemeContext
import heroImage from "../../assets/images/dark-logo.png";
import heroImageDark from "../../assets/images/roster-hub-logo.png";

const Hero = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [started, setStarted] = useState(false);

  return (
    <main className="container lg:mt-20 flex items-center justify-center px-2">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">

        {/* Left side */}
        <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0">
          <h1 className="text-5xl font-bold pb-2">Roster Hub</h1>
          <p className="text-xl mb-3">Create your team's hub with us</p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-64 h-64 animate-bounce mt-4"
          />
          <h4
            className="
              text-md sm:text-lg md:text-xl lg:text-2xl
              text-center font-extrabold tracking-tight
              text-gray-900 dark:text-white mb-6
              bg-gradient-to-r from-green-500 via-blue-500 to-red-500
              bg-clip-text text-transparent
            "
          >
            Elevate Your Game, On and Off the Field
          </h4>
        </div>

        {/* Get Started button on mobile only */}
        {!started && (
          <div className="lg:hidden w-full flex justify-center my-6">
            <button
              onClick={() => setStarted(true)}
              className="
                bg-gradient-to-br from-green-400 to-blue-500
                text-white font-bold
                py-3 px-8
                rounded-full
                shadow-lg
                transform hover:-translate-y-1 hover:shadow-xl
                transition
              "
            >
              Get Started
            </button>
          </div>
        )}

        {/* Right side: hidden on mobile until started, always shown on lg+ */}
        <div
          className={`
            ${started ? "block" : "hidden"}
            lg:block
            md:w-1/2 flex flex-col items-center
          `}
        >
          <div className="mt-8 bg-gradient-to-r from-green-400 via-blue-400 to-green-600 dark:from-green-900 dark:via-blue-900 dark:to-green-800 rounded-xl shadow-lg p-6 flex flex-col items-center w-full overflow-x-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center break-words w-full">
              Join Roster Hub Today!
            </h2>
            <p className="text-white/90 mb-4 text-center w-full break-words">
              Sign up to connect with your team, track games, and share your soccer journey.
            </p>
            <ul className="text-white/90 mb-4 text-left w-full max-w-lg list-disc list-inside space-y-2">
              <li><span className="font-semibold text-yellow-200">Dynamic profiles</span> with photos, jersey numbers, positions, and more</li>
              <li>Endorse teammates’ <span className="font-semibold text-yellow-200">skills</span> and give <span className="font-semibold text-yellow-200">star ratings</span></li>
              <li>Real-time <span className="font-semibold text-yellow-200">chat, messaging, likes, and comments</span></li>
              <li>Coaches/admins can create <span className="font-semibold text-yellow-200">game polls</span> and manage schedules</li>
              <li>Follow your <span className="font-semibold text-yellow-200">favorite pro teams</span> with live match schedules and scores</li>
            </ul>
            <a
              href="/signup"
              className="px-6 py-2 bg-yellow-400 text-green-900 font-bold rounded-full shadow hover:bg-yellow-300 transition"
            >
              Get Started
            </a>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Hero;

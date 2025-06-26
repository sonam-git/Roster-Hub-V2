import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../ThemeContext"; // Import ThemeContext
import heroImage from "../../assets/images/dark-logo.png";
import heroImageDark from "../../assets/images/roster-hub-logo.png";

const Hero = () => {
  const { isDarkMode } = useContext(ThemeContext); // Access isDarkMode from ThemeContext

  return (
    <main className="container min-h-screen flex items-center justify-center px-2">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0">
          <h1 className="text-5xl font-bold pb-2">Roster Hub</h1>
          <p className="text-xl mb-3">Create your team's hub with us</p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-64 h-64 animate-bounce mt-4"
          />
          <h4 className="text-center text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-green-500 via-blue-500 to-red-500 bg-clip-text text-transparent">
            Elevate Your Game, On and Off the Field
          </h4>
        </div>

        <div className="md:w-1/2 flex flex-col items-center">
          <div className="bg-gray-200 shadow-xl  px-4 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-lg rounded-xl">
            <h4 className="text-center text-2xl font-bold text-gray-900 mb-6 dark:text-white">
              Create Your Profile.
            </h4>
            <p className="text-base md:text-md leading-relaxed text-gray-700 dark:text-gray-300 bg-gradient-to-br from-white/60 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Our platform
              </span>{" "}
              transforms how teams <strong>connect, play, and grow</strong>{" "}
              together. Players can build{" "}
              <span className="text-green-600 font-medium">
                dynamic profiles
              </span>{" "}
              with photos, jersey numbers, preferred positions, and more —
              creating a digital identity that truly reflects their presence on
              the pitch.
              <br />
              <br />
              Teammates can{" "}
              <span className="text-yellow-600 font-medium">
                endorse each other’s skills
              </span>{" "}
              and give <strong>star ratings</strong>, helping everyone get
              recognized for what they bring to the squad. Stay connected with{" "}
              <strong>real-time chat, messaging, likes, and comments</strong> —
              every interaction made meaningful.
              <br />
              <br />
              Coaches and admins can easily create{" "}
              <span className="text-blue-600 font-medium">game polls</span> to
              notify players about upcoming matches, opponents, venue, and
              tactical formations. And for fans, follow your{" "}
              <span className="font-semibold text-pink-600">
                favorite pro teams
              </span>{" "}
              with live match schedules and scores — all in one place.
            </p>
          </div>
          <div className="flex justify-center mt-2 mb-2">
            <Link
              className="bg-gray-800 border border-gray-300 hover:bg-gray-100 text-gray-300 hover:text-black font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl mr-4 hover:no-underline"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="bg-gray-800 border border-gray-300 hover:bg-gray-100 text-gray-300 hover:text-black font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-xl hover:no-underline"
              to="/signup"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;

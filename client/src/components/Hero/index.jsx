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
        </div>
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="bg-gray-200 shadow-xl  px-4 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-lg rounded-xl">
            <h4 className="text-center text-2xl font-bold text-gray-900 mb-6 dark:text-white">
              Create Your Profile.
            </h4>
            <p className="text-sm">
            Our platform empowers team members to build comprehensive profiles, upload photos, 
            and update details such as positions, names, jersey numbers, and more. It facilitates 
            skill endorsements and star ratings among teammates. Additionally, users can engage in 
            messaging, liking, commenting on posts, and direct communication, enhancing team interaction 
            and collaboration.
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

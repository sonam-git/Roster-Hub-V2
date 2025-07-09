import React from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME } from "../utils/queries";
import Auth from "../utils/auth";
import PostForm from "../components/PostForm";
import PostsList from "../components/PostsList";
import ComingGames from "../components/ComingGames";
import RatingDisplay from "../components/RatingDisplay";
import RecentSkillsList from "../components/RecentSkillsList";
import { FaFutbol, FaRegListAlt, FaStar, FaCalendarAlt } from "react-icons/fa";

const Home = ({ isDarkMode }) => {
  // Check login
  const isLoggedIn = Auth.loggedIn();

  // Fetch profile if logged in
  const { loading, error, data } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  const profile = data?.me || {};

  // Loading / error states
  if (loading) {
    return <div className="text-center py-10">Loading your dashboard…</div>;
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading your profile.
      </div>
    );
  }

  return (
    <main className="container mx-auto  ">
      {isLoggedIn ? (
        <div className="flex flex-col items-center w-full">
          {/* Hero banner for logged-in users */}
          <div className="w-full flex flex-col items-center justify-center px-4 mb-8 mt-4 bg-gradient-to-r from-green-400 via-blue-400 to-green-600 dark:from-green-900 dark:via-blue-900 dark:to-green-800 shadow-2xl border-2 border-white/60 dark:border-blue-900/60 relative overflow-hidden animate-gradient-x" style={{ borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}>
            {/* Decorative SVG wave at the bottom */}
            <svg className="absolute bottom-0 left-0 w-full h-16" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 1 }}>
              <path fill="url(#waveGradient)" fillOpacity="1" d="M0,40 C360,120 1080,0 1440,80 L1440,80 L0,80 Z" />
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4ade80" />
                  <stop offset="0.5" stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute left-4 bottom-4 opacity-20 text-6xl pointer-events-none select-none z-10">
              <FaFutbol className="animate-bounce text-yellow-200" />
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-2 text-center break-words w-full tracking-tight py-4 flex items-center justify-center gap-4 z-10">
              {profile.name ? (
                <>
                  Welcome back,{" "}
                  <span className="text-yellow-200 animate-pulse">
                    {profile.name}
                  </span>
                  !
                </>
              ) : (
                <>Welcome!</>
              )}
            </h1>
            <p className="text-lg sm:text-xl pb-4 md:text-2xl text-white/90 font-semibold text-center w-full break-words italic z-10">
              Let's play, connect, and win together!
            </p>
            <div className="absolute right-4 bottom-4 opacity-20 text-6xl pointer-events-none select-none z-10">
              <FaFutbol className="animate-bounce text-yellow-200" />
            </div>
          </div>

          {/* PostForm + PostsList / RecentSkillsList + ComingGames */}
          <div className="w-full flex flex-col lg:flex-row lg:space-x-2 px-4">
            {/* Left: PostForm + PostsList */}
            <div className="flex-1 mb-4 lg:mb-0 space-y-6 md:mx-2">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaRegListAlt className="text-green-600 dark:text-green-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">
                    Share a Thought
                  </span>
                </div>
                <PostForm />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto ">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaRegListAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">
                    Recent Posts
                  </span>
                </div>
                <PostsList isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Right: RecentSkillsList + ComingGames */}
            <div className="w-full lg:w-1/4 space-y-6 mt-4 lg:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-2 w-full overflow-x-auto min-h-[300px] lg:min-h-[360px] flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaFutbol className="text-yellow-500 dark:text-yellow-300 text-xl animate-bounce" />
                  <span className="font-bold text-lg dark:text-white">
                    Latest Skills
                  </span>
                </div>
                <RecentSkillsList />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-2 w-full overflow-x-auto min-h-[300px] lg:min-h-[360px] flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaCalendarAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">
                    Game Schedule
                  </span>
                </div>
                <ComingGames />
              </div>
            </div>
          </div>

          {/* Top Ratings */}
          <div className="w-full mt-8 mb-8  rounded-xl shadow p-6 overflow-x-auto ">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FaStar className="text-yellow-500 dark:text-yellow-300 text-xl" />
              <span className="font-bold text-lg dark:text-white">
                Top Rated Players
              </span>
            </div>
            <RatingDisplay limit={10} />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
          <Hero />
        </div>
      )}
    </main>
  );
};

export default Home;
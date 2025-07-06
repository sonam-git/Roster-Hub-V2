// src/pages/Home.jsx
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
    <main className="container mx-auto mt-5 ">
      {isLoggedIn ? (
        <div className="flex flex-col items-center w-full">
          {/* Hero banner for logged-in users */}
          <div className="w-full mb-4 mx-2 md:mx-6 rounded-xl bg-gradient-to-r from-green-400 via-blue-400 to-green-600 dark:from-green-900 dark:via-blue-900 dark:to-green-800 shadow-lg flex flex-col items-center justify-center py-8 relative overflow-hidden">
            <FaFutbol className="absolute left-4 top-4 text-6xl text-white opacity-10 animate-spin-slow" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2 text-center break-words w-full">
              {profile.name ? (
                <>
                  Welcome back,{" "}
                  <span className="text-yellow-200">{profile.name}</span>!
                </>
              ) : (
                <>Welcome!</>
              )}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-semibold text-center w-full break-words">
              Let's play, connect, and win together!
            </p>
          </div>

          {/* PostForm + PostsList / RecentSkillsList + ComingGames */}
          <div className="w-full flex flex-col lg:flex-row lg:space-x-4 px-4">
            {/* Left: PostForm + PostsList */}
            <div className="w-full lg:w-3/4 mb-4 lg:mb-0 space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaRegListAlt className="text-green-600 dark:text-green-300 text-xl" />
                  <span className="font-bold text-lg">Share a Thought</span>
                </div>
                <PostForm />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaRegListAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  <span className="font-bold text-lg">Recent Posts</span>
                </div>
                <PostsList isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Right: RecentSkillsList + ComingGames */}
            <div className="w-full lg:w-1/4 space-y-6 mt-4 lg:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaFutbol className="text-yellow-500 dark:text-yellow-300 text-xl animate-bounce" />
                  <span className="font-bold text-lg">Latest Skills</span>
                </div>
                <RecentSkillsList />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 w-full overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <FaCalendarAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  <span className="font-bold text-lg">Game Schedule</span>
                </div>
                <ComingGames />
              </div>
            </div>
          </div>

          {/* Top Ratings */}
          <div className="w-full mt-8 mb-8  rounded-xl shadow p-6 overflow-x-auto ">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FaStar className="text-yellow-500 dark:text-yellow-300 text-xl" />
              <span className="font-bold text-lg">Top Rated Players</span>
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

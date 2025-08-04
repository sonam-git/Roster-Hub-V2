import React, { useState } from "react";
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
import ProfileAvatar from '../assets/images/profile-avatar.png';


const Home = ({ isDarkMode }) => {
  // Check login
  const isLoggedIn = Auth.loggedIn();

  // Fetch profile if logged in
  const { loading, error, data } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  const profile = data?.me || {};

  const [activeSection, setActiveSection] = useState("newpost");

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
    <main className="container mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:max-w-7xl xl:px-16">
      {isLoggedIn ? (
        <>
          {/* Welcome & Hero Section */}
          <section className="w-full flex flex-col items-center justify-center mt-8 mb-6">
            <div className="w-full bg-gradient-to-br from-blue-900 via-green-700 to-blue-900 dark:from-blue-950 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-white/60 dark:border-blue-900/60 p-6 relative overflow-hidden animate-gradient-x">
              <div className="flex items-center justify-between w-full mb-2">
                {/* Profile Image Left */}
                <div className="flex items-center justify-center mr-4">
                  {profile?.profilePic && profile?.profilePic.trim() !== "" ? (
                    <img
                      src={profile.profilePic}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-4 border-yellow-200 shadow-lg object-cover bg-white"
                      onError={e => { e.target.onerror=null; e.target.src=ProfileAvatar; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 border-4 border-yellow-200 shadow-lg">
                      <img
                        src={ProfileAvatar}
                        alt="Avatar"
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-2xl text-center w-full tracking-tight py-2 flex flex-wrap items-center justify-center gap-2">
                  {profile.name ? (
                    <>Welcome, <span className="text-yellow-200 animate-pulse">{profile.name}</span>!</>
                  ) : (
                    <>Welcome!</>
                  )}
                </h1>
                <FaFutbol className="text-yellow-200 text-6xl animate-bounce ml-2" />
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-semibold text-center w-full break-words italic mb-2">
                <span className="block text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-yellow-200 mb-2 tracking-tight animate-fade-in">Connect, play and win together</span>
              </p>
              <div className="w-full flex justify-center mt-4">
                <div className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-900 p-2 flex flex-col items-center gap-2">
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-200">Your Dashboard</span>
                  <span className="text-sm italic text-gray-700 dark:text-gray-300">All your soccer activities, posts, games, and skills in one place.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow flex flex-col items-center justify-center transition-all ${activeSection === "newpost" ? "ring-4 ring-blue-300" : ""}`}
              onClick={() => setActiveSection("newpost")}
            >
              <FaRegListAlt className="text-2xl mb-1" />
              <span className="text-xs">New Post</span>
            </button>
            <button
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow flex flex-col items-center justify-center transition-all ${activeSection === "topplayers" ? "ring-4 ring-green-300" : ""}`}
              onClick={() => setActiveSection("topplayers")}
            >
              <FaStar className="text-2xl mb-1" />
              <span className="text-xs">Top Players</span>
            </button>
            <button
              className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow flex flex-col items-center justify-center transition-all ${activeSection === "upcominggames" ? "ring-4 ring-yellow-300" : ""}`}
              onClick={() => setActiveSection("upcominggames")}
            >
              <FaCalendarAlt className="text-2xl mb-1" />
              <span className="text-xs">Upcoming Games</span>
            </button>
            <button
              className={`bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow flex flex-col items-center justify-center transition-all ${activeSection === "recentskills" ? "ring-4 ring-gray-400" : ""}`}
              onClick={() => setActiveSection("recentskills")}
            >
              <FaFutbol className="text-2xl mb-1" />
              <span className="text-xs">Recent Skills</span>
            </button>
          </section>

          {/* Main Content Sections - show only active section */}
          <section className="w-full flex flex-col gap-8 mb-8">
            {activeSection === "newpost" && (
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl p-4 border-2 border-blue-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRegListAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                    <span className="font-bold text-lg dark:text-white">Share a Thought</span>
                  </div>
                  <PostForm />
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl p-4 border-2 border-blue-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRegListAlt className="text-green-600 dark:text-green-300 text-xl" />
                    <span className="font-bold text-lg dark:text-white">Recent Posts</span>
                  </div>
                  <PostsList isDarkMode={isDarkMode} />
                </div>
              </div>
            )}
            {activeSection === "topplayers" && (
              <div className="w-full max-w-full bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl p-4 border-2 border-blue-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-yellow-500 dark:text-yellow-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">Top Rated Players</span>
                </div>
                <div className="w-full overflow-x-auto">
                  <RatingDisplay limit={10} />
                </div>
              </div>
            )}
            {activeSection === "upcominggames" && (
              <div className="w-full max-w-full bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl p-4 border-2 border-blue-200 dark:border-gray-700 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2 w-full">
                  <FaCalendarAlt className="text-blue-600 dark:text-blue-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">Upcoming Games</span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <ComingGames />
                </div>
              </div>
            )}
            {activeSection === "recentskills" && (
              <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-xl p-4 border-2 border-blue-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FaFutbol className="text-yellow-500 dark:text-yellow-300 text-xl" />
                  <span className="font-bold text-lg dark:text-white">Recent Skills</span>
                </div>
                <RecentSkillsList />
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
          <Hero />
        </div>
      )}
    </main>
  );
};

export default Home;
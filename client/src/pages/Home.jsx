import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME, QUERY_GAMES } from "../utils/queries";
import Auth from "../utils/auth";
import PostForm from "../components/PostForm";
import PostsList from "../components/PostsList";
import ComingGames from "../components/ComingGames";
import RatingDisplay from "../components/RatingDisplay";
import RecentSkillsList from "../components/RecentSkillsList";
import UserInfoUpdate from "../components/UserInfoUpdate";
import MetricDescription from "../components/MetricDescription";
import { FaFutbol, FaRegListAlt, FaStar, FaCalendarAlt } from "react-icons/fa";
import ProfileAvatar from '../assets/images/profile-avatar.png';



const Home = ({ isDarkMode }) => {
  // Check login
  const isLoggedIn = Auth.loggedIn();

  // Fetch profile if logged in
  const { loading, error, data } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  
  // Fetch games data for metrics
  const { data: gamesData } = useQuery(QUERY_GAMES, {
    skip: !isLoggedIn,
  });
  
  const profile = data?.me || {};
  const allGames = gamesData?.games || [];

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
    <main className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 lg:mt-5 pt-4 max-w-7xl">
      {isLoggedIn ? (
        <>
          {/* Welcome & Hero Section */}
          <section className="w-full flex flex-col items-center justify-center mt-8 mb-6">
            <div className="w-full bg-white dark:bg-gradient-to-br dark:from-blue-950 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-blue-900/60 p-6 relative overflow-visible">
              {/* Dashboard Info */}
              <div className="w-full flex justify-center mb-3">
                <div className="w-full bg-gradient-to-r from-blue-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-2 border-blue-300 dark:border-blue-700 p-4">
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left Section: Profile Image with Rating Badge */}
                    <div className="flex items-center gap-3">
                      {/* Profile Image with Rating Badge */}
                      <div className="flex-shrink-0 relative">
                        {profile?.profilePic && profile?.profilePic.trim() !== "" ? (
                          <img
                            src={profile.profilePic}
                            alt="Profile"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-500 dark:border-yellow-400 shadow-xl object-cover bg-white hover:scale-110 transition-transform duration-300"
                            onError={e => { e.target.onerror=null; e.target.src=ProfileAvatar; }}
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 border-4 border-blue-500 dark:border-yellow-400 shadow-xl hover:scale-110 transition-transform duration-300">
                            <img
                              src={ProfileAvatar}
                              alt="Avatar"
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Rating Badge - Bottom Right */}
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full px-2 py-1 shadow-lg border-2 border-white dark:border-gray-800 flex items-center gap-1">
                          <FaStar className="text-white text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {profile?.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Center Section: Welcome Message & Slogan */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                        Welcome{profile?.name ? `, ${profile.name}` : ''}!
                      </h2>
                      <p className="text-sm sm:text-base italic text-gray-600 dark:text-gray-400">
                        ⚽ All your soccer activities in one place ⚽
                      </p>
                    </div>

                    {/* User Info Update Component */}
                    <UserInfoUpdate profile={profile} />

                  </div>
                </div>
              </div>

              {/* Metrics Grid - delegated to MetricDescription component */}
              <MetricDescription profile={profile} allGames={allGames} />
            </div>
          </section>

          {/* Quick Actions */}
          <section className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
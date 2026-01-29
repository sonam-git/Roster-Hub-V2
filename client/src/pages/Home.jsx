import React, { useState, useEffect } from "react";
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
import { useOrganization } from "../contexts/OrganizationContext";
import { FaFutbol, FaRegListAlt, FaStar, FaCalendarAlt } from "react-icons/fa";
import ProfileAvatar from '../assets/images/profile-avatar.png';



const Home = ({ isDarkMode }) => {
  // Check login
  const isLoggedIn = Auth.loggedIn();
  const { currentOrganization } = useOrganization();

  // Fetch profile if logged in
  const { loading, error, data } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  
  // Fetch games data for metrics
  const { data: gamesData, refetch: refetchGames } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !isLoggedIn || !currentOrganization,
  });
  
  // Refetch games when organization changes
  useEffect(() => {
    if (currentOrganization && isLoggedIn) {
      refetchGames({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, isLoggedIn, refetchGames]);
  
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
    <main className={`w-full mx-auto px-1 md:px-6 lg:px-8 xl:px-12 pt-2 max-w-7xl relative z-0 ${Auth.loggedIn() ? 'mt-16 lg:mt-20 pt-4' : 'mt-0'}`}>
      {isLoggedIn ? (
        <>
          {/* Welcome & Hero Section */}
          <section className="w-full flex flex-col items-center justify-center mb-6 relative  z-5">
            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 relative overflow-visible ">
              {/* Dashboard Info */}
              <div className="w-full flex justify-center mb-4">
                <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 p-4">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Left Section: Profile Image with Rating Badge */}
                    <div className="flex items-center gap-3 ">
                      {/* Profile Image with Rating Badge */}
                      <div className="flex-shrink-0 relative ">
                        {profile?.profilePic && profile?.profilePic.trim() !== "" ? (
                          <img
                            src={profile.profilePic}
                            alt="Profile"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-blue-600 dark:border-blue-500 shadow-md object-cover bg-gray-50 hover:scale-105 transition-transform duration-200"
                            onError={e => { e.target.onerror=null; e.target.src=ProfileAvatar; }}
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-blue-600 dark:bg-blue-500 border-2 border-blue-700 dark:border-blue-400 shadow-md hover:scale-105 transition-transform duration-200">
                            <img
                              src={ProfileAvatar}
                              alt="Avatar"
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Rating Badge - Bottom Right */}
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 dark:bg-yellow-600 rounded-full px-2 py-1 shadow-md border-2 border-white dark:border-gray-800 flex items-center gap-1">
                          <FaStar className="text-white text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {profile?.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Center Section: Welcome Message & Slogan */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                        Welcome{profile?.name ? `, ${profile.name[0].toUpperCase() + profile.name.slice(1)}` : 'to Rosterhub'}!
                      </h2>
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                        ⚽ All your soccer activities in one place
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
          <section className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 relative z-0">
            <button
              type="button"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer ${activeSection === "newpost" ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('New Post button clicked');
                setActiveSection("newpost");
              }}
            >
              <FaRegListAlt className="text-2xl mb-1 pointer-events-none" />
              <span className="text-xs pointer-events-none">New Post</span>
            </button>
            <button
              type="button"
              className={`bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer ${activeSection === "topplayers" ? "ring-2 ring-green-600 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Top Players button clicked');
                setActiveSection("topplayers");
              }}
              aria-label="View top players"
            >
              <FaStar className="text-2xl mb-1 pointer-events-none" aria-hidden="true" />
              <span className="text-xs font-semibold pointer-events-none">Top Players</span>
            </button>
            <button
              type="button"
              className={`bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer ${activeSection === "upcominggames" ? "ring-2 ring-yellow-600 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Upcoming Games button clicked');
                setActiveSection("upcominggames");
              }}
              aria-label="View upcoming games"
            >
              <FaCalendarAlt className="text-2xl mb-1 pointer-events-none" aria-hidden="true" />
              <span className="text-xs font-semibold pointer-events-none">Upcoming Games</span>
            </button>
            <button
              type="button"
              className={`bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 rounded-md shadow-sm flex flex-col items-center justify-center transition-all cursor-pointer ${activeSection === "recentskills" ? "ring-2 ring-gray-600 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Recent Skills button clicked');
                setActiveSection("recentskills");
              }}
            >
              <FaFutbol className="text-2xl mb-1 pointer-events-none" />
              <span className="text-xs pointer-events-none">Recent Skills</span>
            </button>
          </section>

          {/* Main Content Sections - show only active section */}
          <section className="w-full flex flex-col gap-8 mb-8 relative z-0">
            {activeSection === "newpost" && (
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaRegListAlt className="text-blue-600 dark:text-blue-400 text-lg" />
                    <span className="font-semibold text-base text-gray-900 dark:text-white">Share a Thought</span>
                  </div>
                  <PostForm />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaRegListAlt className="text-green-600 dark:text-green-400 text-lg" />
                    <span className="font-semibold text-base text-gray-900 dark:text-white">Recent Posts</span>
                  </div>
                  <PostsList isDarkMode={isDarkMode} />
                </div>
              </div>
            )}
            {activeSection === "topplayers" && (
              <div className="w-full max-w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaStar className="text-yellow-500 dark:text-yellow-400 text-lg" />
                  <span className="font-semibold text-base text-gray-900 dark:text-white">Top Rated Players</span>
                </div>
                <div className="w-full overflow-x-auto">
                  <RatingDisplay limit={10} />
                </div>
              </div>
            )}
            {activeSection === "upcominggames" && (
              <div className="w-full max-w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3 w-full">
                  <FaCalendarAlt className="text-blue-600 dark:text-blue-400 text-lg" />
                  <span className="font-semibold text-base text-gray-900 dark:text-white">Upcoming Games</span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <ComingGames />
                </div>
              </div>
            )}
            {activeSection === "recentskills" && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaFutbol className="text-yellow-500 dark:text-yellow-400 text-lg" />
                  <span className="font-semibold text-base text-gray-900 dark:text-white">Recent Skills</span>
                </div>
                <RecentSkillsList />
              </div>
            )}
          </section>


        </>
      ) : (
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh] relative">
               {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
          <div className="relative z-10">
            <Hero />
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
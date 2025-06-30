// src/pages/Home.jsx
import React from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME } from "../utils/queries";
import Auth from "../utils/auth";
import Welcome from "../components/Welcome";
import PostForm from "../components/PostForm";
import PostsList from "../components/PostsList";
import RecentSkillsList from "../components/RecentSkillsList";
import ComingGames from "../components/ComingGames";
import RatingDisplay from "../components/RatingDisplay";

const Home = ({ isDarkMode }) => {
  // 1️⃣ Check login
  const isLoggedIn = Auth.loggedIn();

  // 2️⃣ Fetch profile if logged in
  const { loading, error, data } = useQuery(QUERY_ME, {
    skip: !isLoggedIn,
  });
  const profile = data?.me || {};

  // 3️⃣ Loading / error states
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
    <main className="container mx-auto px-4 lg:mt-5">
      {isLoggedIn ? (
        <div className="flex flex-col items-center">
          {/* Welcome banner full-width */}
          <div className="w-full mb-4">
            <Welcome username={profile.name} />
          </div>

          {/* PostForm + PostsList / RecentSkillsList + ComingGames */}
          <div className="w-full flex flex-col lg:flex-row lg:space-x-4">
            {/* Left: PostForm + PostsList */}
            <div className="w-full lg:w-3/4 mb-4 lg:mb-0 space-y-6">
              <PostForm />
              <PostsList isDarkMode={isDarkMode} />
            </div>

            {/* Right: RecentSkillsList + ComingGames */}
            <div className="w-full lg:w-1/4 space-y-6">
              <RecentSkillsList />
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md shadow-md">
                <h2 className="text-center font-bold text-lg">
                  Game Schedule
                </h2>
              </div>
              <ComingGames />
            </div>
          </div>

          {/* Top Ratings */}
          <div className="w-full mt-8 mb-8">
            <RatingDisplay limit={10} />
          </div>
        </div>
      ) : (
        <Hero />
      )}
    </main>
  );
};

export default Home;

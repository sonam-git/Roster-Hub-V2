import React from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME } from "../utils/queries";
import Auth from "../utils/auth";
import Welcome from "../components/Welcome";
import PostForm from "../components/PostForm";
import PostsList from "../components/PostsList";
import RatingDisplay from "../components/RatingDisplay";
import RecentSkillsList from "../components/RecentSkillsList";
import ComingGames from "../components/ComingGames";

const Home = ({ isDarkMode }) => {
  // 1) Do this first: show Hero if not logged in
  const isLoggedIn = Auth.loggedIn();

  // 2) Now run your user‐profile query
  const { loading, error, data } = useQuery(QUERY_ME);
  
  // Note: useQuery automatically handles loading and error states
  if (!isLoggedIn) {
    return (
      <main className="container mx-auto px-4 mt-5">
        <Hero />
      </main>
    );
  }
  // 3) Handle the async states
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading your profile.
      </div>
    );
  }

  // 4) Guard against missing profile
  const profile = data?.me;
  if (!profile) {
    return <div className="text-center py-10">No profile found.</div>;
  }

  // 5) And finally, show the home dashboard
  return (
    <main className="container mx-auto px-4 mt-5">
      {/* Welcome Banner */}
      <div className="w-full mb-6">
        <Welcome username={profile.name} />
      </div>

      {/* Main 4-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left (3 cols): PostForm + PostsList */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PostForm />
          <PostsList isDarkMode={isDarkMode} />
        </div>

        {/* Right (1 col): RecentSkillsList + ComingGames */}
        <div className="space-y-6">
          <RecentSkillsList />
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md shadow-md">
            <h2 className="text-center font-bold mb-2 text-sm md:text-xl lg:text-2xl">
              Game Schedule
            </h2>
          </div>
          <ComingGames />
        </div>
      </div>

      {/* Top Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="col-span-1 lg:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold text-left mt-4">Top Ratings</h2>
          <RatingDisplay limit={10} />
        </div>
      </div>
    </main>
  );
};

export default Home;

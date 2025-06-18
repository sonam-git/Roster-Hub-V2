// src/pages/Home.jsx
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
  const { loading, data } = useQuery(QUERY_ME);
  const profile = data?.me || {};
  const isLoggedIn = Auth.loggedIn();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <main className="container mx-auto px-4 mt-5">
        <Hero />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 mt-5">
      {/* ─── Welcome Banner ─── */}
      <div className="w-full mb-6">
        <Welcome username={profile.name} />
      </div>

      {/* ─── Main 4-col layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ─── LEFT (3 cols): PostForm, PostsList, Top Ratings ─── */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PostForm />

          {/* Your feed + pagination */}
          <PostsList isDarkMode={isDarkMode} />

          {/* Top Ratings, right under PostsList */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Top Ratings</h2>
            <RatingDisplay limit={10} />
          </div>
        </div>

        {/* ─── RIGHT (1 col): Recent Skills + Coming Games ─── */}
        <div className="space-y-6">
          <RecentSkillsList />
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Schedule</h2>
            <ComingGames />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

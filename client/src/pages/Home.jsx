import React from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME } from "../utils/queries";
import Auth from "../utils/auth";
import Welcome from "../components/Welcome";
import PostsList from "../components/PostsList";
import RecentSkillsList from "../components/RecentSkillsList";
import PostForm from "../components/PostForm";
import RatingDisplay from "../components/RatingDisplay";
import ComingGames from "../components/ComingGames";

const Home = ({ isDarkMode }) => {
  const { loading, data } = useQuery(QUERY_ME);
  const profile = data?.me || {};
  const isLoggedIn = Auth.loggedIn();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-2 mt-5">
      <div className="flex flex-col items-center">
        {isLoggedIn ? (
          <>
            <div className="w-full mb-4">
              <Welcome username={profile.name} />
            </div>
            <div className="w-full flex flex-col lg:flex-row lg:space-x-4">
              <div className="w-full lg:w-3/4 mb-4 lg:mb-0">
                <>
                  <div className="dark:bg-gray-700 bg-blue-200 shadow-md rounded-lg p-6 mb-4">
                    <PostForm />
                  </div>
                  <PostsList isDarkMode={isDarkMode} />
                  {/* ─── Top Ratings ─── */}
                  <div className="flex items-start mt-8">
                    {/* vertical heading */}
                    <div
                      className="text-xs font-bold uppercase mr-4"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "upright",
                      }}
                    >
                      Top Rating
                    </div>

                    {/* your horizontal rating bar */}
                    <RatingDisplay limit={10} />
                  </div>
                </>
              </div>
              <div className="w-full lg:w-1/4">
                <RecentSkillsList />
                <ComingGames />
               
              </div>
              
            </div>
            
          </>
        ) : (
          <Hero />
        )}
      </div>
    </main>
  );
};

export default Home;

import React from "react";
import { useQuery } from "@apollo/client";
import Hero from "../components/Hero";
import { QUERY_ME } from "../utils/queries";
import Auth from "../utils/auth";
import Welcome from "../components/Welcome";
import PostsList from "../components/PostsList";
import RecentSkillsList from "../components/RecentSkillsList";
import PostForm from "../components/PostForm";

const Home = () => {
  const { loading, data } = useQuery(QUERY_ME);
  const profile = data?.me || {};
  const isLoggedIn = Auth.loggedIn();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 mt-5">
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
                  <PostsList />
                </>
              </div>
              <div className="w-full lg:w-1/4">
                <RecentSkillsList />
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

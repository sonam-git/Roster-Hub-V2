import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_POSTS } from "../../utils/queries";
import {
  POST_ADDED_SUBSCRIPTION,
  POST_UPDATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import Post from "../Post";
import Auth from "../../utils/auth";

const PAGE_SIZE = 3;

const PostsList = ({ profileId, profile }) => {
  const { loading, data, error, subscribeToMore } = useQuery(GET_POSTS);
  const [currentPage, setCurrentPage] = useState(1);

  // Wire up all three subscriptions
  useEffect(() => {
    const unsubAdd = subscribeToMore({
      document: POST_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const newPost = subscriptionData.data?.postAdded;
        if (!newPost || prev.posts.some((p) => p._id === newPost._id)) {
          return prev;
        }
        return { posts: [newPost, ...prev.posts] };
      },
    });

    const unsubUpdate = subscribeToMore({
      document: POST_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const updated = subscriptionData.data?.postUpdated;
        if (!updated) return prev;
        return {
          posts: prev.posts.map((p) =>
            p._id === updated._id ? updated : p
          ),
        };
      },
    });

    const unsubDelete = subscribeToMore({
      document: POST_DELETED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const deletedId = subscriptionData.data?.postDeleted;
        if (!deletedId) return prev;
        return {
          posts: prev.posts.filter((p) => p._id !== deletedId),
        };
      },
    });

    return () => {
      unsubAdd();
      unsubUpdate();
      unsubDelete();
    };
  }, [subscribeToMore]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts.</div>;
  
  // Get the logged-in user ID
  const loggedInUserId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  const isOwnProfile = profileId && profileId === loggedInUserId;
  
  if (!data || !data?.posts || !data?.posts.length) {
    return (
      <div className="w-full py-8">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-10 text-center backdrop-blur-sm">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            No Posts Yet
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {isOwnProfile || !profileId
              ? "Be the first to share your thoughts! Create your first post and start engaging with the community."
              : profile?.username 
                ? `${profile.username}'s thoughts will appear here once posted. Your reaction and thoughts on their posts will be appreciated. Stay tuned!`
                : "Posts will appear here once shared. Stay tuned!"
            }
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>{isOwnProfile || !profileId ? "Your posts will appear here" : "Check back soon"}</span>
          </div>
        </div>
      </div>
    );
  }


  // Filter by profile if needed
  const allPosts = data.posts;
  const loginPost = allPosts.filter((p) => p.userId._id === profileId)
  if(loginPost.length === 0 && profileId) { 
    return (
      <div className="w-full py-8">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-10 text-center backdrop-blur-sm">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
                />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            No Posts Yet
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {profile?.username 
              ? `${profile.username}'s thoughts will appear here once posted. Your reaction and thoughts on their posts will be appreciated. Stay tuned!`
              : "Posts will appear here. Stay tuned for the first post!"
            }
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>Check back soon</span>
          </div>
        </div>
      </div>
    );
  }
  const postsToDisplay = profileId
    ? loginPost
    : allPosts;

  // Pagination
  const totalPages = Math.ceil(postsToDisplay.length / PAGE_SIZE);
  const paginated = postsToDisplay.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  return (
    <div className="space-y-6">
      {paginated.map((post) => (
        <Post key={post._id} post={post} />
      ))}

      {/* ← Prev / Next Pagination → */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Prev
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostsList;

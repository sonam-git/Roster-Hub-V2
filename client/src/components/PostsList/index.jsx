import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_POSTS } from "../../utils/queries";
import {
  POST_ADDED_SUBSCRIPTION,
  POST_UPDATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import Post from "../Post";

const PAGE_SIZE = 3;

const PostsList = ({ profileId }) => {
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
  
  if (!data || !data?.posts || !data?.posts.length) {
    return <h3 className=' ml-3 text-left text-sm lg:text-md dark:text-white '>No post yet, create your first post. </h3>;
  }


  // Filter by profile if needed
  const allPosts = data.posts;
  const loginPost = allPosts.filter((p) => p.userId._id === profileId)
  if(loginPost.length === 0 && profileId) { 
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-blue-600 dark:text-blue-400" 
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Posts Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Posts will appear here. Stay tuned for the first post!
            </p>
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

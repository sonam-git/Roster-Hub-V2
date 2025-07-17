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

const PostsList = ({ profileId, profile }) => {
  const { loading, data, error, subscribeToMore } = useQuery(GET_POSTS);
  const [currentPage, setCurrentPage] = useState(1);
  const user = profile?.name || "";

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
          posts: prev.posts.map((p) => (p._id === updated._id ? updated : p)),
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
    return (
      <h3 className=" ml-3 text-left text-sm lg:text-md dark:text-white ">
        No post yet, create your first post.{" "}
      </h3>
    );
  }

  // Filter by profile if needed
  const allPosts = data.posts;
  const loginPost = allPosts.filter((p) => p.userId._id === profileId);
  if (loginPost.length === 0 && profileId) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8">
       <p className="text-md text-gray-500 dark:text-gray-400 italic">
          {user ? `${user} hasn't posted anything yet.` : `You haven't posted anything yet.`}
        </p>
      </div>
    );
  }
  const postsToDisplay = profileId ? loginPost : allPosts;

  // Pagination
  const totalPages = Math.ceil(postsToDisplay.length / PAGE_SIZE);
  const paginated = postsToDisplay.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  return (
    <div className="space-y-6 w-full">
      {paginated.map((post) => (
        <Post key={post._id} post={post} />
      ))}

      {/* ← Prev / Next Pagination → */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-1 rounded font-semibold text-xs sm:text-sm transition-all duration-200 shadow border-2 border-blue-200 dark:border-gray-700 ${
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
          className={`px-4 py-1 rounded font-semibold text-xs sm:text-sm transition-all duration-200 shadow border-2 border-blue-200 dark:border-gray-700 ${
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

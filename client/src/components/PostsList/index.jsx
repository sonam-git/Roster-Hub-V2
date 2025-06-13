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
    return <h3 className='text-sm lg:text-lg font-bold'>No posts yet </h3>;
  }


  // Filter by profile if needed
  const allPosts = data.posts;
  const postsToDisplay = profileId
    ? allPosts.filter((p) => p.userId._id === profileId)
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
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 mx-1 ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostsList;

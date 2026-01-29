import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_POSTS } from "../../utils/queries";
import {
  POST_ADDED_SUBSCRIPTION,
  POST_UPDATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import Spinner from "../Spinner";
import Post from "../Post";
import Auth from "../../utils/auth";
import { useOrganization } from "../../contexts/OrganizationContext";

const PAGE_SIZE = 3;

const PostsList = ({ profileId, profile }) => {
  const { currentOrganization } = useOrganization();
  const { loading, data, error, subscribeToMore, refetch } = useQuery(GET_POSTS, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
      setCurrentPage(1); // Reset to first page
    }
  }, [currentOrganization, refetch]);

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

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner size="sm" />;
  }

  if (loading) return <Spinner size="sm" />;
  if (error) return <div>Error loading posts.</div>;
  
  // Get the logged-in user ID
  const loggedInUserId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  const isOwnProfile = profileId && profileId === loggedInUserId;
  
  if (!data || !data?.posts || !data?.posts.length) {
    return (
      <div className="w-full">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-gray-400 dark:text-gray-500" 
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Posts Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isOwnProfile || !profileId
              ? "Be the first to share your thoughts!"
              : profile?.username 
                ? `${profile.username}'s posts will appear here.`
                : "Posts will appear here once shared."
            }
          </p>
        </div>
      </div>
    );
  }


  // Filter by profile if needed
  const allPosts = data.posts;
  const loginPost = allPosts.filter((p) => p.userId._id === profileId)
  if(loginPost.length === 0 && profileId) { 
    return (
      <div className="w-full">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-gray-400 dark:text-gray-500" 
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Posts Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile?.name 
              ? `${profile.name}'s posts will appear here.`
              : "Posts1 will appear here soon."
            }
          </p>
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
    <div className="space-y-4">
      {paginated.map((post) => (
        <Post key={post._id} post={post} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              currentPage === 1
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Previous
          </button>
          <div className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white border border-blue-600">
            {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              currentPage === totalPages
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsList;

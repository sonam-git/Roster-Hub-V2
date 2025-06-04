import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries';
import Post from '../Post';
import Auth from '../../utils/auth';

const PAGE_SIZE = 3; // Number of posts per page

const PostsList = ({ profileId }) => {
  const { loading, data, error } = useQuery(GET_POSTS);
  const loggedInUserId = Auth.getProfile().data._id;
  
  const [currentPage, setCurrentPage] = useState(1); // Current page number

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading posts</div>;
  }

  if (!data || !data.posts || !data.posts.length) {
    return <h3 className='text-sm lg:text-lg font-bold'>No posts yet </h3>;
  }

  const userPost = data.posts.filter(post => post.userId === profileId);
  const myPost = data.posts.filter(post => post.userId === loggedInUserId);

  // Determine posts to display based on profileId
  const postsToDisplay = profileId
    ? userPost
    : [...myPost, ...data.posts.filter(post => post.userId !== loggedInUserId)];

    if (postsToDisplay.length === 0) {
      return (
        <div className="">
          <h3 className="text-center font-bold text-sm md:text-lg lg:text-lg xl:text-2xl">
            No posts yet
          </h3>
        </div>
      );
    }

  // Calculate total number of pages
  const totalPages = Math.ceil(postsToDisplay.length / PAGE_SIZE);

  // Slice the posts based on current page
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPosts = postsToDisplay.slice(startIndex, endIndex);

  // Function to handle page navigation
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {paginatedPosts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`px-3 py-1 mx-1 ${
              currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            } rounded`}
            onClick={() => goToPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostsList;

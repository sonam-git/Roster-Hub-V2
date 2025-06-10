import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../../utils/mutations";
import { GET_POSTS } from '../../utils/queries';
import Auth from "../../utils/auth";
import PostsList from "../PostsList";

const PostForm = () => {
  const [postText, setPostText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
 const userId = Auth.getProfile().data._id;

  const [addPost] = useMutation(ADD_POST, {
  update(cache, { data: { addPost } }) {
      try {
        const { posts } = cache.readQuery({ query: GET_POSTS }) || { posts: [] };
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: [addPost, ...posts] },
        });
      } catch (e) {
        console.error('Error updating cache', e);
      }
    },
    onCompleted() {
      setPostText("");
    },
    onError(err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await addPost({ variables: { profileId: userId, postText } });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div>
      <h4 className="text-sm md:text-md lg:text-lg xl:text-2xl font-bold mb-2 ml-3">
        What's on your mind?
      </h4>
      {Auth.loggedIn() ? (
        <>
          <form
            className="flex-row justify-center justify-space-between-md align-center"
            onSubmit={handleFormSubmit}
          >
            <div className="col-12 col-lg-9">
              <input
                placeholder="What's on your mind?"
                value={postText}
                className="mb-2 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(event) => setPostText(event.target.value)}
              />
            </div>
            <div className="col-12 col-lg-3">
              <button
                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2.5"
                type="submit"
              >
                Post Now
              </button>
            </div>
            {errorMessage && (
              <div className="col-12 my-3 bg-danger text-white p-3">
                {errorMessage}
              </div>
            )}
          </form>
          <PostsList  profileId = { userId}/>
        </>
      ) : (
        <p>
          You need to be logged in to add information. Please{" "}
          <Link to="/login">Login</Link> or <Link to="/signup">Signup</Link>
        </p>
      )}
    </div>
  );
};

export default PostForm;
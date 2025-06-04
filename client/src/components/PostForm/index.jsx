import React, { useState, startTransition } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../../utils/mutations";
import { GET_POSTS } from "../../utils/queries";
import Auth from "../../utils/auth";
import PostsList from "../PostsList";

const PostForm = () => {
  const [postText, setPostText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const userId = Auth.getProfile().data._id;

  const [addPost, { loading }] = useMutation(ADD_POST, {
    variables: { profileId: userId },
    update(cache, { data: { addPost } }) {
      try {
        const { posts } = cache.readQuery({ query: GET_POSTS }) || { posts: [] };
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: [addPost, ...posts] },
        });
      } catch (e) {
        console.error("Error updating cache", e);
      }
    },
    onCompleted() {
      setPostText("");
    },
    onError(err) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    },
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await addPost({ variables: { profileId: userId, postText } });
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    });
  };

  return (
    <div>
      <h4 className="text-sm md:text-md lg:text-lg xl:text-2xl font-bold mb-2 ml-3">
        What's on your mind?
      </h4>
      {Auth.loggedIn() ? (
        <>
          <form onSubmit={handleFormSubmit} className="flex-row justify-center align-center">
            <div className="col-12 col-lg-9">
              <input
                placeholder="What's on your mind?"
                value={postText}
                className="mb-2 block w-full rounded-md border-0 px-3.5 py-2"
                onChange={(e) => setPostText(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="col-12 col-lg-3">
              <button
                type="submit"
                className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Now"}
              </button>
            </div>
            {errorMessage && (
              <div className="col-12 my-3 bg-red-500 text-white p-3">
                {errorMessage}
              </div>
            )}
          </form>
          <PostsList loggedInUserId={userId} />
        </>
      ) : (
        <p>
          You need to be logged in to add information. Please <Link to="/login">Login</Link> or <Link to="/signup">Signup</Link>
        </p>
      )}
    </div>
  );
};

export default PostForm;
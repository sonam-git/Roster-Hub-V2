import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST } from "../../utils/mutations";
import { GET_POSTS } from "../../utils/queries";
import { useActionState } from "react";
import Auth from "../../utils/auth";
import PostsList from "../PostsList";
import { Link } from "react-router-dom";

const PostForm = () => {
  const userId = Auth.getProfile()?.data?._id;
  const [clientError, setClientError] = useState("");

  const [addPost] = useMutation(ADD_POST, {
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
  });

  const [serverError, formAction, isPending] = useActionState(
    async (_, formData) => {
      const postText = formData.get("postText");
      try {
        await addPost({ variables: { profileId: userId, postText } });
        return null;
      } catch (err) {
        return err.message || "Server error occurred.";
      }
    },
    null
  );

  const handleEmptyCheck = (event) => {
    const postText = event.target.elements.postText?.value || "";
    if (!postText.trim()) {
      event.preventDefault();
      setClientError("Post cannot be empty.");
      setTimeout(() => setClientError(""), 3000);
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
            action={formAction}
            onSubmit={handleEmptyCheck}
            aria-busy={isPending}
            className="flex-row justify-center justify-space-between-md align-center"
          >
            <div className="col-12 col-lg-9">
              <input
                name="postText"
                placeholder="What's on your mind?"
                disabled={isPending}
                className="mb-2 block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50"
              />
            </div>
            <div className="col-12 col-lg-3">
              <button
                type="submit"
                disabled={isPending}
                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-2.5 disabled:opacity-50"
              >
                {isPending ? "Posting…" : "Post Now"}
              </button>
            </div>

            {(clientError || serverError) && (
              <div className="col-12 my-3 bg-red-500 text-white italic p-3 rounded">
                {clientError || serverError}
              </div>
            )}
          </form>
          <PostsList profileId={userId} />
        </>
      ) : (
        <p className="ml-3">
          You need to be logged in to add information. Please{" "}
          <Link to="/login" className="underline text-blue-600">
            Login
          </Link>{" "}
          or{" "}
          <Link to="/signup" className="underline text-blue-600">
            Signup
          </Link>
          .
        </p>
      )}
    </div>
  );
};

export default PostForm;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/solid";
import { REMOVE_COMMENT, UPDATE_COMMENT } from "../../utils/mutations";
import { GET_POSTS } from "../../utils/queries";
import Auth from "../../utils/auth";

const CommentList = ({ post, comments }) => {
  console.log('line 10',post)
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");

  const postId = post._id;

  const [removeComment] = useMutation(REMOVE_COMMENT, {
    update(cache, { data: { removeComment } }) {
      try {
        const { posts } = cache.readQuery({ query: GET_POSTS });
        cache.writeQuery({
          qyery: GET_POSTS,
          data: { posts: [...posts, removeComment] },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    update(cache, { data: { updateComment } }) {
      try {
        const { posts } = cache.readQuery({ query: GET_POSTS });
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              comments: p.comments.map((comment) =>
                comment._id === updateComment._id ? updateComment : comment
              ),
            };
          }
          return p;
        });
        cache.writeQuery({
          query: GET_POSTS,
          data: { posts: updatedPosts },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await removeComment({ variables: { postId, commentId } });
      setDeleteSuccessMessage("Comment deleted successfully");
      setTimeout(() => {
        setDeleteSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      await updateComment({ variables: { commentId, commentText } });
      setEditingCommentId(null);
      setCommentText("");
      setUpdateSuccessMessage("Comment updated successfully");
      setTimeout(() => {
        setUpdateSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  return (
    
    <div className="mt-4 border-t pt-4">
      {deleteSuccessMessage && (
        <p className="text-red-500">{deleteSuccessMessage}</p>
      )}
      {updateSuccessMessage && (
        <p className="text-green-500">{updateSuccessMessage}</p>
      )}
      {comments?.length > 0 ? (
        comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-gray-50 dark:bg-gray-700 shadow-sm rounded-lg p-3 mb-3"
          >
            {editingCommentId === comment._id ? (
              <div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 mt-2 border rounded dark:text-black"
                />
                <button
                  onClick={() => handleUpdateComment(comment._id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded mt-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded mt-2 ml-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <Link
                className="flex items-center hover:no-underline dark:hover:text-white"
                to={`/profiles/${comment.userId}`}
              >
               
                <h4 className="text-sm font-semibold text-left">
                  {comment.commentAuthor}
                </h4>
                </Link>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-left text-sm sm:text-base">
                  {comment.commentText}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {new Date(parseInt(comment.createdAt)).toLocaleString()}
                  </div>
                  {Auth.loggedIn() &&
                    Auth.getProfile().data._id === comment.userId && (
                      <div className="flex space-x-2">
                        <PencilAltIcon
                          className="h-5 w-5 text-blue-500 cursor-pointer"
                          title="Update"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setCommentText(comment.commentText);
                          }}
                        />
                        <TrashIcon
                          className="h-5 w-5 text-red-500 cursor-pointer"
                          title="Delete"
                          onClick={() =>
                            handleDeleteComment(postId, comment._id)
                          }
                        />
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No comments yet</p>
      )}
    </div>
  );
};

export default CommentList;

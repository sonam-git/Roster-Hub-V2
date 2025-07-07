import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/solid";
import { REMOVE_COMMENT, UPDATE_COMMENT } from "../../utils/mutations";
import CommentLike from "../CommentLike"; 

export default function CommentList({
  postId,
  comments,
  currentUserId,
}) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [text, setText] = useState("");

  const [removeComment] = useMutation(REMOVE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);

  const handleDelete = async (commentId) => {
    await removeComment({
      variables: { postId, commentId },
    });
    // Post.jsx subscription will remove it from UI
  };

  const handleSave = async (commentId) => {
    await updateComment({
      variables: { commentId, commentText: text },
    });
    setEditingCommentId(null);
    // Post.jsx subscription will update it in UI
  };

  
  return (
    <div className="space-y-3">
      {comments.length > 0 ? (
        comments.map((c) => (
          <div
            key={c._id}
            className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow-sm"
          >
            {editingCommentId === c._id ? (
              <>
                <textarea
                  className="w-full p-2 mt-2 border rounded dark:text-black"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleSave(c._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={`/profiles/${c.userId}`}
                  className="font-semibold hover:no-underline dark:hover:text-yellow-300 dark:text-white"
                >
                  {c.commentAuthor}
                </Link>
                <p className="mt-1 text-xs font-thin dark:text-white">{c.commentText}</p>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(parseInt(c.createdAt)).toLocaleString()}
                  </span>
                  {/* ← comment-like button */}
                  <CommentLike 
                    comment={c} 
                    currentUserId={currentUserId} 
                  />
                  {currentUserId === c.userId && (
                    <div className="flex space-x-2">
                      <PencilAltIcon
                        className="h-5 w-5 text-blue-500 cursor-pointer"
                        onClick={() => {
                          setEditingCommentId(c._id);
                          setText(c.commentText);
                        }}
                      />
                      <TrashIcon
                        className="h-5 w-5 text-red-500 cursor-pointer"
                        onClick={() => handleDelete(c._id)}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center italic dark:text-white">No comments yet</p>
      )}
    </div>
  );
}

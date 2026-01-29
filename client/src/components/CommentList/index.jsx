import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { REMOVE_COMMENT, UPDATE_COMMENT } from "../../utils/mutations";
import CommentLike from "../CommentLike";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function CommentList({
  postId,
  comments,
  currentUserId,
}) {
  const { currentOrganization } = useOrganization();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [text, setText] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [removeComment] = useMutation(REMOVE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);

  const handleDeleteClick = (commentId) => {
    setDeleteCommentId(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentOrganization || !deleteCommentId) {
      console.error('No organization selected or comment ID');
      return;
    }
    
    try {
      await removeComment({
        variables: { 
          postId, 
          commentId: deleteCommentId,
          organizationId: currentOrganization._id
        },
      });
      setShowDeleteModal(false);
      setDeleteCommentId(null);
      // Post.jsx subscription will remove it from UI
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
      setShowDeleteModal(false);
      setDeleteCommentId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteCommentId(null);
  };

  const handleSave = async (commentId) => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await updateComment({
        variables: { 
          commentId, 
          commentText: text,
          organizationId: currentOrganization._id
        },
      });
      setEditingCommentId(null);
      // Post.jsx subscription will update it in UI
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  
  return (
    <>
      <div className="space-y-2 ">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="bg-gray-50 dark:bg-gray-750 rounded-md ">
              {editingCommentId === c._id ? (
                <div className="space-y-2">
                  <textarea 
                    className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600
                      bg-gray-50 border-gray-300 text-gray-900
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(c._id)} 
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingCommentId(null)} 
                      className="px-3 py-1 border text-xs font-medium rounded-md transition-colors
                        bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-50
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dark:bg-gray-700 p-2 rounded-md">
                  <div className="flex items-start gap-2 ">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/profiles/${c.userId}`} 
                        className="font-semibold text-sm text-gray-900 dark:text-white hover:underline"
                      >
                        {c.commentAuthor}
                      </Link>
                      <p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
                        {c.commentText}
                      </p>
                    </div>
                    {currentUserId === c.userId && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button 
                          title="Edit Comment" 
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                          onClick={() => { setEditingCommentId(c._id); setText(c.commentText); }}
                        >
                          <FaPencilAlt className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                          title="Delete Comment" 
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                          onClick={() => handleDeleteClick(c._id)}
                        >
                          <FaTrash className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <CommentLike comment={c} currentUserId={currentUserId} />
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(parseInt(c.createdAt)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm py-2">
            No comments yet
          </p>
        )}
      </div>

      {/* AWS-style Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[400] p-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden relative z-[410]">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Delete Comment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this comment? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Warning Box */}
              <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                    This comment will be permanently removed from the post.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteCancel();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteConfirm();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
                >
                  Delete Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useSubscription } from "@apollo/client";
import { FaPencilAlt, FaTrash, FaComment, FaTimes, FaHeart } from "react-icons/fa";
import {
  REMOVE_POST,
  UPDATE_POST,
  ADD_COMMENT,
  LIKE_POST,
} from "../../utils/mutations";
import {
  POST_LIKED_SUBSCRIPTION,
  COMMENT_ADDED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
  POST_UPDATED_SUBSCRIPTION,
  POST_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import Auth from "../../utils/auth";
import CommentList from "../CommentList";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function Post({ post }) {
  const { currentOrganization } = useOrganization();
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [postText, setPostText] = useState(post.postText);
  const [isEdited, setIsEdited] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [likes, setLikes] = useState(post.likes);
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [comments, setComments] = useState(post.comments || []);
  const [deleted, setDeleted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUserId = Auth.getProfile().data._id;

  // GraphQL Mutations
  const [removePost] = useMutation(REMOVE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const [addComment] = useMutation(ADD_COMMENT);
  const [likePost] = useMutation(LIKE_POST);

  // Subscriptions

// 1️⃣ Likes
useSubscription(POST_LIKED_SUBSCRIPTION, {
  variables: { postId: post._id },
  onData: ({ data }) => {
    const liked = data?.data?.postLiked;
    if (liked) {
      setLikes(liked.likes);
      setLikedBy(liked.likedBy);
    }
  },
});


// 2️⃣ New comments
useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
  variables: { postId: post._id },
  onData: ({ data }) => {
    const newComment = data?.data?.commentAdded;
    if (!newComment) return;
    setComments(prev =>
      prev.some(c => c._id === newComment._id) ? prev : [...prev, newComment]
    );
  },
});

// 3️⃣ Comment updates
useSubscription(COMMENT_UPDATED_SUBSCRIPTION, {
  onData: ({ data }) => {
    const updated = data?.data?.commentUpdated;
    if (!updated) return;
    setComments(prev =>
      prev.map(c => (c._id === updated._id ? updated : c))
    );
  },
});

// 4️⃣ Comment deletions
useSubscription(COMMENT_DELETED_SUBSCRIPTION, {
  onData: ({ data }) => {
    const deletedId = data?.data?.commentDeleted;
    if (!deletedId) return;
    setComments(prev => prev.filter(c => c._id !== deletedId));
  },
});


// 5️⃣ Post updates
useSubscription(POST_UPDATED_SUBSCRIPTION, {
  onData: ({ data }) => {
    const updated = data?.data?.postUpdated;
    if (updated && updated._id === post._id) {
      setPostText(updated.postText);
      setIsEdited(true);
      setLikes(updated.likes);
      setLikedBy(updated.likedBy);
      setComments(updated.comments);
    }
  },
});


// 6️⃣ Post deletions
useSubscription(POST_DELETED_SUBSCRIPTION, {
  onData: ({ data }) => {
    if (data?.postDeleted === post._id) {
      setDeleted(true);
    }
  },
});


  // Handlers

  const handleDeletePost = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await removePost({ 
        variables: { 
          postId: post._id,
          organizationId: currentOrganization._id
        } 
      });
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleUpdatePost = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      const { data } = await updatePost({
        variables: { 
          postId: post._id, 
          postText,
          organizationId: currentOrganization._id
        },
      });
      setIsEditing(false);
      setIsEdited(true);
      setPostText(data.updatePost.postText);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleLike = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await likePost({ 
        variables: { 
          postId: post._id,
          organizationId: currentOrganization._id
        } 
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setErrorMessage("Please write a comment.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      const { data } = await addComment({
        variables: { 
          postId: post._id, 
          commentText,
          organizationId: currentOrganization._id
        },
      });
      // use the server's returned comments (which now include userId)
      setComments(data.addComment.comments);
      // make sure the list is visible immediately
      setShowComments(true);
      setCommentText("");
    } catch (e) {
      console.error('Error adding comment:', e);
      setErrorMessage("Failed to add comment. Please try again.");
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };
// Cancel comment input
  const handleCancelComment = () => {
    setCommentText("");
    setErrorMessage("");
  };

  if (deleted) return null;

  return (
    <>
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
                    Delete Post
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this post? This action cannot be undone.
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
                    All comments and likes will be permanently removed.
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
                    setShowDeleteModal(false);
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
                    handleDeletePost();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="relative rounded-md border mb-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to={`/profiles/${post.userId._id}`} className="flex items-center gap-2 hover:no-underline flex-1">
            <img 
              src={post.userId.profilePic || ProfileAvatar} 
              alt="profile picture" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {post.userId.name[0].toUpperCase() + post.userId.name.slice(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(parseInt(post.createdAt)).toLocaleString()}
              </span>
            </div>
          </Link>
          {/* Owner controls: edit/delete icons */}
          {currentUserId === post.userId._id && !isEditing && (
            <div className="flex items-center gap-1">
              <button 
                title="Edit Post" 
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                onClick={() => setIsEditing(true)}
              >
                <FaPencilAlt className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                title="Delete Post" 
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}
        </div>
        {/* Post Content (edit/view) */}
        <div className="px-4 pb-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea 
                value={postText} 
                onChange={(e) => setPostText(e.target.value)} 
                className="w-full p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600
                  bg-gray-50 border-gray-300 text-gray-900
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                rows={3}
              />
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors" 
                  onClick={handleUpdatePost}
                >
                  Update
                </button>
                <button 
                  className="px-4 py-2 rounded-md border text-sm font-medium transition-colors
                    bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
              {isEdited && (
                <div className="text-green-600 dark:text-green-400 text-xs">
                  Post updated successfully!
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
              {postText}
            </p>
          )}
        </div>
        {/* Actions: Like, Comment */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-1">
          <div className="flex items-center">
            <div className="relative flex-1">
              <button
                className="flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium transition-colors
                  text-blue-600 hover:bg-gray-100
                  dark:text-blue-200 dark:hover:bg-gray-700"
                onClick={handleLike}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FaHeart className={`h-4 w-4 ${likedBy.some(u => u._id === currentUserId) ? 'text-red-500' : ''}`} />
                <span>{likes > 0 ? `Like (${likes})` : 'Like'}</span>
              </button>
              {/* Tooltip for liked users */}
              {showTooltip && likedBy.length > 0 && (
                <div className="absolute left-0 bottom-full mb-2 w-max max-w-xs bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md p-2 shadow-lg z-10">
                  <div className="max-h-32 overflow-y-auto">
                    {likedBy.map((u) => (
                      <div key={u._id} className="py-0.5">{u.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              className="flex items-center justify-center gap-2 flex-1 py-2 rounded-md text-sm font-medium transition-colors
                text-blue-600 hover:bg-gray-100
                dark:text-blue-200 dark:hover:bg-gray-700" 
              onClick={() => setShowComments((v) => !v)}
            >
              <FaComment className="h-4 w-4" />
              <span>{comments.length > 0 ? `Comment (${comments.length})` : 'Comment'}</span>
            </button>
          </div>
        </div>
        {/* Comments section */}
        {showComments && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-3 pb-3">
            {comments.length > 0 && (
              <div className="mb-3  ">
                <CommentList postId={post._id} comments={comments} currentUserId={currentUserId} />
              </div>
            )}
            <div className="space-y-2 ">
              <textarea 
                className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600
                  bg-gray-50 border-gray-300 text-gray-900
                  dark:bg-gray-600 dark:border-gray-600 dark:text-white" 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                placeholder="Write a comment..." 
                rows={2}
              />
              <div className="flex gap-2">
                <button 
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors" 
                  onClick={handleAddComment}
                >
                  Comment
                </button>
                <button 
                  className="px-4 py-1.5 rounded-md border text-sm font-medium transition-colors
                    bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600" 
                  onClick={() => { handleCancelComment(); setShowComments(false); }}
                >
                  Cancel
                </button>
              </div>
              {errorMessage && (
                <div className="text-red-600 dark:text-red-400 text-xs">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

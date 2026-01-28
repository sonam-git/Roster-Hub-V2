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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Blurred background overlay */}
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-200" />
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="rounded-xl shadow-lg p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center border-2 transition-all duration-200
              bg-gray-100 text-gray-900 border-red-200
              dark:bg-gray-900 dark:text-white dark:border-red-700">
              <h2 className="text-lg font-bold mb-4 text-center
                text-gray-900 dark:text-red-200">
                Are you sure you want to delete this post?
              </h2>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  onClick={handleDeletePost}
                >
                  Yes, Delete
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="relative rounded-2xl shadow-xl border-2 bg-gradient-to-br p-4 px-2 sm:px-4 xl:px-8 mb-6 transition-all duration-300 hover:border-blue-400 flex flex-col gap-2 w-full from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 border-blue-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to={`/profiles/${post.userId._id}`} className="flex items-center hover:no-underline">
            <img src={post.userId.profilePic || ProfileAvatar} alt="profile picture" className="w-10 h-10 rounded-full border-2 border-blue-300 dark:border-gray-700 shadow" />
            <span className="font-bold text-blue-700 dark:text-blue-200 text-sm sm:text-base ml-2">{post.userId.name[0].toUpperCase() + post.userId.name.slice(1)}</span>
          </Link>
          {/* Owner controls: edit/delete icons always visible for post owner */}
          {currentUserId === post.userId._id && (
            <div className="flex items-center gap-2 ml-auto">
              {!isEditing && (
                <>
                  <button title="Edit Post" className="flex items-center px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => setIsEditing(true)}>
                    <FaPencilAlt className="h-5 w-5 text-blue-500 cursor-pointer" />
                  </button>
                  <button title="Delete Post" className="flex items-center px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={() => setShowDeleteModal(true)}>
                    <FaTrash className="h-5 w-5 text-red-500 cursor-pointer" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* Post Content (edit/view) */}
        <div className="mb-2 relative">
          {isEditing ? (
            <div className="mt-2">
              <textarea value={postText} onChange={(e) => setPostText(e.target.value)} className="w-full p-2 border rounded dark:text-black text-xs sm:text-sm mb-2" />
              <div className="flex gap-2">
                <button className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-700 text-xs sm:text-sm" onClick={handleUpdatePost}>Update Post</button>
                <button className="px-4 py-1 rounded bg-gray-500 text-white hover:bg-gray-700 text-xs sm:text-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
              {isEdited && <div className="text-green-500 text-xs mt-2">Post updated successfully!</div>}
            </div>
          ) : (
            <>
              <p className="text-gray-800 dark:bg-gray-800 dark:text-gray-100 text-base sm:text-lg font-serif font-medium leading-relaxed mt-2 bg-gray-100 rounded-lg px-4 py-3 shadow-sm transition-colors duration-300">
                {postText}
              </p>
            </>
          )}
        </div>
        {/* Actions: Like, Comment, Date/Time - always visible, fixed position */}
        <div className="flex items-center gap-4 mt-2 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <button
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold shadow transition bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 text-xs sm:text-sm`}
                onClick={handleLike}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FaHeart className="h-4 w-4" /> {likes}
              </button>
              {/* Tooltip for liked users */}
              {showTooltip && likedBy.length > 0 && (
                <div className="absolute left-full top-0 ml-2 w-max bg-white dark:bg-gray-700 text-black dark:text-white text-xs rounded p-2 shadow z-10">
                  {likedBy.map((u) => (
                    <div key={u._id}>{u.name}</div>
                  ))}
                </div>
              )}
            </div>
            <button className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold shadow transition bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700 text-xs sm:text-sm`} onClick={() => setShowComments((v) => !v)}>
              <FaComment className="h-4 w-4" /> {comments.length}
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(parseInt(post.createdAt)).toLocaleString()}</span>
        </div>
        {/* Comments section - always below actions */}
        {showComments && (
          <div className="mt-4">
            <CommentList postId={post._id} comments={comments} currentUserId={currentUserId} />
            <div className="mt-4">
              <textarea className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:text-white text-xs sm:text-sm mb-2" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." />
              <div className="flex gap-2">
                <button className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-700 text-xs sm:text-sm" onClick={handleAddComment}>Add Comment</button>
                <button className="px-4 py-1 rounded bg-gray-500 text-white hover:bg-gray-700 text-xs sm:text-sm" onClick={() => { handleCancelComment(); setShowComments(false); }}>Cancel</button>
              </div>
              {errorMessage && <div className="text-red-500 text-xs mt-2 animate-fade-in">{errorMessage}</div>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import {
  PencilAltIcon,
  TrashIcon,
  ChatAltIcon,
  XIcon,
  HeartIcon,
} from "@heroicons/react/solid";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useSubscription } from "@apollo/client";
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

export default function Post({ post }) {
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [postText, setPostText] = useState(post.postText);
  const [isEdited, setIsEdited] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [likes, setLikes] = useState(post.likes);
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [comments, setComments] = useState(post.comments || []);
  const [deleted, setDeleted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
    await removePost({ variables: { postId: post._id } });
  };

  const handleUpdatePost = async () => {
    const { data } = await updatePost({
      variables: { postId: post._id, postText },
    });
    setIsEditing(false);
    setIsEdited(true);
    setPostText(data.updatePost.postText);
  };

  const handleLike = async () => {
    await likePost({ variables: { postId: post._id } });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setErrorMessage("Please write a comment.");
      return setTimeout(() => setErrorMessage(""), 2000);
    }
    try {
      const { data } = await addComment({
        variables: { postId: post._id, commentText },
      });
      // use the server's returned comments (which now include userId)
      setComments(data.addComment.comments);
      // make sure the list is visible immediately
      setShowComments(true);
      setIsCommenting(false);
      setCommentText("");
    } catch (e) {
      console.error(e);
    }
  };
// Cancel comment input
  const handleCancelComment = () => {
    setIsCommenting(false);
    setCommentText("");
    setErrorMessage("");
  };


  if (deleted) return null;

  const isLikedByCurrentUser = likedBy.some((u) => u._id === currentUserId);

  return (
    <div className="relative bg-gray-100 dark:bg-gray-600 shadow-md rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link to={`/profiles/${post.userId._id}`} className="flex items-center hover:no-underline">
          <img
            src={post.userId.profilePic || ProfileAvatar}
            alt=""
            className="w-8 h-8 rounded-full mr-2"
          />
          <h3 className="text-lg font-bold dark:hover:text-yellow-300 dark:text-white">{post.userId.name}</h3>
        </Link>
        {currentUserId === post.userId._id && (
          <div className="flex space-x-2">
            <PencilAltIcon
              className="h-5 w-5 text-blue-500 cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
            <TrashIcon
              className="h-5 w-5 text-red-500 cursor-pointer"
              onClick={handleDeletePost}
            />
          </div>
        )}
      </div>

      {/* Edit vs View */}
      {isEditing ? (
        <>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 mt-2 border rounded dark:text-black"
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleUpdatePost}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-800 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 mb-2 p-2 bg-gray-200 dark:bg-gray-600 font-light text-sm sm:text-xs rounded-md dark:text-white">{postText}</p>
          {isEdited && (
            <small className="text-gray-500">
              Edited: {new Date().toLocaleString()}
            </small>
          )}
        </>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 ">
        <small className="text-gray-300">
          {new Date(parseInt(post.createdAt)).toLocaleString()}
        </small>
        <div className="flex items-center space-x-4">
          {/* Like */}
          <div className="relative">
            <HeartIcon
              className={`h-5 w-5 cursor-pointer  ${
                isLikedByCurrentUser ? "text-green-500" : "text-gray-400"
              }`}
              onClick={handleLike}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute top-0 left-full ml-2 w-max bg-white dark:bg-gray-700 text-black dark:text-white text-sm rounded p-2 shadow z-10">
                {likedBy.map((u) => (
                  <div key={u._id}>{u.name}</div>
                ))}
              </div>
            )}
          </div>
          <span className="dark:text-white">{likes}</span>

          {/* Comment toggle */}
          {showComments ? (
            <XIcon
              className="h-5 w-5 text-blue-500 cursor-pointer"
              onClick={() => setShowComments(false)}
            />
          ) : (
            <ChatAltIcon
              className="h-5 w-5 text-blue-500 cursor-pointer"
              onClick={() => {
                setIsCommenting(true);
                setShowComments(true);
              }}
            />
          )}
          <span className="dark:text-white">{comments.length}</span>
        </div>
      </div>

      {/* New Comment */}
      {isCommenting && (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            Post Comment
          </button>
          <button
              onClick={handleCancelComment}
              className="bg-gray-500 text-white px-3 py-1 rounded ml-2 hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
        </div>
      )}

      {/* Comment List */}
      {showComments && (
        <div className="mt-4">
          <CommentList
            postId={post._id}
            comments={comments}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
  PencilAltIcon,
  TrashIcon,
  ChatAltIcon,
  XIcon,
  HeartIcon,
} from "@heroicons/react/solid";
import {
  REMOVE_POST,
  UPDATE_POST,
  ADD_COMMENT,
  LIKE_POST,
} from "../../utils/mutations";
import { GET_POSTS } from "../../utils/queries";
import Auth from "../../utils/auth";
import CommentList from "../CommentList";
import ProfileAvatar from "../../assets/images/profile-avatar.png"; //

const Post = ({ post }) => {
  const { refetch } = useQuery(GET_POSTS);
  const [isEditing, setIsEditing] = useState(false);
  const [postText, setPostText] = useState(post.postText);
  const [isEdited, setIsEdited] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [showTooltip, setShowTooltip] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [removePost] = useMutation(REMOVE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [updatePost] = useMutation(UPDATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
  });

  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_POSTS }],
    onCompleted: () => {
      setShowComments(true);
    },
  });

  const [likePost] = useMutation(LIKE_POST, {
    onCompleted: async (data) => {
      setLikes(data.likePost.likes);
      setLikedBy(data.likePost.likedBy);
      await refetch(); // Refetch the posts to get the updated likedBy data
    },
    onError: (err) => {
      console.error("Error liking post:", err);
    },
  });

  const handleDelete = async () => {
    try {
      await removePost({ variables: { postId: post._id } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const { data } = await updatePost({
        variables: { postId: post._id, postText },
      });
      setIsEditing(false);
      setIsEdited(true);
      setPostText(data.updatePost.postText);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText) {
      setErrorMessage("Please write a comment.");
      setTimeout(() => {
        setErrorMessage("");
      }, 2000);
      return;
    }
    try {
      await addComment({ variables: { postId: post._id, commentText } });
      setIsCommenting(false);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = () => {
    setIsCommenting(true);
    setShowComments(true);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    try {
      await likePost({ variables: { postId: post._id } });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const sortedComments = [...post.comments].reverse();

  const isLikedByCurrentUser = likedBy.some(
    (user) => user._id === Auth.getProfile().data._id
  );

  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <Link
          className="flex items-center hover:no-underline hover:text-dark dark:hover:text-white"
          to={`/profiles/${post.userId}`}
        >
          <img
            src={post?.userId?.profilePic || ProfileAvatar}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
          <h3 className="text-sm md:text-md lg:text-lg xl:text-xl">
            {post?.postAuthor}
          </h3>
        </Link>
        {Auth.loggedIn() && Auth.getProfile().data._id === post.userId && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <PencilAltIcon
              className="h-5 w-5 text-blue-500 cursor-pointer"
              title="Update"
              onClick={() => setIsEditing(true)}
            />
            <TrashIcon
              className="h-5 w-5 text-red-500 cursor-pointer"
              title="Delete"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
      {isEditing ? (
        <div>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 mt-2 border rounded dark:text-black"
          />
          <button
            onClick={handleUpdate}
            className="px-3 py-1 bg-blue-500 text-white rounded mt-2"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded mt-2 ml-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-700 dark:text-white text-sm md:text-sm lg:text-md xl:text-lg mt-2">
            {post?.postText}
          </p>
          {isEdited && (
            <small className="text-gray-500">
              Edited: {new Date().toLocaleString()}
            </small>
          )}
        </>
      )}
      <div className="flex justify-between items-center mt-2">
        {post.createdAt && (
          <small className="text-gray-500">
            {isEdited ? "Originally posted: " : ""}
            {new Date(parseInt(post.createdAt)).toLocaleString()}
          </small>
        )}

        <div className="flex space-x-2 items-center">
          <div className="relative flex items-center">
            <HeartIcon
              className={`h-5 w-5 cursor-pointer ${
                isLikedByCurrentUser ? "text-green-500" : "text-red-500"
              }`}
              title={isLikedByCurrentUser ? "Dislike" : "Like"}
              onClick={handleLike}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && likedBy.length > 0 && (
              <div className="absolute top-0 left-full ml-2 w-max bg-green-200 text-black text-sm rounded p-2 z-10">
                {likedBy.map((user) => (
                  <li key={user._id}>{user.name}</li>
                ))}
              </div>
            )}
          </div>
          <span className="text-gray-700 dark:text-white">{likes}</span>

          <ChatAltIcon
            className="h-5 w-5 text-green-500 cursor-pointer"
            title="Comment"
            onClick={handleComment}
          />

          {!showComments ? (
            <>
              <ChatAltIcon
                className="h-5 w-5 text-blue-500 cursor-pointer"
                title="Show Comments"
                onClick={toggleComments}
              />
              <span className="text-gray-700 dark:text-white">
                {sortedComments.length}
              </span>
            </>
          ) : (
            <XIcon
              className="h-5 w-5 text-blue-500 cursor-pointer"
              title="Close Comments"
              onClick={toggleComments}
            />
          )}
        </div>
      </div>
      {errorMessage && <div className="text-red-500 p-2">{errorMessage}</div>}
      {isCommenting && (
        <div>
          <textarea
            className="w-full p-2 mt-2 border rounded dark:text-black"
            placeholder="Add your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={() => setIsCommenting(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded mt-2"
          >
            Cancel
          </button>
          <button
            onClick={handleAddComment}
            className="px-3 py-1 bg-blue-500 text-white rounded mt-2 ml-2"
          >
            Add Comment
          </button>
        </div>
      )}
      {showComments && (
        <div className="mt-4">
          <CommentList comments={sortedComments} post={post} />
        </div>
      )}
    </div>
  );
};

export default Post;

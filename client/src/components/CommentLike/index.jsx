import React, { useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { ThumbUpIcon as OutlineThumbUpIcon } from "@heroicons/react/outline";
import { ThumbUpIcon as SolidThumbUpIcon } from "@heroicons/react/solid";

import { LIKE_COMMENT } from "../../utils/mutations";
import { COMMENT_LIKED_SUBSCRIPTION } from "../../utils/subscription";

export default function CommentLike({ comment, currentUserId }) {
  const [likes, setLikes]         = useState(comment.likes);
  const [likedBy, setLikedBy]     = useState(comment.likedBy || []);
  const [showTooltip, setShowTooltip] = useState(false);
  const isLiked = likedBy.some((u) => u._id === currentUserId);

  // 1️⃣ Subscribe to real-time like changes
  useSubscription(COMMENT_LIKED_SUBSCRIPTION, {
    variables: { commentId: comment._id },
    onData: ({ data }) => {
      const updated = data.data?.commentLiked;
      if (updated) {
        setLikes(updated.likes);
        setLikedBy(updated.likedBy);
      }
    },
  });
  

  // 2️⃣ Fire the mutation
  const [likeComment] = useMutation(LIKE_COMMENT, {
    variables: { commentId: comment._id },
  });

  const handleLike = () => {
    likeComment();
    // let subscription update the counts
  };

  return (
    <div className="relative flex items-center space-x-1 ml-4">
      <button
        onClick={handleLike}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="focus:outline-none"
        title={isLiked ? "Unlike" : "Like"}
      >
        {isLiked 
          ? <SolidThumbUpIcon className="h-5 w-5 text-blue-500" />
          : <OutlineThumbUpIcon className="h-5 w-5 text-gray-400" />
        }
      </button>

      {showTooltip && likedBy.length > 0 && (
        <div className="absolute top-0 left-full ml-2 w-max bg-white dark:bg-gray-700 text-black dark:text-white text-sm rounded p-2 shadow z-10">
          <ul className="list-none m-0 p-0">
            {likedBy.map((u) => (
              <li  key={u._id}>{u.name}</li>
            ))}
          </ul>
        </div>
      )}

      <span className="text-sm dark:text-white">{likes}</span>
    </div>
  );
}

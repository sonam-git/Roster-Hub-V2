import React, { useEffect, useMemo, useState, startTransition } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { LIKE_FORMATION } from "../../utils/mutations";
import { FORMATION_LIKED_SUBSCRIPTION } from "../../utils/subscription";
import Auth from "../../utils/auth";

export default function FormationLikeButton({
  formationId,
  likes: propLikes = 0,
  likedBy: propLikedBy = [],
  onUpdate,
}) {
  /* ---------- constants ---------- */
  const user = Auth.loggedIn() ? Auth.getProfile().data : null;
  const userId = user?._id ?? null;

  /* ---------- local reactive state ---------- */
  const [state, setState] = useState({
    likes: propLikes,
    likedBy: Array.isArray(propLikedBy) ? propLikedBy : [],
  });

  /* keep state in-sync if parent sends new props */
  useEffect(() => {
    setState((prev) => {
      const changed =
        prev.likes !== propLikes ||
        prev.likedBy.length !== propLikedBy.length ||
        prev.likedBy.some((u, i) => u._id !== propLikedBy[i]?._id);

      return changed ? { likes: propLikes, likedBy: propLikedBy } : prev;
    });
  }, [propLikes, propLikedBy]);

  const hasLiked = useMemo(
    () => !!userId && state.likedBy.some((u) => u._id === userId),
    [state.likedBy, userId]
  );

  /* ---------- GraphQL ---------- */
  const [runToggle] = useMutation(LIKE_FORMATION, {
    onCompleted: ({ likeFormation }) => {
      if (!likeFormation) return;
      setState({ likes: likeFormation.likes, likedBy: likeFormation.likedBy });
      onUpdate?.(likeFormation);
    },
  });

  useSubscription(FORMATION_LIKED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const updated = data.data?.formationLiked;
      if (!updated) return;
      startTransition(() =>
        setState({ likes: updated.likes, likedBy: updated.likedBy ?? [] })
      );
      onUpdate?.(updated);
    },
  });

  /* ---------- handlers ---------- */
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert("Please log in to like this formation.");
      return;
    }

    /* optimistic UI */
    const optimistic = {
      __typename: "Formation",
      _id: formationId,
      likes: hasLiked ? state.likes - 1 : state.likes + 1,
      likedBy: hasLiked
        ? state.likedBy.filter((u) => u._id !== userId)
        : [
            ...state.likedBy,
            { __typename: "Profile", _id: userId, name: user.name },
          ],
    };

    runToggle({
      variables: { formationId },
      optimisticResponse: { likeFormation: optimistic },
    });
  };
  
  // build a hover‐tooltip string
  const hoverText = (state.likedBy || []).map((u) => u.name).join(", ");

  /* ---------- render ---------- */
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💕</span>
            <h4 className="font-bold text-lg text-gray-800 dark:text-white">Formation Feedback</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {state.likes} player{state.likes !== 1 ? "s" : ""} {state.likes === 1 ? "likes" : "like"} this formation
            {state.likes > 0 && (
              <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                • Great tactical choice! 🎯
              </span>
            )}
          </p>
          {hoverText && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Liked by: {hoverText}
            </p>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleToggle}
          disabled={!userId}
          className={`group relative overflow-hidden font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 min-w-[140px] justify-center ${
            hasLiked
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
          } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={!userId ? "Please log in to like this formation" : (hasLiked ? "Unlike this formation" : "Like this formation")}
        >
          <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            hasLiked 
              ? 'from-red-400 to-pink-400' 
              : 'from-purple-400 to-pink-400'
          }`}></div>
          
          <span className={`relative z-10 text-xl transition-transform duration-200 ${hasLiked ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}>
            {hasLiked ? '❤️' : '🤍'}
          </span>
          <div className="relative z-10 text-center">
            <div className="font-bold text-lg leading-none">{state.likes}</div>
            <div className="text-xs opacity-90 leading-none mt-0.5">
              {state.likes === 1 ? 'like' : 'likes'}
            </div>
          </div>
          
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
        </button>
      </div>
    </div>
  );
}

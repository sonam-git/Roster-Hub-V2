import React, { useEffect, useMemo, useState, startTransition } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { LIKE_FORMATION }                    from '../../utils/mutations';
import { FORMATION_LIKED_SUBSCRIPTION }      from '../../utils/subscription';
import Auth                                   from '../../utils/auth';

export default function FormationLikeButton({
  formationId,
  likes:   propLikes    = 0,
  likedBy: propLikedBy  = [],
  onUpdate,
}) {
  /* ---------- constants ---------- */
  const user   = Auth.loggedIn() ? Auth.getProfile().data : null;
  const userId = user?._id ?? null;

  /* ---------- local reactive state ---------- */
  const [state, setState] = useState({
    likes:   propLikes,
    likedBy: Array.isArray(propLikedBy) ? propLikedBy : [],
  });

  /* keep state in-sync if parent sends new props */
  useEffect(() => {
    setState(prev => {
      const changed =
        prev.likes !== propLikes ||
        prev.likedBy.length !== propLikedBy.length ||
        prev.likedBy.some((u, i) => u._id !== propLikedBy[i]?._id);

      return changed ? { likes: propLikes, likedBy: propLikedBy } : prev;
    });
  }, [propLikes, propLikedBy]);

  const hasLiked = useMemo(
    () => !!userId && state.likedBy.some(u => u._id === userId),
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
  const handleToggle = e => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert('Please log in to like this formation.');
      return;
    }

    /* optimistic UI */
    const optimistic = {
      __typename: 'Formation',
      _id:   formationId,
      likes: hasLiked ? state.likes - 1 : state.likes + 1,
      likedBy: hasLiked
        ? state.likedBy.filter(u => u._id !== userId)
        : [...state.likedBy, { __typename: 'Profile', _id: userId, name: user.name }],
    };

    runToggle({
      variables: { formationId },
      optimisticResponse: { likeFormation: optimistic },
    });
  };
// build a hover‐tooltip string
const hoverText = (state.likedBy || [])
.map((u) => u.name)
.join(", ");

  /* ---------- render ---------- */
  return (
    <button
    type="button"
    onClick={handleToggle}
    // ← add title here
    title={hoverText || "No likes yet"}
    className={`px-3 py-1 rounded transition
      ${hasLiked ? "bg-red-600 text-white" : "bg-gray-200 text-black"}
      hover:scale-105`}
  >
    ❤️ {state.likes} {state.likes === 1 ? "Like" : "Likes"}
  </button>
  );
}

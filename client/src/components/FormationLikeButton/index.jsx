import React, { useEffect, useMemo, startTransition, useState } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { LIKE_FORMATION } from '../../utils/mutations';
import { FORMATION_LIKED_SUBSCRIPTION } from '../../utils/subscription';
import Auth from '../../utils/auth';

export default function FormationLikeButton({
  formationId,
  likes:  propLikes   = 0,
  likedBy: propLikedBy = [],
  onUpdate,
}) {
  const user = Auth.loggedIn() ? Auth.getProfile().data : null;
  const userId = user?._id ?? null;

  // Hooks must go here — even if formationId is missing
  const [state, setState] = useState({
    likes:   propLikes,
    likedBy: Array.isArray(propLikedBy) ? propLikedBy : [],
  });

  useEffect(() => {
    setState((prev) => {
      const propsChanged =
        prev.likes   !== propLikes ||
        prev.likedBy.length !== propLikedBy.length ||
        prev.likedBy.some((u, i) => u._id !== propLikedBy[i]?._id);

      return propsChanged
        ? { likes: propLikes, likedBy: propLikedBy ?? [] }
        : prev;
    });
  }, [propLikes, propLikedBy]);

  const hasLiked = useMemo(
    () => !!userId && state.likedBy.some((u) => u._id === userId),
    [state.likedBy, userId]
  );

  const [runToggle] = useMutation(LIKE_FORMATION, {
    update(_, { data }) {
      if (!data?.likeFormation) return;
      setState({
        likes:   data.likeFormation.likes,
        likedBy: data.likeFormation.likedBy,
      });
      onUpdate?.(data.likeFormation);
    },
  });

  useSubscription(FORMATION_LIKED_SUBSCRIPTION, {
    variables: { formationId },
    onData: ({ data }) => {
      const updated = data.data?.formationLiked;
      if (!updated) return;
      startTransition(() =>
        setState({ likes: updated.likes, likedBy: updated.likedBy ?? [] })
      );
      onUpdate?.(updated);
    },
  });

  const handleToggle = () => {
    if (!userId) return alert('Please log in to like this formation.');

    const optimistic = {
      __typename: 'Formation',
      _id:   formationId,
      likes: hasLiked ? state.likes - 1 : state.likes + 1,
      likedBy: hasLiked
        ? state.likedBy.filter((u) => u._id !== userId)
        : [...state.likedBy, { __typename: 'Profile', _id: userId, name: user.name }],
    };

    runToggle({
      variables: { formationId },
      optimisticResponse: { likeFormation: optimistic },
    });
  };

  // ✅ Early return now comes AFTER all hooks
  if (!formationId) return null;

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 rounded transition
        ${hasLiked ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}
        hover:scale-105`}
    >
      ❤️ {state.likes} {state.likes === 1 ? 'Like' : 'Likes'}
    </button>
  );
}

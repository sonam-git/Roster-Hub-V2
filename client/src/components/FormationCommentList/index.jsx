// src/components/FormationCommentList.jsx
import React, { useEffect, useState, startTransition, Suspense } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  FORMATION_COMMENT_ADDED_SUBSCRIPTION,
  FORMATION_COMMENT_UPDATED_SUBSCRIPTION,
  FORMATION_COMMENT_DELETED_SUBSCRIPTION,
  FORMATION_COMMENT_LIKED_SUBSCRIPTION,
} from '../../utils/subscription';
import { GET_FORMATION_COMMENTS } from '../../utils/queries';
import FormationCommentInput from '../FormationCommentInput';
import FormationCommentItem from '../FormationCommentItem';

function CommentsPane({ gameId }) {
  // 1️⃣ Initial fetch
  const { data } = useQuery(GET_FORMATION_COMMENTS, {
    variables: { gameId },
    fetchPolicy: 'cache-and-network',
    suspense: true,
  });

  // 2️⃣ Safely pull out formation & comments
  const formation = data?.formation || { _id: '', comments: [] };
  const formationId = formation?._id;
  const initial = Array.isArray(formation?.comments) ? formation.comments : [];
  const [comments, setComments] = useState(initial);

  // 3️⃣ Sync whenever the query updates
  useEffect(() => {
    if (Array.isArray(formation?.comments)) {
      setComments(formation.comments);
    }
  }, [formation?.comments]);

  // 4️⃣ Live subscriptions
  useSubscription(FORMATION_COMMENT_ADDED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const newC = data.data?.formationCommentAdded;
      if (newC) {
        startTransition(() => setComments(prev => [...prev, newC]));
      }
    },
  });

  useSubscription(FORMATION_COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const upd = data.data?.formationCommentUpdated;
      if (upd) {
        startTransition(() =>
          setComments(prev =>
            prev.map(c => (c._id === upd._id ? { ...c, ...upd } : c))
          )
        );
      }
    },
  });

  useSubscription(FORMATION_COMMENT_DELETED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData({ data }) {
      const delId = data.data.formationCommentDeleted;
      setComments(prev => prev.filter(c => c._id !== delId));
    }
  });

  useSubscription(FORMATION_COMMENT_LIKED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const liked = data.data?.formationCommentLiked;
      if (liked) {
        startTransition(() =>
          setComments(prev =>
            prev.map(c => (c._id === liked._id ? { ...c, ...liked } : c))
          )
        );
      }
    },
  });

  // 5️⃣ Sort ascending: oldest first
  const sorted = [...comments].sort(
    (a, b) => parseInt(a.createdAt, 10) - parseInt(b.createdAt, 10)
  );

  return (
    <div className="flex flex-col">
      {/* input at top */}
      {formationId && <FormationCommentInput formationId={formationId} />}

      {/* no comments fallback */}
      {sorted.length === 0 ? (
        <p className="mt-2 italic text-center">No comments yet for this Formation.</p>
      ) : (
        // scrollable pane with sticky header
        <div className="mt-4 max-h-64 overflow-y-auto">
          {/* sticky header */}
          <div className="sticky top-0 italic text-center bg-yellow-200 dark:bg-gray-600 px-4 py-2 font-semibold z-10 border-b">
            There are {sorted.length} Comment{sorted.length !== 1 ? "s" : ""} for this formation.
          </div>
          {/* comment list */}
          <div className="space-y-2 px-4 py-2 bg-yellow-100 dark:bg-gray-700">
            {sorted.map((c) => (
              <FormationCommentItem
                key={c._id}
                comment={c}
                formationId={formationId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormationCommentList({ gameId }) {
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <CommentsPane gameId={gameId} />
    </Suspense>
  );
}

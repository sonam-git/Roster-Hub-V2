import React, { useEffect, useState, startTransition, Suspense } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  FORMATION_COMMENT_ADDED_SUBSCRIPTION,
  FORMATION_COMMENT_UPDATED_SUBSCRIPTION,
  FORMATION_COMMENT_DELETED_SUBSCRIPTION,
  FORMATION_COMMENT_UPDATED_SUB,
  FORMATION_COMMENT_LIKED_SUB,
} from '../../utils/subscription';
import { GET_FORMATION_COMMENTS } from '../../utils/queries';
import FormationCommentInput from '../FormationCommentInput';
import FormationCommentItem  from '../FormationCommentItem';

/* ────────────────────────────────────────────────────────────────────────── */
function CommentsPane({ gameId }) {
  /* 1️⃣ Initial fetch (Suspense) */
  const { data } = useQuery(GET_FORMATION_COMMENTS, {
    variables: { gameId },
    fetchPolicy: 'cache-and-network',
    suspense: true,
  });

  /* Safeguard: if for any reason the query resolved with nulls */
  const formation = data?.formation ?? { _id: '', comments: [] };
  const formationId = formation._id;

  /* 2️⃣ Local state */
  const [comments, setComments] = useState(() => formation.comments ?? []);

  /* Keep fresh if cache pushes newer list */
  useEffect(() => {
    if (formation.comments) setComments(formation.comments);
  }, [formation.comments]);

  /* 3️⃣ Live subscriptions */

  useSubscription(FORMATION_COMMENT_ADDED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const newC = data.data?.formationCommentAdded;
      if (newC)
        startTransition(() => setComments((prev) => [newC, ...prev]));
    },
  });

  useSubscription(FORMATION_COMMENT_UPDATED_SUB, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const upd = data.data?.formationCommentUpdated;
      if (upd)
        startTransition(() =>
          setComments((prev) =>
            prev.map(c =>
                       c._id === upd._id
                         ? { ...c, commentText: upd.commentText, updatedAt: upd.updatedAt }
                         : c
                     )
          )
        );
    },
  });

  useSubscription(FORMATION_COMMENT_DELETED_SUBSCRIPTION, {
    skip: !formationId,
    onData: ({ data }) => {
      const delId = data.data?.formationCommentDeleted;
      if (delId)
        startTransition(() =>
          setComments((prev) => prev.filter((c) => c._id !== delId))
        );
    },
  });

  /* ---- new like subscription ---- */
+useSubscription(FORMATION_COMMENT_LIKED_SUB, {
    variables: { formationId },
   skip: !formationId,
    onData: ({ data }) => {
      const liked = data.data?.formationCommentLiked;
      if (!liked) return;
      startTransition(() =>
        setComments(prev =>
          prev.map(c =>
            c._id === liked._id
              ? { ...c, likes: liked.likes, likedBy: liked.likedBy }
              : c
          )
        )
      );
    },
  });

  /* 4️⃣ Render */
  return (
    <>
      {/* Hide input if formation doesn't exist yet */}
      {formationId && <FormationCommentInput formationId={formationId} />}

      {comments.length === 0 ? (
        <p className="mt-2 italic">No comments yet for this Formation.</p>
      ) : (
        comments.map((c) => (
          <FormationCommentItem
            key={c._id}
            comment={c}
            formationId={formationId}
          />
        ))
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
export default function FormationCommentList({ gameId }) {
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <CommentsPane gameId={gameId} />
    </Suspense>
  );
}

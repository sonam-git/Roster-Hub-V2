import React, { useEffect, useState, startTransition, Suspense } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import {
  FORMATION_COMMENT_ADDED_SUBSCRIPTION,
  FORMATION_COMMENT_UPDATED_SUBSCRIPTION,
  FORMATION_COMMENT_DELETED_SUBSCRIPTION,
  FORMATION_COMMENT_LIKED_SUBSCRIPTION,
} from "../../utils/subscription";
import { QUERY_FORMATION } from "../../utils/queries";
import FormationCommentInput from "../FormationCommentInput";
import FormationCommentItem from "../FormationCommentItem";

function CommentsPane({ gameId }) {
  const { data } = useQuery(QUERY_FORMATION, {
    variables: { gameId },
    fetchPolicy: "cache-and-network",
    suspense: true,
  });

  const formation = data?.formation || { _id: "", comments: [] };
  const formationId = formation?._id;

  // instead, seed once when we get a new formationId:
  const [comments, setComments] = useState(formation.comments);
  useEffect(() => {
    setComments(formation.comments);
  }, [formationId]);

  // subscriptions
  useSubscription(FORMATION_COMMENT_ADDED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const newC = data.data?.formationCommentAdded;
      if (newC) startTransition(() => setComments((prev) => [...prev, newC]));
    },
  });

  useSubscription(FORMATION_COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const upd = data.data?.formationCommentUpdated;
      if (upd)
        startTransition(() =>
          setComments((prev) =>
            prev.map((c) => (c._id === upd._id ? { ...c, ...upd } : c))
          )
        );
    },
  });

  useSubscription(FORMATION_COMMENT_DELETED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const deletedId = data.data?.formationCommentDeleted;
      if (deletedId) {
        startTransition(() =>
          setComments((prev) => prev.filter((c) => c._id !== deletedId))
        );
      }
    },
  });

  useSubscription(FORMATION_COMMENT_LIKED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const liked = data.data?.formationCommentLiked;
      if (liked)
        startTransition(() =>
          setComments((prev) =>
            prev.map((c) => (c._id === liked._id ? { ...c, ...liked } : c))
          )
        );
    },
  });

  // sort oldest → newest
  const sorted = [...comments].sort(
    (a, b) => parseInt(a.createdAt, 10) - parseInt(b.createdAt, 10)
  );

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white/80 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
      {formationId && <FormationCommentInput formationId={formationId} />}

      {sorted.length === 0 ? (
        <p className="mt-4 italic text-center text-gray-500 dark:text-gray-300 text-base">
          No comments yet for this Formation.
        </p>
      ) : (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60">
          {/* sticky header */}
          <div className="sticky top-0 bg-yellow-100 dark:bg-gray-700 px-4 py-2 font-semibold text-center z-10 border-b rounded-t-lg shadow-sm">
            {sorted.length} Comment{sorted.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-3 px-4 py-3">
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

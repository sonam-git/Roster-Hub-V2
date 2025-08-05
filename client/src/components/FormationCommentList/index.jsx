import { useEffect, useState, startTransition, Suspense } from "react";
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
  }, [formationId, formation.comments]);

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
    <div className="flex flex-col w-full h-full">
      {/* Comment Input Section */}
      {formationId && (
        <div className="mb-4">
          <FormationCommentInput formationId={formationId} />
        </div>
      )}

      {/* Comments List Section */}
      <div className="flex-1 min-h-0">
        {sorted.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No Comments Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
              Be the first to share your thoughts about this formation strategy!
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
            {/* Comments Header */}
            <div className="sticky top-0 z-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💭</span>
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    Formation Discussion
                  </h4>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    {sorted.length} comment{sorted.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Comments List */}
            <div className="min-h-[500px] max-h-[800px] sm:max-h-[650px] lg:max-h-[800px] overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {sorted.map((comment, index) => (
                  <div key={comment._id} className={`transition-colors duration-200 ${
                    index % 2 === 0 
                      ? 'bg-gray-100 dark:bg-gray-600' 
                      : 'bg-gray-500 dark:bg-gray-750'
                  }`}>
                    <FormationCommentItem
                      comment={comment}
                      formationId={formationId}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Share constructive feedback to help improve team strategy
              </p>
            </div>
          </div>
        )}
      </div>
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

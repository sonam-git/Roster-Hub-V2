import { useEffect, useState, useRef, startTransition, Suspense } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import {
  FORMATION_COMMENT_ADDED_SUBSCRIPTION,
  FORMATION_COMMENT_UPDATED_SUBSCRIPTION,
  FORMATION_COMMENT_DELETED_SUBSCRIPTION,
  FORMATION_COMMENT_LIKED_SUBSCRIPTION,
  FORMATION_CREATED_SUBSCRIPTION,
} from "../../utils/subscription";
import { QUERY_FORMATION } from "../../utils/queries";
import FormationCommentInput from "../FormationCommentInput";
import FormationCommentItem from "../FormationCommentItem";
import { useOrganization } from "../../contexts/OrganizationContext";

function CommentsPane({ gameId, formationId: propFormationId }) {
  const { currentOrganization } = useOrganization();
  
  const { data, refetch } = useQuery(QUERY_FORMATION, {
    variables: { 
      gameId,
      organizationId: currentOrganization?._id 
    },
    fetchPolicy: "cache-and-network",
    suspense: true,
    skip: !gameId || !currentOrganization?._id, // Skip query if no gameId or organizationId
  });

  const formation = data?.formation || { _id: "", comments: [] };
  // Use prop formationId if provided, otherwise use queried formation ID
  const formationId = propFormationId || formation?._id;

  // Track if we should sync from query (only on initial load or formationId change)
  const isInitialMount = useRef(true);
  const lastFormationId = useRef(formationId);

  // Local state for comments - initialize with empty array to prevent undefined
  const [comments, setComments] = useState(formation.comments || []);
  
  useEffect(() => {
    // Only sync from query data if:
    // 1. Initial mount, OR
    // 2. FormationId changed (different formation loaded)
    if (isInitialMount.current || lastFormationId.current !== formationId) {
      setComments(formation.comments || []);
      isInitialMount.current = false;
      lastFormationId.current = formationId;
    }
    // Don't sync on every formation.comments change to avoid duplicates from subscription
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formationId]); // Only depend on formationId, not formation.comments

  // Listen for formation creation to immediately show comment input
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const created = data.data?.formationCreated;
      if (created) {
        // Refetch the formation query to get the new formation ID
        refetch();
      }
    },
  });

  // subscriptions
  useSubscription(FORMATION_COMMENT_ADDED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const newC = data.data?.formationCommentAdded;
      console.log('➕ ADD subscription received:', newC, 'for formationId:', formationId);
      if (newC) {
        startTransition(() => 
          setComments((prev) => {
            // Prevent duplicates: only add if comment doesn't already exist
            const exists = prev.some(c => c._id === newC._id);
            console.log('➕ Comment exists?', exists, 'Adding:', !exists);
            return exists ? prev : [...prev, newC];
          })
        );
      }
    },
    onError: (error) => {
      console.error('➕ ADD subscription error:', error);
    },
  });

  console.log('🎯 Subscribed to formationId:', formationId, 'skip:', !formationId);

  useSubscription(FORMATION_COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const upd = data.data?.formationCommentUpdated;
      console.log('🔄 UPDATE subscription received:', upd, 'for formationId:', formationId);
      if (upd) {
        startTransition(() =>
          setComments((prev) => {
            const updated = prev.map((c) => {
              if (c._id === upd._id) {
                // Merge the update with existing data to preserve all fields
                return { 
                  ...c, 
                  commentText: upd.commentText,
                  updatedAt: upd.updatedAt,
                  // Update other fields if they exist in the update
                  ...(upd.likes !== undefined && { likes: upd.likes }),
                  ...(upd.likedBy && { likedBy: upd.likedBy }),
                };
              }
              return c;
            });
            console.log('🔄 Comments after update:', updated);
            return updated;
          })
        );
      }
    },
    onError: (error) => {
      console.error('🔄 UPDATE subscription error:', error);
    },
  });

  useSubscription(FORMATION_COMMENT_DELETED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const deletedId = data.data?.formationCommentDeleted;
      console.log('🗑️ DELETE subscription received:', deletedId, 'for formationId:', formationId);
      if (deletedId) {
        startTransition(() =>
          setComments((prev) => {
            const filtered = prev.filter((c) => c._id !== deletedId);
            console.log('🗑️ Comments after delete:', filtered.length, 'remaining (deleted:', deletedId, ')');
            return filtered;
          })
        );
      }
    },
    onError: (error) => {
      console.error('🗑️ DELETE subscription error:', error);
    },
  });

  useSubscription(FORMATION_COMMENT_LIKED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const liked = data.data?.formationCommentLiked;
      console.log('❤️ LIKE subscription received:', liked, 'for formationId:', formationId);
      if (liked) {
        startTransition(() =>
          setComments((prev) => {
            const updated = prev.map((c) => {
              if (c._id === liked._id) {
                // Update only likes and likedBy, preserve other fields
                return { 
                  ...c, 
                  likes: liked.likes,
                  likedBy: liked.likedBy 
                };
              }
              return c;
            });
            console.log('❤️ Comments after like update:', updated);
            return updated;
          })
        );
      }
    },
    onError: (error) => {
      console.error('❤️ LIKE subscription error:', error);
    },
  });

  // sort oldest → newest - ensure comments is an array
  const sorted = Array.isArray(comments) ? [...comments].sort(
    (a, b) => parseInt(a.createdAt, 10) - parseInt(b.createdAt, 10)
  ) : [];

  console.log('FormationCommentList Debug:', { 
    gameId, 
    propFormationId, 
    formationId, 
    hasData: !!data,
    formation: formation?._id,
    commentsCount: comments?.length,
    sortedCount: sorted.length,
    organizationId: currentOrganization?._id
  });

  // Show placeholder when no formation exists
  if (!formationId) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 p-8 text-center shadow-lg">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">📋</span>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
            Formation Not Created Yet
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            Once the formation is created, the comment form and list will be displayed here, where you can react or give your opinion regarding the formation.
          </p>

          {/* Features List */}
          <div className="mt-6 space-y-2 text-left">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Share your tactical insights
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                React to team strategies
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Collaborate with teammates
              </p>
            </div>
          </div>

          {/* Waiting Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Waiting for formation
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full space-y-4">
      {/* Comment Input Section */}
      <div>
        <FormationCommentInput formationId={formationId} />
      </div>

      {/* Comments List Section */}
      <div className="flex-1 min-h-0">
        {sorted.length > 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
            {/* Comments Header */}
            <div className="sticky top-0 z-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💭</span>
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    Discussion
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
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {sorted.map((comment, index) => (
                  <div key={comment._id} className={`transition-colors duration-200 ${
                    index % 2 === 0 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-gray-50 dark:bg-gray-750'
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
        ) : (
          <div className="text-center py-8 px-4">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormationCommentList({ gameId, formationId }) {
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <CommentsPane gameId={gameId} formationId={formationId} />
    </Suspense>
  );
}

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
      if (newC) {
        startTransition(() => 
          setComments((prev) => {
            // Prevent duplicates: only add if comment doesn't already exist
            const exists = prev.some(c => c._id === newC._id);
            return exists ? prev : [...prev, newC];
          })
        );
      }
    },
    onError: (error) => {
      console.error('➕ ADD subscription error:', error);
    },
  });

  useSubscription(FORMATION_COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { formationId },
    skip: !formationId,
    onData: ({ data }) => {
      const upd = data.data?.formationCommentUpdated;
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
      if (deletedId) {
        startTransition(() =>
          setComments((prev) => {
            const filtered = prev.filter((c) => c._id !== deletedId);
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

  // Show placeholder when no formation exists
  if (!formationId) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
          
          <div className="p-6 text-center">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Formation Not Available
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">
              The tactical formation will be available here once it's created. You'll be able to discuss strategies with your teammates.
            </p>

            {/* Features */}
            <div className="space-y-2 text-left bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Share tactical insights
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Discuss team strategies
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Engage with teammates
                </p>
              </div>
            </div>
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
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
            
            {/* Comments Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Comments
                  </h4>
                </div>
                <div className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                  {sorted.length}
                </div>
              </div>
            </div>
            
            {/* Comments List */}
            <div className="max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 ">
                {sorted.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                    <FormationCommentItem
                      comment={comment}
                      formationId={formationId}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-2.5 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Share constructive feedback to improve team strategy
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md mb-3">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                No comments yet
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Be the first to share your thoughts on this formation
              </p>
            </div>
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

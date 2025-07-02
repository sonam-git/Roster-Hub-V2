import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_FORMATION_COMMENT,
  DELETE_FORMATION_COMMENT,
  LIKE_FORMATION_COMMENT,
} from '../../utils/mutations';
import Auth from '../../utils/auth';

export default function FormationCommentItem({ comment, formationId }) {
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  const isMine = userId && comment.user?._id === userId;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.commentText);

  const likedBy  = comment.likedBy ?? [];
  const hasLiked = !!userId && likedBy.some(u => u._id === userId);

  // Like / Unlike
  const [likeComment] = useMutation(LIKE_FORMATION_COMMENT, {
    variables: { commentId: comment._id },
    optimisticResponse: {
      likeFormationComment: {
        __typename: 'FormationComment',
        _id: comment._id,
        likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
        likedBy: hasLiked
          ? likedBy.filter(u => u._id !== userId)
          : [...likedBy, { __typename: 'Profile', _id: userId, name: comment.user.name }],
      },
    },
  });

  // Update
  const [updateComment] = useMutation(UPDATE_FORMATION_COMMENT, {
    variables: { commentId: comment._id, commentText: text },
    onCompleted: () => setEditing(false),
    optimisticResponse: {
      updateFormationComment: {
        __typename: 'FormationComment',
        _id: comment._id,
        commentText: text,
        updatedAt: new Date().toISOString(),
        likes: comment.likes,
        likedBy,
      },
    },
  });

  // Delete
  const [deleteComment] = useMutation(DELETE_FORMATION_COMMENT, {
    variables: { formationId, commentId: comment._id },
    optimisticResponse: {
      deleteFormationComment: comment._id
    },
    update(cache, { data: { deleteFormationComment } }) {
      // Evict that ID from the Formation.comments[] in the cache:
      const formationRef = cache.identify({ __typename: 'Formation', _id: formationId });
      cache.modify({
        id: formationRef,
        fields: {
          comments(existing = [], { readField }) {
            return existing.filter(
              ref => readField('_id', ref) !== deleteFormationComment
            );
          }
        }
      });
    }
  });

  return (
    <div className="my-2 p-3 border rounded-xl shadow-sm bg-white/90 dark:bg-gray-800 transition-all flex flex-col justify-between min-h-[90px]">
      {editing ? (
        <>
          <textarea
            rows="2"
            className="w-full border rounded px-2 py-1 dark:bg-gray-700 focus:ring-2 focus:ring-blue-400"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => updateComment()}
              className="px-4 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
              disabled={!text.trim()}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setText(comment.commentText);
              }}
              className="px-4 py-1 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Top: author and date */}
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm text-indigo-700 dark:text-yellow-200">{comment.commentAuthor}</span>
            <small className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {new Date(parseInt(comment.createdAt, 10)).toLocaleString()}
            </small>
          </div>
          {/* Middle: comment text */}
          <div className="text-base leading-snug break-words text-gray-900 dark:text-gray-100 mb-2">
            {comment.commentText}
          </div>
          {/* Bottom: like and actions right */}
          <div className="flex items-center justify-end gap-4 text-sm mt-auto">
            <button
              onClick={() => userId && likeComment()}
              className={`flex items-center gap-1 px-2 py-1 rounded-full font-semibold transition ${hasLiked ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'} hover:scale-105`}
              title={hasLiked ? 'Unlike' : 'Like'}
            >
              <span className="text-lg">♥</span>
              <span>{comment.likes}</span>
            </button>
            {isMine && (
              <>
                <button onClick={() => setEditing(true)} title="Edit" className="hover:text-blue-600">✏️</button>
                <button onClick={() => deleteComment()} title="Delete" className="hover:text-red-600">🗑️</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

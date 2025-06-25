// src/components/FormationCommentItem.jsx
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
  const [text, setText] = useState(comment.commentText || '');

  /* 👉 MOVE THESE UP so they exist before optimisticResponse uses them */
  const likedBy  = comment.likedBy ?? [];
  const hasLiked = !!userId && likedBy.some(u => u._id === userId);

  /* ---- LIKE / UNLIKE ------------------------------------------------ */
  const [likeComment] = useMutation(LIKE_FORMATION_COMMENT, {
    variables: { commentId: comment._id },
    optimisticResponse: {
      likeFormationComment: {
        __typename: 'FormationComment',
        _id: comment._id,
        commentText: comment.commentText,
        likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
        likedBy: hasLiked
          ? likedBy.filter(u => u._id !== userId)
          : [...likedBy, { __typename: 'Profile', _id: userId }],
      },
    },
  });

  /* ---- UPDATE ------------------------------------------------------- */
  const [updateComment] = useMutation(UPDATE_FORMATION_COMMENT, {
    variables: { commentId: comment._id, commentText: text },
    onCompleted: () => setEditing(false),
    optimisticResponse: {
      updateFormationComment: {
        __typename: 'FormationComment',
        _id: comment._id,
        commentText: text,
        likes: comment.likes,
        likedBy,
        updatedAt: new Date().toISOString(),
      },
    },
  });

  /* ---- DELETE ------------------------------------------------------- */
  const [deleteComment] = useMutation(DELETE_FORMATION_COMMENT, {
    variables: { formationId, commentId: comment._id },
  });
  
  return (
    <div className="my-2 p-2 border rounded dark:border-gray-600">
      {editing ? (
        <>
          <textarea
            rows="2"
            className="w-full border rounded px-2 py-1 dark:bg-gray-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-1 space-x-2">
            <button
              onClick={() => updateComment()}
              className="px-3 py-1 bg-blue-600 text-white rounded"
              disabled={!text.trim()}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setText(comment.commentText);
              }}
              className="px-3 py-1 bg-gray-400 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <p>{comment.commentText}</p>
            <small className="text-gray-500">
              {comment.commentAuthor} ·{' '}
              {comment.createdAt
                ? new Date(parseInt(comment.createdAt)).toLocaleString()
                : 'Just now'}
            </small>
          </div>

          <div className="mt-1 flex items-center space-x-4 text-sm">
            <button
              onClick={() => userId && likeComment()}
              className="flex items-center space-x-1"
              title={hasLiked ? 'Unlike' : 'Like'}
            >
              <span className={hasLiked ? 'text-red-600' : 'text-gray-600'}>
                ♥
              </span>
              <span>{comment.likes ?? 0}</span>
            </button>

            {isMine && (
              <>
                <button onClick={() => setEditing(true)} title="Edit">
                  ✏️
                </button>
                <button onClick={() => deleteComment()} title="Delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

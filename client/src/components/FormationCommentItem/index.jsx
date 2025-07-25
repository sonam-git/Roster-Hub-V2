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
    <div className="group p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
      {editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {comment.commentAuthor?.charAt(0)?.toUpperCase() || '✏️'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Editing comment...
            </span>
          </div>
          
          <textarea
            rows="3"
            className="w-full border-2 border-blue-200 dark:border-blue-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 resize-none"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Update your comment..."
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {text.length}/500 characters
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateComment()}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                disabled={!text.trim()}
              >
                <span>💾</span>
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setText(comment.commentText);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <span>❌</span>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 bg-blue-100 dark:bg-gray-800 p-3 rounded-lg">
          {/* Author Header */}
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {comment.commentAuthor?.charAt(0)?.toUpperCase() || '👤'}
                </span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {comment.commentAuthor}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(parseInt(comment.createdAt, 10)).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {isMine && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => setEditing(true)} 
                  title="Edit comment"
                  className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors duration-200"
                >
                  <span className="text-sm">✏️</span>
                </button>
                <button 
                  onClick={() => deleteComment()} 
                  title="Delete comment"
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors duration-200"
                >
                  <span className="text-sm">🗑️</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="pl-11">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-indigo-500 dark:border-indigo-400">
              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                {comment.commentText}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="pl-11 flex items-center justify-between">
            <button
              onClick={() => userId && likeComment()}
              className={`group relative overflow-hidden font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                hasLiked 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600'
              } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!userId ? "Please log in to like this comment" : (hasLiked ? 'Unlike this comment' : 'Like this comment')}
              disabled={!userId}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                hasLiked 
                  ? 'from-red-400 to-pink-400' 
                  : 'from-gray-100 to-gray-200 dark:from-gray-500 dark:to-gray-600'
              }`}></div>
              
              <span className={`relative z-10 text-lg transition-transform duration-200 ${hasLiked ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}>
                {hasLiked ? '❤️' : '🤍'}
              </span>
              <div className="relative z-10 flex items-center gap-1">
                <span className="font-bold">{comment.likes}</span>
                <span className="text-sm hidden sm:inline">
                  {comment.likes === 1 ? 'like' : 'likes'}
                </span>
              </div>
              
              <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>
            
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                edited
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

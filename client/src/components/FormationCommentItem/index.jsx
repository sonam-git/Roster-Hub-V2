import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  UPDATE_FORMATION_COMMENT,
  DELETE_FORMATION_COMMENT,
  LIKE_FORMATION_COMMENT,
} from '../../utils/mutations';
import Auth from '../../utils/auth';
import { useOrganization } from '../../contexts/OrganizationContext';

export default function FormationCommentItem({ comment, formationId }) {
  const { currentOrganization } = useOrganization();
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;
  const isMine = userId && comment.user?._id === userId;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.commentText);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync text when comment is updated from subscription
  useEffect(() => {
    setText(comment.commentText);
  }, [comment.commentText]);

  // Local state for likes to ensure UI consistency
  const [localLikes, setLocalLikes] = useState(comment.likes || 0);
  const [localLikedBy, setLocalLikedBy] = useState(comment.likedBy ?? []);

  // Sync local state when comment prop changes (from subscription updates)
  useEffect(() => {
    console.log('🔄 FormationCommentItem syncing from props:', {
      commentId: comment._id,
      oldLikes: localLikes,
      newLikes: comment.likes,
      oldLikedBy: localLikedBy.length,
      newLikedBy: comment.likedBy?.length
    });
    setLocalLikes(comment.likes || 0);
    setLocalLikedBy(comment.likedBy ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.likes, comment.likedBy]);

  const hasLiked = !!userId && localLikedBy.some(u => u._id === userId);

  // Like / Unlike
  const [likeComment] = useMutation(LIKE_FORMATION_COMMENT, {
    variables: { 
      commentId: comment._id,
      organizationId: currentOrganization?._id
    },
    onCompleted: (data) => {
      console.log('❤️ LIKE mutation completed:', data);
      // Update local state immediately for this user
      if (data?.likeFormationComment) {
        setLocalLikes(data.likeFormationComment.likes);
        setLocalLikedBy(data.likeFormationComment.likedBy ?? []);
      }
    },
    onError: (error) => {
      console.error('❤️ LIKE mutation error:', error);
    },
  });

  // Update
  const [updateComment] = useMutation(UPDATE_FORMATION_COMMENT, {
    variables: { 
      commentId: comment._id, 
      commentText: text,
      organizationId: currentOrganization?._id
    },
    onCompleted: (data) => {
      console.log('🔄 UPDATE mutation completed:', data);
      setEditing(false);
      // Text will be synced via useEffect when comment prop updates
    },
    onError: (error) => {
      console.error('🔄 UPDATE mutation error:', error);
    },
  });

  // Delete
  const [deleteComment, { loading: deleteLoading }] = useMutation(DELETE_FORMATION_COMMENT, {
    variables: { 
      formationId, 
      commentId: comment._id,
      organizationId: currentOrganization?._id
    },
    onCompleted: (data) => {
      console.log('🗑️ DELETE mutation completed:', data);
      setShowDeleteModal(false);
    },
    onError: (error) => {
      console.error('🗑️ DELETE mutation error:', error);
      alert('Failed to delete comment. Please try again.');
      setShowDeleteModal(false);
    },
  });

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteComment();
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="group p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
      {editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">
                {comment.commentAuthor?.charAt(0)?.toUpperCase() || '✏️'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Editing your comment
            </span>
          </div>
          
          <textarea
            rows="3"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-150 resize-none"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Update your comment..."
            maxLength={500}
          />
          
          <div className="flex items-center justify-between">
            <div className={`text-xs font-medium ${
              text.length > 450 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {text.length}/500
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateComment()}
                disabled={!text.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-sm font-medium shadow-sm transition-all duration-150 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setText(comment.commentText);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Author Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {comment.commentAuthor?.charAt(0)?.toUpperCase() || '👤'}
                </span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {comment.commentAuthor}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(parseInt(comment.createdAt, 10)).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="ml-2 italic">(edited)</span>
                  )}
                </p>
              </div>
            </div>
            
            {isMine && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button 
                  onClick={() => setEditing(true)} 
                  title="Edit comment"
                  className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={handleDeleteClick} 
                  title="Delete comment"
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="pl-11">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md px-3 py-2.5 border-l-2 border-indigo-500 dark:border-indigo-400">
              <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed break-words">
                {comment.commentText}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="pl-11 flex items-center">
            <button
              onClick={() => userId && likeComment()}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                hasLiked 
                  ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              } ${!userId ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
              title={!userId ? "Please log in to like this comment" : (hasLiked ? 'Unlike' : 'Like')}
              disabled={!userId}
            >
              <svg className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-semibold">{localLikes}</span>
              <span className="hidden sm:inline">
                {localLikes === 1 ? 'like' : 'likes'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-300 dark:border-gray-700">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
            
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Comment
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-5">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>

              {/* Comment Preview */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 mb-5 border-l-2 border-red-500 dark:border-red-400">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {comment.commentText}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md text-sm font-medium transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

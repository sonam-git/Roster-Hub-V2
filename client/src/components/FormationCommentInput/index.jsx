import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_FORMATION_COMMENT } from '../../utils/mutations';
import Auth from '../../utils/auth';
import { useOrganization } from '../../contexts/OrganizationContext';

export default function FormationCommentInput({ formationId }) {
  const { currentOrganization } = useOrganization();
  const [text, setText] = useState('');
  const isLoggedIn = Auth.loggedIn();
  const currentUser = isLoggedIn ? Auth.getProfile()?.data : null;

  const [addComment, { loading }] = useMutation(ADD_FORMATION_COMMENT, {
    variables: { 
      formationId, 
      commentText: text,
      organizationId: currentOrganization?._id
    },
    onCompleted: () => setText(''),
  });

  if (!isLoggedIn) {
    return (
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-md bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Authentication Required
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Sign in to join the discussion and share your tactical insights with the team.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '👤'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {currentUser?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add a comment
            </p>
          </div>
        </div>
        
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!currentOrganization) {
              console.error('No organization selected');
              alert('Please select an organization to comment.');
              return;
            }
            if (text.trim()) addComment();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2.5 pr-16 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-150 resize-none"
              placeholder="Share your thoughts on this formation..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className={`absolute bottom-2 right-2 text-xs font-medium ${
              text.length > 450 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {text.length}/500
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Be respectful and constructive
              </span>
            </div>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                loading || !text.trim()
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

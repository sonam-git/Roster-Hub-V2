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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
          <span className="text-xl">🔒</span>
          <p className="font-medium">Please log in to join the discussion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {currentUser?.name?.charAt(0)?.toUpperCase() || '👤'}
          </span>
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-800 dark:text-white">
            {currentUser?.name || 'Anonymous'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Share your thoughts about this formation
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
            className="w-full border-2 border-gray-200  dark:border-gray-600 rounded-lg px-4 py-3 pr-12 text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-black focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 resize-none"
            placeholder="What do you think about this formation? Share your tactical insights..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
            {text.length}/500
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-sm">💡</span>
            <span>Be respectful and constructive</span>
          </div>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform ${
              loading || !text.trim()
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <span className="text-base">📝</span>
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

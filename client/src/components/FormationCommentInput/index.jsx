// src/components/FormationCommentInput.jsx
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_FORMATION_COMMENT } from '../../utils/mutations';
import Auth from '../../utils/auth';

export default function FormationCommentInput({ formationId }) {
  const [text, setText] = useState('');
  const isLoggedIn = Auth.loggedIn();

  const [addComment, { loading }] = useMutation(ADD_FORMATION_COMMENT, {
    variables: { formationId, commentText: text },
    onCompleted: () => setText(''),
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (isLoggedIn && text.trim()) addComment();
      }}
      className="flex gap-2 mt-4"
    >
      <input
        disabled={!isLoggedIn}
        className="flex-1 border rounded px-2 py-1 dark:bg-gray-700"
        placeholder={isLoggedIn ? 'Add a comment…' : 'Login to comment'}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={!isLoggedIn || loading || !text.trim()}
        className="px-4 py-1 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Post
      </button>
    </form>
  );
}

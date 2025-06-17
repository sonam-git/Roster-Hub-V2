// src/components/GameFeedback.jsx
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_FEEDBACK } from "../../utils/mutations";
import { QUERY_GAME } from "../../utils/queries";

const GameFeedback = ({ gameId, isDarkMode, onFeedback }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating]   = useState(5);
  const [validationError, setValidationError] = useState("");

  const [addFeedback, { loading, error }] = useMutation(ADD_FEEDBACK, {
    refetchQueries: [{ query: QUERY_GAME, variables: { gameId } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // clear form
      setComment("");
      setRating(5);
      // notify parent
      onFeedback();
    }
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!comment.trim() || isNaN(rating) || rating < 0 || rating > 10) {
      setValidationError("Please add your feedback and rating (0–10).");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }
    await addFeedback({ variables: { gameId, comment: comment.trim(), rating } });
  };

  return (
    <div
      className={`mt-8 p-4 rounded ${
        isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <p className="mb-4 text-sm">
        Feedbacks are collected anonymously—please keep it constructive and solution-oriented!
      </p>
      <h4 className="text-lg font-bold mb-2">What did you think of today’s game?</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-2 border rounded dark:bg-gray-800"
          placeholder="Your thoughts…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
        />
        <div className="flex items-center space-x-2">
          <label className="font-medium">Your rating (0–10):</label>
          <input
            type="number"
            min="0"
            max="10"
            value={rating}
            onChange={e => setRating(parseInt(e.target.value, 10) || 0)}
            className="w-16 p-1 border rounded dark:bg-gray-800"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-800"
        >
          {loading ? "Submitting…" : "Submit Feedback"}
        </button>
        {validationError && <p className="mt-1 text-red-500 italic">{validationError}</p>}
        {error && <p className="mt-1 text-red-500">{error.message}</p>}
      </form>
    </div>
  );
};

export default GameFeedback;

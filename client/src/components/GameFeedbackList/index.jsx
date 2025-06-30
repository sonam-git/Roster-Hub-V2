// src/components/GameFeedbackList.jsx
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_GAME } from "../../utils/queries";

const GameFeedbackList = ({ gameId, isDarkMode }) => {
  const { loading, error, data } = useQuery(QUERY_GAME, {
    variables: { gameId },
    fetchPolicy: "network-only",
  });
  const [page, setPage] = useState(0);
  const perPage = 2;

  if (loading) return <p className="mt-4 text-center">Loading feedback…</p>;
  if (error)
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading feedback: {error.message}
      </p>
    );

  const feedbacks = data?.game?.feedbacks || [];
  if (!feedbacks.length) {
    return (
      <p
        className={`mt-4 italic text-center ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        No feedback yet. Be the first to share your thoughts!
      </p>
    );
  }

  const totalPages = Math.ceil(feedbacks.length / perPage);
  const paged = feedbacks.slice(page * perPage, (page + 2) * perPage);

  return (
    <div className="mt-6">
      {/* Anonymous feedback header */}
      <p
        className={`mb-4 text-lg font-semibold text-center italic ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
       Feedback List from our players.
      </p>

      <div className="space-y-4">
        {paged.map((fb) => (
          <div
            key={fb._id}
            className={`p-4 rounded shadow ${
              isDarkMode ? "bg-gray-700 text-gray-200" : "bg-green-100 text-gray-800"
            }`}
          >
            {/* top row: date left, rating right */}
            <div className="flex justify-between items-center mb-2 text-sm text-gray-700">
              <span>
                {new Date(parseInt(fb.createdAt)).toLocaleString()}
              </span>
              <span className="font-medium">
                Rating : {fb.rating} / 10
              </span>
            </div>

            {/* comment, italic, smaller text */}
            <p className="italic text-sm">
              {fb.comment}
            </p>
          </div>
        ))}
      </div>

      {/* pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-gray-300 text-gray-800 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="self-center text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded bg-gray-300 text-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GameFeedbackList;

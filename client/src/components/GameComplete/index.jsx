// src/components/GameComplete.jsx
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { COMPLETE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";

const GameComplete = ({
  gameId,
  note,        // ⬅️ grab the note prop
  onClose,
  isDarkMode,
  onComplete,
}) => {
  const [score, setScore]   = useState("");
  const [result, setResult] = useState("NOT_PLAYED");

  const [completeGame, { loading, error }] = useMutation(COMPLETE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME,  variables: { gameId} },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // notify parent so it can update UI
      onComplete(score, result);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    completeGame({
      variables: {
        gameId,
        score,
        result,
        note,         // ⬅️ pass the note here
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50">
      <div
        className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Complete Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Score */}
          <div>
            <label className="block font-semibold mb-1">Score</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 2 - 1"
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700"
            />
          </div>
          {/* Result */}
          <div>
            <label className="block font-semibold mb-1">Result</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700"
            >
              <option value="HOME_WIN">Home Win</option>
              <option value="AWAY_WIN">Away Win</option>
              <option value="DRAW">Draw</option>
              <option value="NOT_PLAYED">Not Played</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error.message}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm mx-1 mb-2 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 text-white hover:bg-gray-800 hover:text-gray-100 active:scale-95 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm mx-1 mb-2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:bg-gray-800 hover:text-gray-100 active:scale-95 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 dark:text-white disabled:opacity-50"
            >
              {loading ? "Submitting…" : "Complete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameComplete;

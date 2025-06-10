import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import {
  RESPOND_TO_GAME,
  UNVOTE_GAME,
  CONFIRM_GAME,
  CANCEL_GAME,
} from "../../utils/mutations";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import PlayersList from "../PlayersList";

const GameDetails = ({ gameId }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const userId = Auth.getProfile()?.data?._id || null;

  // Fetch single game
  const { loading, error, data, refetch } = useQuery(QUERY_GAME, {
    variables: { gameId },
    pollInterval: 5000,
  });

  // Mutations
  const [respondToGame] = useMutation(RESPOND_TO_GAME, { onCompleted: () => refetch() });
  const [unvoteGame] = useMutation(UNVOTE_GAME, { onCompleted: () => refetch() });
  const [confirmGame] = useMutation(CONFIRM_GAME, {
    refetchQueries: [
      { query: QUERY_GAME, variables: { gameId } },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
  });
  const [cancelGame] = useMutation(CANCEL_GAME, {
    refetchQueries: [
      { query: QUERY_GAME, variables: { gameId } },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
  });

  // Track user vote
  const [currentVote, setCurrentVote] = useState(null);
  useEffect(() => {
    if (!loading && data?.game) {
      const existing = data.game.responses.find((r) => r.user._id === userId);
      setCurrentVote(existing ? existing.isAvailable : null);
    }
  }, [loading, data, userId]);

  // Note state
  const [updatedNote, setUpdatedNote] = useState("");
  useEffect(() => {
    if (!loading && data?.game) {
      setUpdatedNote(data.game.notes || "");
    }
  }, [loading, data]);

  if (loading) return <div className="text-center mt-4">Loading game...</div>;
  if (error)
    return (
      <div className="text-center mt-4 text-red-600">Error: {error.message}</div>
    );
  if (!data?.game) return <div className="text-center mt-4 text-red-600">Game not found.</div>;

  const game = data.game;
  const isCreator = game.creator._id === userId;

  // Format date
  const ts = Number(game.date);
  const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
  const humanDate = dateObj.toLocaleDateString();

  // Handlers
  const handleVote = async (isAvailable) => {
    if (!userId) return alert("You must be logged in to vote");
    await respondToGame({ variables: { input: { gameId, isAvailable } } });
  };

  const handleUnvote = async () => {
    await unvoteGame({ variables: { gameId } });
  };

  const handleConfirm = async () => {
    await confirmGame({ variables: { gameId, note: updatedNote } });
  };

  const handleCancel = async () => {
    await cancelGame({ variables: { gameId, note: updatedNote } });
  };

  // Player lists
  const yesVoters = game.responses.filter((r) => r.isAvailable).map((r) => r.user.name);
  const noVoters = game.responses.filter((r) => !r.isAvailable).map((r) => r.user.name);

  return (
    <div
      className={`max-w-4xl mx-auto p-6 rounded-lg shadow-md grid grid-cols-1 lg:grid-cols-2 gap-8 ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      {/* Left column: Details */}
      <div>
        <button
          onClick={() => navigate("/game-schedule")}
          className={`mb-4 px-4 py-2 rounded ${
            isDarkMode
              ? "bg-gray-500 text-white hover:bg-gray-900"
              : "bg-indigo-600 text-white hover:bg-gray-800"
          }`}
        >
          ← Back to Game List
        </button>

        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            <span className="font-bold">Date:</span> {humanDate} &nbsp;|&nbsp;
            <span className="font-bold">Time:</span> {game.time}
          </h3>
        </div>

        <p className="mb-1">
          <span className="font-bold">Venue:</span> {game.venue}
        </p>

        {isCreator ? (
          <div className="mb-4">
            <label className="block mb-2 font-bold">
              Update Note (reason for confirm / cancel):
            </label>
            <textarea
              value={updatedNote}
              onChange={(e) => setUpdatedNote(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded ${
                isDarkMode
                  ? "dark:bg-gray-700 dark:text-gray-200 border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
              placeholder="Add or update note here..."
            />
          </div>
        ) : (
          <p className="mb-4">
            <span className="font-bold">Note:</span> {game.notes || "No notes provided"}
          </p>
        )}

        <p className="mb-4">
          <span className="font-bold">Created By:</span> {game.creator.name}
        </p>

        {game.status === "PENDING" && (
          <div className="mb-6">
            {currentVote === null ? (
              <div>
                <p className="mb-2 font-medium">Are you available to play?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVote(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  You responded: <span className="font-semibold">{currentVote ? "Available" : "Not Available"}</span>
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVote(!currentVote)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Change to {currentVote ? "No" : "Yes"}
                  </button>
                  <button
                    onClick={handleUnvote}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Unvote
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {game.status !== "PENDING" && (
          <p className="mb-4">
            <strong>Status:</strong> <span className={game.status === "CONFIRMED" ? "text-green-600" : "text-red-600"}>{game.status}</span>
          </p>
        )}

        {isCreator && game.status === "PENDING" && (
          <div className="flex space-x-4 mb-6">
            <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm Game</button>
            <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cancel Game</button>
          </div>
        )}
        {isCreator && game.status === "CONFIRMED" && (
          <div className="mb-6">
            <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cancel Game</button>
          </div>
        )}
        {isCreator && game.status === "CANCELLED" && (
          <div className="mb-6">
            <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Re-Confirm Game</button>
          </div>
        )}

        <div className="flex space-x-6 mb-6">
          <div className="flex items-center">
            <span className="text-green-600 mr-1">👍</span>
            <span>{game.availableCount} available</span>
          </div>
          <div className="flex items-center">
            <span className="text-red-600 mr-1">👎</span>
            <span>{game.unavailableCount} not available</span>
          </div>
        </div>
      </div>

      {/* Right column: Player lists */}
      <PlayersList yesVoters={yesVoters} noVoters={noVoters} />
    </div>
  );
};

export default GameDetails;
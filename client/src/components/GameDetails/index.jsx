import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import {
  RESPOND_TO_GAME,
  CONFIRM_GAME,
  CANCEL_GAME,
} from "../../utils/mutations";
import Auth from "../../utils/auth";

const GameDetails = ({ gameId, isDarkMode }) => {
  const navigate = useNavigate();
  const userId = Auth.getProfile()?.data?._id || null;

  const { loading, error, data, refetch } = useQuery(QUERY_GAME, {
    variables: { gameId },
    pollInterval: 5000,
  });

  const [respondToGame] = useMutation(RESPOND_TO_GAME, {
    onCompleted: () => refetch(),
  });
  const [confirmGame] = useMutation(CONFIRM_GAME, {
    onCompleted: () => refetch(),
    refetchQueries: [{ query: QUERY_GAMES, variables: { status: "PENDING" } }],
  });
  const [cancelGame] = useMutation(CANCEL_GAME, {
    onCompleted: () => refetch(),
    refetchQueries: [{ query: QUERY_GAMES, variables: { status: "PENDING" } }],
  });

  const [hasResponded, setHasResponded] = useState(false);
  const [myResponse, setMyResponse] = useState(null);

  useEffect(() => {
    if (!loading && data?.game) {
      const existing = data.game.responses.find(
        (r) => r.user._id === userId
      );
      if (existing) {
        setHasResponded(true);
        setMyResponse(existing.isAvailable);
      } else {
        setHasResponded(false);
        setMyResponse(null);
      }
    }
  }, [loading, data, userId]);

  if (loading)
    return <div className="text-center mt-4">Loading game...</div>;
  if (error)
    return (
      <div className="text-center mt-4 text-red-600">
        Error: {error.message}
      </div>
    );
  if (!data?.game)
    return (
      <div className="text-center mt-4 text-red-600">
        Game not found.
      </div>
    );

  const game = data.game;
  const isCreator = game.creator._id === userId;

  // Convert date
  const ts = Number(game.date);
  const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
  const humanDate = dateObj.toLocaleDateString();

  const handleVote = async (isAvailable) => {
    if (!userId) return alert("You must be logged in to vote");
    try {
      await respondToGame({
        variables: { input: { gameId, isAvailable } },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmGame({ variables: { gameId } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelGame({ variables: { gameId } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <h2 className="text-2xl font-bold mb-2">
        Game: {humanDate} @ {game.time}
      </h2>
      <p className="mb-1">
        <strong>Venue:</strong> {game.venue}
      </p>
      {game.notes && (
        <p className="mb-4">
          <strong>Notes:</strong> {game.notes}
        </p>
      )}

      {game.status === "PENDING" && !hasResponded && (
        <div className="mb-4">
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
      )}

      {game.status === "PENDING" && hasResponded && (
        <p className="mb-4">
          You responded:{" "}
          <span className="font-semibold">
            {myResponse ? "Available" : "Not Available"}
          </span>
        </p>
      )}

      {game.status !== "PENDING" && (
        <p className="mb-4">
          <strong>Status:</strong>{" "}
          <span
            className={
              game.status === "CONFIRMED"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {game.status}
          </span>
        </p>
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

      {isCreator && game.status === "PENDING" && (
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm Game
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Game
          </button>
        </div>
      )}

      {isCreator && game.status !== "PENDING" && (
        <button
          onClick={() => navigate("/game-schedule")}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Game List
        </button>
      )}
    </div>
  );
};

export default GameDetails;

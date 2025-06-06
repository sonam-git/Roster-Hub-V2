// src/components/GameDetails.jsx

import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import {
  RESPOND_TO_GAME,
  CONFIRM_GAME,
  CANCEL_GAME,
} from "../../utils/mutations";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";

const GameDetails = ({ gameId }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const userId = Auth.getProfile()?.data?._id || null;

  // Fetch the single game
  const { loading, error, data, refetch } = useQuery(QUERY_GAME, {
    variables: { gameId },
    pollInterval: 5000,
  });

  // Mutations for voting, confirming, canceling
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

  // Track if the current user already voted
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

  // Convert the stored date (which is a stringified timestamp) back to a Date
  const ts = Number(game.date);
  const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
  const humanDate = dateObj.toLocaleDateString();

  // Vote handler
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

  // Confirm handler
  const handleConfirm = async () => {
    try {
      await confirmGame({ variables: { gameId } });
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel handler
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
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      {/* Back to list button */}
      <button
        onClick={() => navigate("/game-schedule")}
        className={`mb-4 px-4 py-2 rounded ${
          isDarkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        ← Back to Game List
      </button>

      {/* Header: Date & Time */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-semibold">
          <span>
            <span className="font-bold">Date:</span> {humanDate} &nbsp;|&nbsp;
            <span className="font-bold">Time:</span> {game.time}
          </span>
        </h3>
      </div>

      {/* Venue, Notes, Created By */}
      <p className="mb-1">
        <span className="font-bold">Venue:</span> {game.venue}
      </p>
      <p className="text-sm mb-2">
        <span className="font-bold">Note:</span>{" "}
        {game.notes || "No notes provided"}
      </p>
      <p className="mb-4">
        <span className="font-bold">Created By:</span> {game.creator.name}
      </p>

      {/* Voting or Status */}
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

      {/* Vote counts */}
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

      {/* Creator-only buttons: */}
      {/* If PENDING → show Confirm + Cancel */}
      {/* If CONFIRMED → show only Cancel (to revert) */}
      {/* If CANCELLED → show only Confirm (to reinstate) */}
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

      {isCreator && game.status === "CONFIRMED" && (
        <div className="mb-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel Game
          </button>
        </div>
      )}

      {isCreator && game.status === "CANCELLED" && (
        <div className="mb-4">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Re-Confirm Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameDetails;

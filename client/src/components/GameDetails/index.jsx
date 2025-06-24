// src/components/GameDetails.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import { QUERY_GAME, QUERY_GAMES, QUERY_FORMATION } from "../../utils/queries";
import {
  RESPOND_TO_GAME,
  UNVOTE_GAME,
  CONFIRM_GAME,
  CANCEL_GAME,
  COMPLETE_GAME,
} from "../../utils/mutations";
import {
  FORMATION_CREATED_SUBSCRIPTION,
  FORMATION_UPDATED_SUBSCRIPTION,
  FORMATION_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";

import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import VotersList from "../VotersList";
import GameUpdate from "../GameUpdate";
import GameComplete from "../GameComplete";
import GameFeedback from "../GameFeedback";
import GameFeedbackList from "../GameFeedbackList";
import FormationSection from "../FormationSection";
import AvailablePlayersList from "../AvailablePlayersList";

export default function GameDetails({ gameId }) {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const userId = Auth.getProfile()?.data?._id;

  // keep track of mounted state
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ─── FETCH GAME ─────────────────────────────────────────────────────────
  const {
    loading: loadingGame,
    error: gameError,
    data: gameData,
    refetch: refetchGame,
  } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
    pollInterval: 5000,
  });

  // ─── FETCH FORMATION ───────────────────────────────────────────────────
  const [formation, setFormation] = useState(null);
  const {
    loading: loadingForm,
    error: formError,
    refetch: refetchFormation,
  } = useQuery(QUERY_FORMATION, {
    variables: { gameId },
    skip: !gameId,
    fetchPolicy: "network-only",
    onCompleted: (d) => {
      if (isMounted.current) {
        setFormation(d?.formation || null);
      }
    },
  });

  // ─── REAL-TIME FORMATION ───────────────────────────────────────────────
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const created = data.data?.formationCreated;
      if (created && isMounted.current) {
        setFormation(created);
      }
    },
  });
  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const updated = data.data?.formationUpdated;
      if (updated && isMounted.current) {
        setFormation(updated);
      }
    },
  });
  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      if (data.data?.formationDeleted === gameId && isMounted.current) {
        setFormation(null);
      }
    },
  });

  // ─── GAME MUTATIONS ─────────────────────────────────────────────────────
  const [respondToGame] = useMutation(RESPOND_TO_GAME, {
    onCompleted: () => refetchGame(),
  });
  const [unvoteGame] = useMutation(UNVOTE_GAME, {
    onCompleted: () => refetchGame(),
  });
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
  const [completeGame] = useMutation(COMPLETE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME, variables: { gameId } },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
  });

  // ─── LOCAL STATE ────────────────────────────────────────────────────────
  const [currentVote, setCurrentVote] = useState(null);
  useEffect(() => {
    if (!loadingGame && gameData?.game) {
      const r = gameData.game.responses.find((r) => r.user._id === userId);
      setCurrentVote(r ? r.isAvailable : null);
    }
  }, [loadingGame, gameData, userId]);

  const [updatedNote, setUpdatedNote] = useState("");
  useEffect(() => {
    if (!loadingGame && gameData?.game) {
      setUpdatedNote(gameData.game.notes || "");
    }
  }, [loadingGame, gameData]);

  // feedback UI
  const [showUpdate, setShowUpdate] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  useEffect(() => {
    if (!loadingGame && gameData?.game) {
      const done = gameData.game.feedbacks.some((f) => f.user._id === userId);
      setFeedbackGiven(done);
    }
  }, [loadingGame, gameData, userId]);
  const handleFeedback = () => {
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
    setFeedbackGiven(true);
  };

  if (loadingGame || loadingForm)
    return <div className="text-center mt-4">Loading…</div>;
  if (gameError || formError)
    return (
      <div className="text-center mt-4 text-red-600">Error loading data</div>
    );
  if (!gameData?.game)
    return <div className="text-center mt-4 text-red-600">Game not found.</div>;

  const game = gameData.game;
  const isCreator = game.creator._id === userId;
  const dateObj = new Date(Number(game.date));
  const humanDate = isNaN(dateObj) ? game.date : dateObj.toLocaleDateString();
  const [h, m] = game.time.split(":").map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  const gameTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

  const yesVoters = game.responses
    .filter((r) => r.isAvailable)
    .map((r) => r.user.name);
  const noVoters = game.responses
    .filter((r) => !r.isAvailable)
    .map((r) => r.user.name);

  return (
    <div
      className={`max-w-screen mx-auto p-6 rounded-lg shadow-md
      grid grid-cols-1 lg:grid-cols-2 gap-8
      ${isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}`}
    >
      {/* ─── LEFT COLUMN: Info, Voting & Voters ─────────────────────────── */}
      <div>
        <button
          onClick={() => navigate("/game-schedule")}
          className={`mb-4 px-4 py-2 rounded ${
            isDarkMode ? "bg-gray-500 text-white" : "bg-indigo-600 text-white"
          }`}
        >
          ← Back to Game List
        </button>

        <h3 className="text-xl font-semibold mb-4">
          <strong>Date:</strong> {humanDate} &nbsp;|&nbsp;
          <strong>Time:</strong> {gameTime}
        </h3>

        <p className="mb-2">
          <strong>Venue:</strong> {game.venue}
        </p>
        <p className="mb-4">
          <strong>Opponent:</strong> {game.opponent}
        </p>

        {isCreator ? (
          <textarea
            value={updatedNote}
            onChange={(e) => setUpdatedNote(e.target.value)}
            rows={3}
            className="w-full mb-4 p-2 border rounded dark:bg-gray-700"
            placeholder="Update note…"
          />
        ) : (
          <p className="mb-4">
            <strong>Note:</strong> {game.notes || "No notes"}
          </p>
        )}

        {game.status === "PENDING" && (
          <div className="mb-6 space-x-4">
            {currentVote === null ? (
              <>
                <button
                  onClick={() =>
                    respondToGame({
                      variables: { input: { gameId, isAvailable: true } },
                    })
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() =>
                    respondToGame({
                      variables: { input: { gameId, isAvailable: false } },
                    })
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  No
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    respondToGame({
                      variables: {
                        input: { gameId, isAvailable: !currentVote },
                      },
                    })
                  }
                  className="px-4 py-2 bg-yellow-600 text-white rounded"
                >
                  Change to {currentVote ? "No" : "Yes"}
                </button>
                <button
                  onClick={() => unvoteGame({ variables: { gameId } })}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Unvote
                </button>
              </>
            )}
          </div>
        )}

        {game.status !== "PENDING" && (
          <p className="mb-4">
            <strong>Status:</strong>{" "}
            <span
              className={
                game.status === "CONFIRMED"
                  ? "text-green-600"
                  : game.status === "COMPLETED"
                  ? "text-green-400"
                  : "text-red-600"
              }
            >
              {game.status}
            </span>
          </p>
        )}

        {game.status === "COMPLETED" && (
          <div className="mb-6">
            <p className="mb-2">
              <strong >Score:</strong> {game.score}
            </p>
            <p className="mb-2">
              <strong>Result:</strong> {game.result.replace("_", " ")}
            </p>
            <p className="mt-2 p-2  bg-yellow-300 dark:bg-gray-500 rounded">
              <strong>Avg Rating:</strong> {game.averageRating.toFixed(1)} / 10
            </p>
          </div>
        )}

        {isCreator && game.status === "PENDING" && (
          <div className="space-x-4 mb-6">
            <button
              onClick={() =>
                confirmGame({ variables: { gameId, note: updatedNote } })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowUpdate(true)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Update
            </button>
            <button
              onClick={() =>
                cancelGame({ variables: { gameId, note: updatedNote } })
              }
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        )}

        {isCreator && game.status === "CONFIRMED" && (
          <div className="space-x-4 mb-6">
            <button
              onClick={() => setShowComplete(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Complete
            </button>
            <button
              onClick={() =>
                cancelGame({ variables: { gameId, note: updatedNote } })
              }
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex space-x-4 mb-6">
          <div>👍 {yesVoters.length}</div>
          <div>❌ {noVoters.length}</div>
        </div>

        <VotersList yesVoters={yesVoters} noVoters={noVoters} />
      </div>

      {/* ─── RIGHT COLUMN: Formation or Feedback ───────────────────────── */}
      <div>
        {game.status === "CONFIRMED" && !formation && !isCreator && (
          <p className="italic dark:text-white">
            The formation will appear here once the creator sets it up.
          </p>
        )}

        {game.status === "CONFIRMED" && (formation || isCreator) && (
          <FormationSection
            game={game}
            formation={formation}
            isCreator={isCreator}
            setFormation={setFormation}
            refetchFormation={refetchFormation}
          />
        )}

        {game.status === "COMPLETED" && (
          <>
            {showThankYou ? (
              <div className="p-4 bg-green-100 dark:bg-green-800 rounded text-center">
                Thank you for your feedback!
              </div>
            ) : !feedbackGiven ? (
              <GameFeedback
                gameId={gameId}
                isDarkMode={isDarkMode}
                onFeedback={handleFeedback}
              />
            ) : (
              <GameFeedbackList gameId={gameId} isDarkMode={isDarkMode} />
            )}
          </>
        )}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────── */}
      {isCreator && showUpdate && (
        <GameUpdate
          gameId={gameId}
          initialDate={game.date}
          initialTime={game.time}
          initialVenue={game.venue}
          initialNotes={game.notes}
          initialOpponent={game.opponent}
          isDarkMode={isDarkMode}
          onClose={() => setShowUpdate(false)}
        />
      )}
      {isCreator && showComplete && (
        <GameComplete
          gameId={gameId}
          note={updatedNote}
          isDarkMode={isDarkMode}
          onComplete={(score, result) =>
            completeGame({
              variables: { gameId, score, result, note: updatedNote },
            })
          }
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  );
}

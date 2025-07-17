// src/components/GameDetails.jsx
import {
  useState,
  useEffect,
  useContext,
  useRef,
  startTransition,
} from "react";
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

function RightColumn({
  game,
  formation,
  isCreator,
  showThankYou,
  feedbackGiven,
  startTransition,
  refetchGame,
  setFormation,
  gameId,
  isDarkMode,
  handleFeedback,
}) {
  // Only show for CONFIRMED games
  if (game.status === "COMPLETED") {
    return (
      <div className="rounded-2xl shadow-xl bg-gradient-to-br p-6 mb-4 border-2 transition-all duration-300
        dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 dark:border-gray-700 dark:text-blue-100
        from-green-50 via-blue-50 to-yellow-50 border-blue-200 text-blue-900">
        {showThankYou ? (
          <div className="p-4 bg-green-300 dark:bg-green-800 rounded text-center italic font-semibold">
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
      </div>
    );
  }

  if (game.status === "CONFIRMED") {
    return (
      <div className="rounded-2xl shadow-xl bg-gradient-to-br p-6 mb-4 border-2 transition-all duration-300
        dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 dark:border-gray-700 dark:text-blue-100
        from-green-50 via-blue-50 to-yellow-50 border-blue-200 text-blue-900">
        {!formation && !isCreator && (
          <div className="italic dark:text-white text-sm bg-yellow-100 dark:bg-gray-700 p-4 rounded shadow">
            The formation will appear here once the creator sets it up.
          </div>
        )}
        {(formation || isCreator) && (
          <>
            <div className="mb-4 text-lg font-bold text-center">
              {isCreator ? "Manage Game Formation" : "Game Formation"}
            </div>
            <FormationSection
              game={game}
              formation={formation}
              isCreator={isCreator}
              setFormation={setFormation}
              refetchFormation={() => startTransition(refetchGame)}
            />
          </>
        )}
      </div>
    );
  }
  return null;
}

export default function GameDetails({ gameId }) {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const userId = Auth.getProfile()?.data?._id;

  /* ──────────────────────────────────────────────────────────── */
  /*  Local helpers                                               */
  /* ──────────────────────────────────────────────────────────── */
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  /* ─── GAME QUERY ───────────────────────────────────────────── */
  const {
    loading: loadingGame,
    error: gameError,
    data: gameData,
    refetch: refetchGame,
  } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
    pollInterval: 5_000,
  });

  /* ─── FORMATION QUERY ──────────────────────────────────────── */
  const [formation, setFormation] = useState(null);
  useQuery(QUERY_FORMATION, {
    variables: { gameId },
    skip: !gameId,
    fetchPolicy: "network-only",
    onCompleted: (d) => isMounted.current && setFormation(d?.formation ?? null),
  });

  /* ─── FORMATION SUBSCRIPTIONS ──────────────────────────────── */
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const created = data.data?.formationCreated;
      if (created && isMounted.current) setFormation(created);
    },
  });
  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const updated = data.data?.formationUpdated;
      if (updated && isMounted.current) setFormation(updated);
    },
  });
  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const deletedId = data.data?.formationDeleted;
      if (deletedId === gameId && isMounted.current) setFormation(null);
    },
  });

  /* ─── GAME MUTATIONS ───────────────────────────────────────── */
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

  /* ─── LOCAL UI STATE ───────────────────────────────────────── */
  const [currentVote, setCurrentVote] = useState(null);
  const [updatedNote, setUpdatedNote] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFormation, setShowFormation] = useState(false);

  /* sync misc states when game query resolves */
  useEffect(() => {
    if (loadingGame || !gameData?.game) return;

    const g = gameData.game;

    const r = g.responses.find((r) => r.user._id === userId);
    setCurrentVote(r ? r.isAvailable : null);

    setUpdatedNote(g.notes || "");

    setFeedbackGiven(g.feedbacks.some((f) => f.user._id === userId));
  }, [loadingGame, gameData, userId]);

  const handleFeedback = () => {
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3_000);
    setFeedbackGiven(true);
  };

  /* ─── LOADING / ERROR STATES ───────────────────────────────── */
  if (loadingGame) return <p className="text-center mt-4">Loading…</p>;
  if (gameError)
    return (
      <p className="text-center mt-4 text-red-600">
        Error loading game details.
      </p>
    );
  if (!gameData?.game)
    return <p className="text-center mt-4 text-red-600">Game not found.</p>;

  const game = gameData.game;
  const isCreator = game.creator._id === userId;

  /* ─── Human-friendly date/time ─────────────────────────────── */
  const humanDate = new Date(+game.date).toLocaleDateString();
  const [h, m] = game.time.split(":").map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  const humanTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

  /* voters list */
  const yesVoters = game.responses
    .filter((r) => r.isAvailable)
    .map((r) => r.user);
  const noVoters = game.responses
    .filter((r) => !r.isAvailable)
    .map((r) => r.user);

  /* ──────────────────────────────────────────────────────────── */
  /*  JSX                                                         */
  /* ──────────────────────────────────────────────────────────── */
  // Modern responsive button style
  const actionButtonClass =
    "px-5 py-2 rounded-full font-bold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm mx-1 mb-2 " +
    "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-900 active:scale-95 dark:from-gray-500 dark:via-gray-600 dark:to-gray-900 dark:text-white dark:hover:from-gray-600 dark:hover:to-gray-900  ";

  return (
    <div
      className={`max-w-3xl mx-auto p-4 sm:p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100"
          : "bg-gradient-to-br from-white via-blue-50 to-green-50 text-gray-900"
      }`}
    >
      {/* Main content swapper */}
      {!showFormation ? (
        <div>
          {/* Top: Game Formation/Game Feedback button */}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => navigate("/game-schedule")}
              className={actionButtonClass}
            >
              <span className="material-icons text-lg"></span>← Game List
            </button>
            <button
              onClick={() => setShowFormation(true)}
              className={actionButtonClass}
            >
              {game.status === "COMPLETED" ? "Show Feedback" : "Show Formation"}
            </button>
          </div>
          {/* INFO */}
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex flex-col gap-2 ${
              isDarkMode ? "bg-gray-700" : "bg-white/80"
            }`}
          >
            <h3 className="text-sm sm:text-lg font-bold flex flex-wrap gap-4 items-center tracking-tight">
              <span className="inline-block">
                <strong className="text-xs sm:text-base">Date:</strong> <span className="font-normal text-xs sm:text-base">{humanDate}</span>
              </span>
              <span className="inline-block">
                <strong className="text-xs sm:text-base">Time:</strong> <span className="font-normal text-xs sm:text-base">{humanTime}</span>
              </span>
            </h3>
            <p className="text-base sm:text-lg font-semibold flex flex-wrap gap-4 items-center text-gray-700 dark:text-gray-200">
              <span>
                <strong>Venue:</strong> <span className="font-normal text-base sm:text-lg">{game.venue}</span>
              </span>
              <span>
                <strong>Opponent:</strong> <span className="font-normal text-base sm:text-lg">{game.opponent}</span>
              </span>
            </p>
          </div>

          {/* NOTES */}
          <div
            className={`mb-6 p-4 rounded-xl shadow ${
              isDarkMode ? "bg-gray-700" : "bg-white/80"
            }`}
          >
            {isCreator ? (
              <textarea
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 transition"
                placeholder="Update note…"
              />
            ) : (
              <p className="text-base">
                <strong>Note:</strong>{" "}
                {game.notes || (
                  <span className="italic text-gray-400">No notes</span>
                )}
              </p>
            )}
          </div>

          {/* VOTING (PENDING only) */}
          {game.status === "PENDING" && (
            <div className="mb-6 flex flex-wrap gap-4">
              {currentVote === null ? (
                <>
                  <button
                    onClick={() =>
                      respondToGame({
                        variables: { input: { gameId, isAvailable: true } },
                      })
                    }
                    className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold shadow hover:bg-green-600 transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() =>
                      respondToGame({
                        variables: { input: { gameId, isAvailable: false } },
                      })
                    }
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold shadow hover:bg-red-600 transition"
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
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold shadow hover:bg-yellow-600 transition"
                  >
                    Change to {currentVote ? "No" : "Yes"}
                  </button>
                  <button
                    onClick={() => unvoteGame({ variables: { gameId } })}
                    className="px-6 py-2 bg-gray-400 text-white rounded-lg font-bold shadow hover:bg-gray-500 transition"
                  >
                    Unvote
                  </button>
                </>
              )}
            </div>
          )}

          {/* STATUS */}
          {game.status !== "PENDING" && (
            <div className="mb-4 flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`px-3 py-1 rounded-full font-bold shadow text-xs ${
                  game.status === "CONFIRMED"
                    ? "bg-green-200 text-green-800"
                    : game.status === "COMPLETED"
                    ? "bg-blue-200 text-blue-800"
                    : game.status === "CANCELLED"
                    ? "bg-red-200 text-red-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {game.status}
              </span>
            </div>
          )}

          {/* SCORE / RESULT (COMPLETED) */}
          {game.status === "COMPLETED" && (
            <div className="mb-6 p-4 rounded-xl shadow bg-gradient-to-r from-yellow-200 via-yellow-100 to-green-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700">
              <p className="mb-2 text-lg font-bold">
                <strong>Score:</strong>{" "}
                <span className="text-2xl">{game.score}</span>
              </p>
              <p className="mb-2 text-lg font-bold">
                <strong>Result:</strong>{" "}
                <span className="uppercase tracking-wide">
                  {game.result.replace("_", " ")}
                </span>
              </p>
              <p className="mt-2 p-2 rounded bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 font-semibold text-center">
                <strong>Avg Rating:</strong> {game.averageRating.toFixed(1)} /
                10
              </p>
            </div>
          )}

          {/* CREATOR ACTIONS */}
          {isCreator && (
            <div className="flex flex-wrap gap-4 mb-6">
              {/* PENDING or CANCELLED → Confirm */}
              {(game.status === "PENDING" || game.status === "CANCELLED") && (
                <button
                  onClick={() =>
                    confirmGame({ variables: { gameId, note: updatedNote } })
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition"
                >
                  Confirm
                </button>
              )}

              {/* PENDING specific actions */}
              {game.status === "PENDING" && (
                <>
                  <button
                    onClick={() => setShowUpdate(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() =>
                      cancelGame({ variables: { gameId, note: updatedNote } })
                    }
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold shadow hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* CONFIRMED specific actions */}
              {game.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() => setShowComplete(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold shadow hover:bg-purple-700 transition"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() =>
                      cancelGame({ variables: { gameId, note: updatedNote } })
                    }
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold shadow hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}

          {/* Voters */}
          <div className="flex flex-wrap gap-4 mb-6 text-base font-medium">
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full flex items-center gap-1">
              👍 {yesVoters.length} Available
            </span>
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full flex items-center gap-1">
              ❌ {noVoters.length} Not Available
            </span>
          </div>
          <div className="mb-6">
            <VotersList yesVoters={yesVoters} noVoters={noVoters} />
          </div>
        </div>
      ) : (
        <div>
          {/* Only one button here, always 'Hide' with correct label */}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => navigate("/game-schedule")}
              className={actionButtonClass}
            >
              <span className="material-icons text-lg"></span>← Game List
            </button>
            <button
              onClick={() => setShowFormation(false)}
              className={actionButtonClass}
            >
              {game.status === "COMPLETED" ? "Hide Feedback" : "Hide Formation"}
            </button>
          </div>
          <div>
            {/* Show message if game is pending, else show RightColumn */}
            {game.status === "PENDING" ? (
              <div
                className={`p-6 rounded-xl shadow text-center text-lg font-medium italic ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-white/80 text-gray-800"
                }`}
              >
                The formation will be displayed here once the game is confirmed.
                Please cast your vote and stay tuned. Thank you!
              </div>
            ) : (
              <RightColumn
                game={game}
                formation={formation}
                isCreator={isCreator}
                showThankYou={showThankYou}
                feedbackGiven={feedbackGiven}
                startTransition={startTransition}
                refetchGame={refetchGame}
                setFormation={setFormation}
                gameId={gameId}
                isDarkMode={isDarkMode}
                handleFeedback={handleFeedback}
                showFormation={true}
                setShowFormation={setShowFormation}
              />
            )}
          </div>
        </div>
      )}

      {/* ───────────────── MODALS ─────────────────────────────── */}
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

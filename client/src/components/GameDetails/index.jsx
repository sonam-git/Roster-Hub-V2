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
import WeatherForecast from "../WeatherForecast";

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
      <div className={`rounded-3xl shadow-2xl p-8 mb-6 border-2 transition-all duration-500 transform hover:scale-[1.02] ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-800 via-purple-900 to-gray-900 border-purple-600 text-purple-100" 
          : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-300 text-purple-900"
      }`}>
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-center mb-6">Game Feedback</h3>
        {showThankYou ? (
          <div className="p-6 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl text-center shadow-lg">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-white font-bold text-lg">Thank you for your feedback!</p>
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
      <div className={`rounded-3xl shadow-2xl p-8 mb-6 border-2 transition-all duration-500 transform hover:scale-[1.02] ${
        isDarkMode 
          ? "bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 border-blue-600 text-blue-100" 
          : "bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 border-blue-300 text-blue-900"
      }`}>
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
            <span className="text-3xl">⚽</span>
          </div>
        </div>
        {!formation && !isCreator && (
          <div className={`p-6 rounded-2xl shadow-lg mb-6 text-center ${
            isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-yellow-100 text-yellow-800"
          }`}>
            <div className="text-3xl mb-3">⏳</div>
            <p className="font-semibold">Formation is being prepared...</p>
            <p className="text-sm mt-2 opacity-80">The formation will appear here once the creator sets it up.</p>
          </div>
        )}
        {(formation || isCreator) && (
          <>
            <h3 className="text-2xl font-bold text-center mb-8">
              {isCreator ? "⚙️ Manage Game Formation" : "🎯 Game Formation"}
            </h3>
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
  const [activeSection, setActiveSection] = useState("overview");

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

  // Function to render different sections based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Date & Time Card */}
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
              isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-blue-50 border border-blue-200"
            }`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-lg sm:text-xl text-white">📅</span>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Date & Time
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">📅</span>
                  <div>
                    <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>Date</p>
                    <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{humanDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">⏰</span>
                  <div>
                    <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>Time</p>
                    <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{humanTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
              isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-green-50 border border-green-200"
            }`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-lg sm:text-xl text-white">📍</span>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Location Details
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🏟️</span>
                  <div>
                    <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-green-300" : "text-green-600"}`}>Venue</p>
                    <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{game.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🏙️</span>
                  <div>
                    <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-green-300" : "text-green-600"}`}>City</p>
                    <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{game.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "weather":
        return (
          <WeatherForecast 
            date={game.date} 
            city={game.city} 
            isDarkMode={isDarkMode} 
          />
        );

      case "notes":
        return (
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-yellow-50 border border-yellow-200"
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">📝</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Game Notes
              </h3>
            </div>
            {isCreator ? (
              <textarea
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows={4}
                className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 focus:ring-4 focus:ring-blue-300 transition-all duration-300 resize-none text-sm sm:text-base ${
                  isDarkMode 
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
                placeholder="Add game notes or instructions for players..."
              />
            ) : (
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {game.notes || (
                    <span className="italic text-gray-400 flex items-center gap-2">
                      <span>💭</span> No notes available
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        );

      case "voting":
        return game.status === "PENDING" ? (
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-purple-50 border border-purple-200"
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">🗳️</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Your Response
              </h3>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {currentVote === null ? (
                <>
                  <button
                    onClick={() =>
                      respondToGame({
                        variables: { input: { gameId, isAvailable: true } },
                      })
                    }
                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">✅</span>
                    Available
                  </button>
                  <button
                    onClick={() =>
                      respondToGame({
                        variables: { input: { gameId, isAvailable: false } },
                      })
                    }
                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">❌</span>
                    Not Available
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
                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">🔄</span>
                    <span className="hidden sm:inline">Change to {currentVote ? "Not Available" : "Available"}</span>
                    <span className="sm:hidden">Change</span>
                  </button>
                  <button
                    onClick={() => unvoteGame({ variables: { gameId } })}
                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">🗑️</span>
                    <span className="hidden sm:inline">Remove Vote</span>
                    <span className="sm:hidden">Remove</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null;

      case "management":
        return isCreator ? (
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-indigo-50 border border-indigo-200"
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">⚙️</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Game Management
              </h3>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {(game.status === "PENDING" || game.status === "CANCELLED") && (
                <button
                  onClick={() =>
                    confirmGame({ variables: { gameId, note: updatedNote } })
                  }
                  className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">✅</span>
                  <span className="text-sm sm:text-base">Confirm Game</span>
                </button>
              )}
              {game.status === "PENDING" && (
                <>
                  <button
                    onClick={() => setShowUpdate(true)}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">✏️</span>
                    <span className="text-sm sm:text-base">Update Game</span>
                  </button>
                  <button
                    onClick={() =>
                      cancelGame({ variables: { gameId, note: updatedNote } })
                    }
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">❌</span>
                    <span className="text-sm sm:text-base">Cancel Game</span>
                  </button>
                </>
              )}
              {game.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() => setShowComplete(true)}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">🏁</span>
                    <span className="text-sm sm:text-base">Complete Game</span>
                  </button>
                  <button
                    onClick={() =>
                      cancelGame({ variables: { gameId, note: updatedNote } })
                    }
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">❌</span>
                    <span className="text-sm sm:text-base">Cancel Game</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null;

      case "responses":
        return (
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-teal-50 border border-teal-200"
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">👥</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Player Responses
              </h3>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mb-4 sm:mb-6">
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center gap-3 ${
                isDarkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
              }`}>
                <span className="text-xl sm:text-2xl">✅</span>
                <span className="font-bold text-sm sm:text-base">{yesVoters.length} Available</span>
              </div>
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center gap-3 ${
                isDarkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"
              }`}>
                <span className="text-xl sm:text-2xl">❌</span>
                <span className="font-bold text-sm sm:text-base">{noVoters.length} Not Available</span>
              </div>
            </div>
            <VotersList yesVoters={yesVoters} noVoters={noVoters} />
          </div>
        );

      case "results":
        return game.status === "COMPLETED" ? (
          <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-yellow-50 border border-yellow-200"
          }`}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🏆</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Game Results
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className={`p-4 sm:p-6 rounded-2xl text-center ${isDarkMode ? "bg-gray-800" : "bg-blue-100"}`}>
                <h4 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                  Final Score
                </h4>
                <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {game.score}
                </p>
              </div>
              <div className={`p-4 sm:p-6 rounded-2xl text-center ${isDarkMode ? "bg-gray-800" : "bg-green-100"}`}>
                <h4 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? "text-green-300" : "text-green-800"}`}>
                  Result
                </h4>
                <p className={`text-lg sm:text-xl font-bold uppercase tracking-wide ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {game.result.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl text-center ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}>
              <h4 className={`text-base sm:text-lg font-semibold mb-2 ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}>
                Average Rating
              </h4>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl">⭐</span>
                <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {game.averageRating.toFixed(1)}
                </span>
                <span className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>/10</span>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
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
  const statusBadgeClass = (status) => {
    const baseClass = "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg uppercase tracking-wide transition-all duration-300";
    switch (status) {
      case "CONFIRMED":
        return `${baseClass} bg-gradient-to-r from-green-400 to-green-600 text-white`;
      case "COMPLETED":
        return `${baseClass} bg-gradient-to-r from-blue-400 to-blue-600 text-white`;
      case "CANCELLED":
        return `${baseClass} bg-gradient-to-r from-red-400 to-red-600 text-white`;
      case "PENDING":
        return `${baseClass} bg-gradient-to-r from-yellow-400 to-orange-500 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-gray-400 to-gray-600 text-white`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-2 sm:p-4 transition-colors duration-300">
      <div className={`max-w-5xl mx-auto transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl shadow-gray-900/50"
          : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl shadow-blue-900/20"
      } rounded-2xl sm:rounded-3xl overflow-hidden`}>
        
        {/* Header Section */}
        <div className={`relative p-4 sm:p-6 md:p-8 ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900"
            : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
        }`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
              <button
                onClick={() => navigate("/game-schedule")}
                className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
                <span className="hidden sm:inline">Back to Games</span>
                <span className="sm:hidden">Back</span>
              </button>
              <button
                onClick={() => setShowFormation(!showFormation)}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">
                  {showFormation ? "📋" : game.status === "COMPLETED" ? "📊" : "⚽"}
                </span>
                <span className="hidden sm:inline">
                  {showFormation 
                    ? "Game Details" 
                    : game.status === "COMPLETED" ? "Feedback" : "Formation"
                  }
                </span>
                <span className="sm:hidden">
                  {showFormation ? "Details" : "More"}
                </span>
              </button>
            </div>
            
            {/* Game Title & Status */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm mb-2 sm:mb-3 md:mb-4">
                <span className="text-2xl sm:text-3xl md:text-4xl">⚽</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                vs {game.opponent}
              </h1>
              <div className="flex justify-center">
                <span className={statusBadgeClass(game.status) + " text-xs sm:text-sm"}>
                  {game.status}
                </span>
              </div>
              
              {/* Navigation Buttons */}
              <div className="mt-4 sm:mt-6">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveSection("overview")}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                      activeSection === "overview"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">📅</span>
                    <span className="hidden sm:inline">Date & Venue</span>
                    <span className="sm:hidden">Info</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection("weather")}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                      activeSection === "weather"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">🌤️</span>
                    <span className="hidden sm:inline">Weather</span>
                    <span className="sm:hidden">Weather</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection("notes")}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                      activeSection === "notes"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">📝</span>
                    <span className="hidden sm:inline">Game Notes</span>
                    <span className="sm:hidden">Notes</span>
                  </button>
                  
                  {game.status === "PENDING" && (
                    <button
                      onClick={() => setActiveSection("voting")}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                        activeSection === "voting"
                          ? "bg-white text-blue-600 shadow-lg"
                          : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="text-sm sm:text-base">🗳️</span>
                      <span className="hidden sm:inline">Vote</span>
                      <span className="sm:hidden">Vote</span>
                    </button>
                  )}
                  
                  {isCreator && (
                    <button
                      onClick={() => setActiveSection("management")}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                        activeSection === "management"
                          ? "bg-white text-blue-600 shadow-lg"
                          : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="text-sm sm:text-base">⚙️</span>
                      <span className="hidden sm:inline">Management</span>
                      <span className="sm:hidden">Manage</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setActiveSection("responses")}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                      activeSection === "responses"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">👥</span>
                    <span className="hidden sm:inline">Responses</span>
                    <span className="sm:hidden">Players</span>
                  </button>
                  
                  {game.status === "COMPLETED" && (
                    <button
                      onClick={() => setActiveSection("results")}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 ${
                        activeSection === "results"
                          ? "bg-white text-blue-600 shadow-lg"
                          : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="text-sm sm:text-base">🏆</span>
                      <span className="hidden sm:inline">Results</span>
                      <span className="sm:hidden">Results</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8">
          {!showFormation ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Render the active section */}
              {renderActiveSection()}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formation/Feedback View */}
              {game.status === "PENDING" ? (
                <div className={`p-12 rounded-3xl shadow-xl text-center transition-all duration-300 hover:shadow-2xl ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600"
                    : "bg-gradient-to-br from-white to-blue-50 border border-blue-200"
                }`}>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto flex items-center justify-center mb-6">
                    <span className="text-4xl">⏳</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Formation Coming Soon
                  </h3>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    The formation will be displayed here once the game is confirmed.
                    <br />
                    Please cast your vote and stay tuned. Thank you!
                  </p>
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
          )}
        </div>
      </div>

      {/* Modals */}
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

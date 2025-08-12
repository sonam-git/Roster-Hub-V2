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
  GAME_UPDATED_SUBSCRIPTION,
  GAME_CONFIRMED_SUBSCRIPTION,
  GAME_CANCELLED_SUBSCRIPTION,
  GAME_COMPLETED_SUBSCRIPTION,
} from "../../utils/subscription";

import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import { getGameEffectiveStatus } from "../../utils/gameExpiration";
import VotersList from "../VotersList";
import GameUpdate from "../GameUpdate";
import GameComplete from "../GameComplete";
import GameFeedback from "../GameFeedback";
import GameFeedbackList from "../GameFeedbackList";
import FormationSection from "../FormationSection";
import FormationCommentList from "../FormationCommentList";
import WeatherForecast from "../WeatherForecast";
import SketchImage from "../../assets/images/sketch-removebg.png";

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
    fetchPolicy: "cache-first", // Prefer cache to reduce flickering
    errorPolicy: "ignore", // Ignore network errors
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

  /* ─── GAME SUBSCRIPTIONS ───────────────────────────────────── */
  useSubscription(GAME_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updated = data.data?.gameUpdated;
      if (updated && updated._id === gameId && isMounted.current) {
        // Update game data in real-time
        startTransition(() => refetchGame());
      }
    },
  });

  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const confirmed = data.data?.gameConfirmed;
      if (confirmed && confirmed._id === gameId && isMounted.current) {
        startTransition(() => refetchGame());
      }
    },
  });

  useSubscription(GAME_CANCELLED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const cancelled = data.data?.gameCancelled;
      if (cancelled && cancelled._id === gameId && isMounted.current) {
        startTransition(() => refetchGame());
      }
    },
  });

  useSubscription(GAME_COMPLETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const completed = data.data?.gameCompleted;
      if (completed && completed._id === gameId && isMounted.current) {
        startTransition(() => refetchGame());
      }
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReconfirm, setShowReconfirm] = useState(false);
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
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
            isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-blue-50 border border-blue-200"
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">🌤️</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Weather Forecast
              </h3>
            </div>
            <WeatherForecast 
              date={game.date} 
              city={game.city} 
              isDarkMode={isDarkMode} 
            />
          </div>
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
              {game.status === "PENDING" && (
                <>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">✅</span>
                    <span className="text-sm sm:text-base">Confirm Game</span>
                  </button>
                  <button
                    onClick={() => setShowUpdate(true)}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">✏️</span>
                    <span className="text-sm sm:text-base">Update Game</span>
                  </button>
                  <button
                    onClick={() => setShowCancel(true)}
                    className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                  >
                    <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">❌</span>
                    <span className="text-sm sm:text-base">Cancel Game</span>
                  </button>
                </>
              )}
              {game.status === "CANCELLED" && (
                <button
                  onClick={() => setShowReconfirm(true)}
                  className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-3"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">🔄</span>
                  <span className="text-sm sm:text-base">Re-confirm Game</span>
                </button>
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
                    onClick={() => setShowCancel(true)}
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
            {/* Section Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                <span className="text-lg sm:text-xl text-white">👥</span>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Vote & Player Responses
              </h3>
            </div>
            
            {/* Voting Buttons - Only show for PENDING games */}
            {game.status === "PENDING" && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🗳️</span>
                  <h4 className={`text-base sm:text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Your Response
                  </h4>
                </div>
                {/* Large screen: one row, Small screen: 2x2 grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentVote === null ? (
                    <>
                      <button
                        onClick={() =>
                          respondToGame({
                            variables: { input: { gameId, isAvailable: true } },
                          })
                        }
                        className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300">✅</span>
                        <span className="text-xs sm:text-sm">Available</span>
                      </button>
                      <button
                        onClick={() =>
                          respondToGame({
                            variables: { input: { gameId, isAvailable: false } },
                          })
                        }
                        className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300">❌</span>
                        <span className="text-xs sm:text-sm">Not Available</span>
                      </button>
                      {/* Response Summary Counts */}
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                        isDarkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
                      }`}>
                        <span className="text-sm sm:text-base">✅</span>
                        <span className="font-medium text-xs sm:text-sm">{yesVoters.length} Available</span>
                      </div>
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                        isDarkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"
                      }`}>
                        <span className="text-sm sm:text-base">❌</span>
                        <span className="font-medium text-xs sm:text-sm">{noVoters.length} Not Available</span>
                      </div>
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
                        className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300">🔄</span>
                        <span className="text-xs sm:text-sm lg:hidden">Change</span>
                        <span className="hidden lg:inline text-xs sm:text-sm">Change to {currentVote ? "Not Available" : "Available"}</span>
                      </button>
                      <button
                        onClick={() => unvoteGame({ variables: { gameId } })}
                        className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300">🗑️</span>
                        <span className="text-xs sm:text-sm">Remove</span>
                      </button>
                      {/* Response Summary Counts */}
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                        isDarkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
                      }`}>
                        <span className="text-sm sm:text-base">✅</span>
                        <span className="font-medium text-xs sm:text-sm">{yesVoters.length} Available</span>
                      </div>
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                        isDarkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"
                      }`}>
                        <span className="text-sm sm:text-base">❌</span>
                        <span className="font-medium text-xs sm:text-sm">{noVoters.length} Not Available</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Player Response Summary - Only show if game is not PENDING */}
            {game.status !== "PENDING" && (
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📊</span>
                  <h4 className={`text-base sm:text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Response Summary
                  </h4>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
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
              </div>
            )}
            
            {/* Player Lists */}
            <VotersList yesVoters={yesVoters} noVoters={noVoters} />
          </div>
        );

      case "results":
        return game.status === "COMPLETED" ? (
          (() => {
            // Calculate Player of the Match (most selected player)
            const calculatePlayerOfTheMatch = () => {
              const feedbacks = game?.feedbacks || [];
              if (!feedbacks.length) return null;
              
              const playerVotes = {};
              feedbacks.forEach(feedback => {
                if (feedback.playerOfTheMatch) {
                  const playerId = feedback.playerOfTheMatch._id;
                  const playerName = feedback.playerOfTheMatch.name;
                  if (playerVotes[playerId]) {
                    playerVotes[playerId].votes++;
                  } else {
                    playerVotes[playerId] = {
                      id: playerId,
                      name: playerName,
                      votes: 1
                    };
                  }
                }
              });
              
              // Find the player with most votes
              const players = Object.values(playerVotes);
              if (players.length === 0) return null;
              
              return players.reduce((max, player) => 
                player.votes > max.votes ? player : max
              );
            };

            const playerOfTheMatch = calculatePlayerOfTheMatch();

            return (
          <div className={`relative overflow-hidden p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl transform hover:scale-[1.01] ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-600" 
              : "bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-200"
          }`}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-3xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 blur-2xl"></div>
            </div>

            {/* Header Section */}
            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-4xl animate-bounce">🏆</span>
              </div>
              <h3 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                isDarkMode 
                  ? "from-yellow-400 to-orange-400 bg-clip-text text-transparent" 
                  : "from-yellow-600 to-orange-600 bg-clip-text text-transparent"
              }`}>
                Game Results
              </h3>
              <div className={`w-24 h-1 rounded-full mx-auto bg-gradient-to-r from-yellow-400 to-orange-500`}></div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Final Score Card */}
              <div className={`group relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDarkMode 
                  ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30" 
                  : "bg-gradient-to-br from-blue-100/80 to-blue-200/80 border border-blue-300/50"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">⚽</span>
                    </div>
                    <h4 className={`text-xl font-bold ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                      Final Score
                    </h4>
                  </div>
                  <p className={`text-4xl font-black mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {game.score}
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto"></div>
                </div>
              </div>

              {/* Result Card */}
              <div className={`group relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDarkMode 
                  ? "bg-gradient-to-br from-green-900/30 to-emerald-800/30 border border-green-500/30" 
                  : "bg-gradient-to-br from-green-100/80 to-emerald-200/80 border border-green-300/50"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className={`text-xl font-bold ${isDarkMode ? "text-green-300" : "text-green-800"}`}>
                      Result
                    </h4>
                  </div>
                  <p className={`text-2xl font-black uppercase tracking-wider mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {game.result.replace("_", " ")}
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
                </div>
              </div>
            </div>

            {/* Player of the Match and Average Rating - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player of the Match Card */}
              {playerOfTheMatch ? (
                <div className={`group relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isDarkMode 
                    ? "bg-gradient-to-br from-yellow-900/30 to-amber-800/30 border border-yellow-500/30" 
                    : "bg-gradient-to-br from-yellow-100/80 to-amber-200/80 border border-yellow-300/50"
                }`}>
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-3 left-8 w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">⭐</span>
                        </div>
                      </div>
                      <h4 className={`text-xl font-bold ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}>
                        Player of the Match
                      </h4>
                    </div>
                    
                    <p className={`text-2xl font-black mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {playerOfTheMatch.name}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                      isDarkMode 
                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30" 
                        : "bg-yellow-200/80 text-yellow-800 border border-yellow-400/40"
                    }`}>
                      <span className="text-base">🗳️</span>
                      <span className="font-bold">
                        {playerOfTheMatch.votes} vote{playerOfTheMatch.votes !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mt-3"></div>
                  </div>
                </div>
              ) : (
                <div className={`group relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm border-2 border-dashed ${
                  isDarkMode 
                    ? "border-gray-600 bg-gray-800/30 text-gray-400" 
                    : "border-gray-300 bg-gray-100/50 text-gray-500"
                }`}>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl opacity-50">🏆</span>
                    </div>
                    <h4 className="text-xl font-bold mb-2">Player of the Match</h4>
                    <p className="text-sm italic">No votes cast yet</p>
                  </div>
                </div>
              )}

              {/* Average Rating Card */}
              <div className={`group relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDarkMode 
                  ? "bg-gradient-to-br from-purple-900/30 to-pink-800/30 border border-purple-500/30" 
                  : "bg-gradient-to-br from-purple-100/80 to-pink-200/80 border border-purple-300/50"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h4 className={`text-xl font-bold ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}>
                      Average Rating
                    </h4>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(Math.floor(game.averageRating / 2))].map((_, i) => (
                      <span key={i} className="text-xl animate-pulse" style={{animationDelay: `${i * 0.1}s`}}>⭐</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {game.averageRating.toFixed(1)}
                    </span>
                    <span className={`text-2xl font-bold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>/10</span>
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-3"></div>
                </div>
              </div>
            </div>
          </div>
            );
          })()
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
  const effectiveStatus = getGameEffectiveStatus(game);
  
  // Debug logging to verify expiration logic
  console.log('🎮 GameDetails Debug:', {
    gameId: game._id,
    originalStatus: game.status,
    effectiveStatus: effectiveStatus,
    gameDate: game.date,
    isExpired: effectiveStatus === 'EXPIRED'
  });
  
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
      case "EXPIRED":
        return `${baseClass} bg-gradient-to-r from-gray-500 to-gray-700 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-gray-400 to-gray-600 text-white`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-1 sm:p-2 lg:p-4 transition-colors duration-300"> 
      <div className={`max-w-7xl mx-auto transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl shadow-gray-900/50"
          : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl shadow-blue-900/20"
      } rounded-2xl sm:rounded-3xl overflow-hidden`}>
        
        {/* Header Section - Full Width */}
        <div className={`relative px-1 sm:px-2 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8 ${
          isDarkMode
            ? "bg-gradient-to-r from-green-900 via-teal-900 to-blue-900"
            : "bg-gradient-to-r from-green-600 via-teal-600 to-blue-600"
        }`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-1">
            {/* Modern Three-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 mb-6 sm:mb-8 md:mb-10">
              
              {/* Left Column - Enhanced Game Info & Status */}
              <div className="flex flex-col justify-start mt-4 space-y-4 sm:space-y-5">
                {/* Game Header with Enhanced Styling */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                      <span className="text-lg sm:text-xl">⚽</span>
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg">
                        Football Match
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">
                        Game Details
                      </p>
                    </div>
                  </div>
                  
                  {/* Opponent Section */}
                  <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                    <p className="text-xs sm:text-sm text-white/90 mb-2 font-semibold tracking-wide">
                      Playing Against
                    </p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                      {game.opponent}
                    </h1>
                  </div>
                </div>
                
                {/* Status Badge Section */}
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
                      <span className="text-lg sm:text-xl">📊</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/90 font-semibold">Current Status</p>
                    </div>
                  </div>
                  <span className={`${statusBadgeClass(effectiveStatus)} text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 inline-block w-full text-center`}>
                    {effectiveStatus === 'PENDING' && (
                      <>
                        <span className="hidden sm:inline">⏳ PENDING</span>
                        <span className="sm:hidden">⏳ PENDING</span>
                      </>
                    )}
                    {effectiveStatus === 'CONFIRMED' && (
                      <>
                        <span className="hidden sm:inline">✅ CONFIRMED</span>
                        <span className="sm:hidden">✅ LIVE</span>
                      </>
                    )}
                    {effectiveStatus === 'COMPLETED' && (
                      <>
                        <span className="hidden sm:inline">🏆 COMPLETED</span>
                        <span className="sm:hidden">🏆 DONE</span>
                      </>
                    )}
                    {effectiveStatus === 'CANCELLED' && (
                      <>
                        <span className="hidden sm:inline">❌ CANCELLED</span>
                        <span className="sm:hidden">❌ CANCELLED</span>
                      </>
                    )}
                    {effectiveStatus === 'EXPIRED' && (
                      <>
                        <span className="hidden sm:inline">⏰ EXPIRED</span>
                        <span className="sm:hidden">⏰ EXPIRED</span>
                      </>
                    )}
                    {!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(effectiveStatus) && effectiveStatus}
                  </span>
                </div>
              </div>

              {/* Middle Column - Sketch Image with Enhanced Animation */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Enhanced Multi-Layer Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 via-orange-500/40 to-red-500/40 rounded-full blur-3xl scale-150 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 rounded-full blur-2xl scale-125 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-xl scale-110 animate-pulse" style={{ animationDelay: '2s' }}></div>
                  
                  {/* Floating Animation Container with Enhanced Effects */}
                  <div className="relative transform hover:scale-110 transition-all duration-700 ease-out">
                    <img 
                      src={SketchImage} 
                      alt="Football Game Illustration" 
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-60 xl:h-60 object-contain filter drop-shadow-2xl animate-float"
                      style={{
                        animation: 'float 6s ease-in-out infinite'
                      }}
                    />
                  </div>
                  
                  {/* Enhanced Decorative Elements with Better Positioning */}
                  <div className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping shadow-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-ping shadow-xl" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -left-5 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-ping shadow-xl" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/4 -right-3 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping shadow-xl" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-1/4 -right-5 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-ping shadow-xl" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>

              {/* Right Column - Game Notice & Guidelines */}
              <div className="flex flex-col justify-start mt-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 via-teal-500 to-emerald-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                    <span className="text-lg sm:text-xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg">
                      Game Guidelines
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                      Important reminders
                    </p>
                  </div>
                </div>

                {/* Guidelines List */}
                <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/30 space-y-3 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-xs text-white">ℹ️</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                      <span className="font-semibold text-blue-200">Be informed</span> about time, venue, and opponent
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-xs text-white">💧</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                      <span className="font-semibold text-cyan-200">Stay hydrated</span> before and during the game
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-xs text-white">⏰</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                      <span className="font-semibold text-yellow-200">Arrive 30 minutes</span> before kick-off
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-xs text-white">🏃</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                      <span className="font-semibold text-orange-200">Team warm-up</span> before kick-off
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <span className="text-xs text-white">🎯</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                      <span className="font-semibold text-purple-200">Know the game plan</span> and formation
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-green-500/30 via-teal-500/25 to-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-green-400/40 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✨</span>
                    <p className="text-xs font-bold text-green-100">Good Luck!</p>
                  </div>
                  <p className="text-xs text-green-50/90 leading-relaxed">
                    Play with passion, respect your teammates and opponents
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Navigation Row - All Buttons Always Visible */}
            <div className="mt-4 sm:mt-6 md:mt-8 z-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 sm:p-3 md:p-4 shadow-2xl border border-white/20">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                  {/* Back to Games Button */}
                  <button
                    onClick={() => navigate("/game-schedule")}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-sm sm:text-base">🏠</span>
                    <span>Games</span>
                  </button>

                  {/* Formation/Feedback Toggle Button */}
                  <button
                    onClick={() => setShowFormation(!showFormation)}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      showFormation
                        ? "bg-white text-blue-600 shadow-white/20"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">
                      {showFormation ? "📋" : game.status === "COMPLETED" ? "📊" : "⚽"}
                    </span>
                    <span>
                      {showFormation 
                        ? "Details" 
                        : game.status === "COMPLETED" ? "Feedback" : "Formation"
                      }
                    </span>
                  </button>
                  
                  {/* Overview/Date & Venue Button - Always visible */}
                  <button
                    onClick={() => { 
                      if (showFormation) setShowFormation(false);
                      setActiveSection("overview");
                    }}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      !showFormation && activeSection === "overview"
                        ? "bg-white text-blue-600 shadow-white/20"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">📅</span>
                    <span className="hidden sm:inline">Date & Venue</span>
                    <span className="sm:hidden">Info</span>
                  </button>
                  
                  {/* Weather Button - Always visible */}
                  <button
                    onClick={() => { 
                      if (showFormation) setShowFormation(false);
                      setActiveSection("weather");
                    }}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      !showFormation && activeSection === "weather"
                        ? "bg-white text-blue-600 shadow-white/20"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">🌤️</span>
                    <span className="hidden sm:inline">Weather</span>
                    <span className="sm:hidden">Weather</span>
                  </button>
                  
                  {/* Game Notes Button - Always visible */}
                  <button
                    onClick={() => { 
                      if (showFormation) setShowFormation(false);
                      setActiveSection("notes");
                    }}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      !showFormation && activeSection === "notes"
                        ? "bg-white text-blue-600 shadow-white/20"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">📝</span>
                    <span className="hidden sm:inline">Game Notes</span>
                    <span className="sm:hidden">Notes</span>
                  </button>
                  
                  {/* Management Button - Always visible if user is creator */}
                  {isCreator && (game.status === "PENDING" || game.status === "CONFIRMED" || game.status === "CANCELLED") && (
                    <button
                      onClick={() => { 
                        if (showFormation) setShowFormation(false);
                        setActiveSection("management");
                      }}
                      className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                        !showFormation && activeSection === "management"
                          ? "bg-white text-blue-600 shadow-white/20"
                          : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                      }`}
                    >
                      <span className="text-sm sm:text-base">⚙️</span>
                      <span className="hidden sm:inline">Management</span>
                      <span className="sm:hidden">Manage</span>
                    </button>
                  )}
                  
                  {/* Player Responses Button - Always visible */}
                  <button
                    onClick={() => { 
                      if (showFormation) setShowFormation(false);
                      setActiveSection("responses");
                    }}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      !showFormation && activeSection === "responses"
                        ? "bg-white text-blue-600 shadow-white/20"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}
                  >
                    <span className="text-sm sm:text-base">👥</span>
                    <span className="hidden sm:inline">Vote & Responses</span>
                    <span className="sm:hidden">Players</span>
                  </button>
                  
                  {/* Game Results Button - Always visible if game is completed */}
                  {game.status === "COMPLETED" && (
                    <button
                      onClick={() => { 
                        if (showFormation) setShowFormation(false);
                        setActiveSection("results");
                      }}
                      className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl ${
                        !showFormation && activeSection === "results"
                          ? "bg-white text-blue-600 shadow-white/20"
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
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Formation Board Column */}
                  <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                    isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-blue-50 border border-blue-200"
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                        <span className="text-lg sm:text-xl text-white">⚽</span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {game.status === "COMPLETED" ? "Game Feedback" : "Game Formation"}
                      </h3>
                    </div>
                    
                    {game.status === "COMPLETED" ? (
                      <div>
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
                    ) : (
                      <div>
                        {!formation && !isCreator ? (
                          <div className={`p-6 rounded-2xl shadow-lg text-center ${
                            isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            <div className="text-3xl mb-3">⏳</div>
                            <p className="font-semibold">Formation is being prepared...</p>
                            <p className="text-sm mt-2 opacity-80">The formation will appear here once the creator sets it up.</p>
                          </div>
                        ) : (
                          <div className="transform scale-90 origin-top w-full">
                            <FormationSection
                              game={game}
                              formation={formation}
                              isCreator={isCreator}
                              setFormation={setFormation}
                              refetchFormation={() => startTransition(refetchGame)}
                              isLoading={loadingGame}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Formation Comments Column */}
                  <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                    isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600" : "bg-gradient-to-br from-white to-green-50 border border-green-200"
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-lg sm:text-xl text-white">💬</span>
                      </div>
                      <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {game.status === "COMPLETED" ? "Game Feedback Discussion" : "Formation Comments"}
                      </h3>
                    </div>
                    
                    {game.status === "COMPLETED" ? (
                      (() => {
                        // Calculate Player of the Match (most selected player)
                        const calculatePlayerOfTheMatch = () => {
                          const feedbacks = game?.feedbacks || [];
                          if (!feedbacks.length) return null;
                          
                          const playerVotes = {};
                          feedbacks.forEach(feedback => {
                            if (feedback.playerOfTheMatch) {
                              const playerId = feedback.playerOfTheMatch._id;
                              const playerName = feedback.playerOfTheMatch.name;
                              const playerProfilePic = feedback.playerOfTheMatch.profilePic;
                              if (playerVotes[playerId]) {
                                playerVotes[playerId].votes++;
                              } else {
                                playerVotes[playerId] = {
                                  id: playerId,
                                  name: playerName,
                                  profilePic: playerProfilePic,
                                  votes: 1
                                };
                              }
                            }
                          });
                          
                          // Find the player with most votes
                          const players = Object.values(playerVotes);
                          if (players.length === 0) return null;
                          
                          return players.reduce((max, player) => 
                            player.votes > max.votes ? player : max
                          );
                        };

                        const playerOfTheMatch = calculatePlayerOfTheMatch();

                        return (
                      <div className="space-y-4">
                                                         {/* Player of the Match Award Display */}
                          {playerOfTheMatch && (
                            <div className={`mb-6 p-6 rounded-3xl border-2 relative overflow-hidden ${
                              isDarkMode 
                                ? "bg-gradient-to-br from-yellow-900/30 via-amber-900/40 to-orange-900/30 border-yellow-500/50" 
                                : "bg-gradient-to-br from-yellow-50/90 via-amber-50/90 to-orange-50/90 border-yellow-400/60"
                            }`}>
                              {/* Sparkle effects */}
                              <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
                                <div className="absolute bottom-3 left-8 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                <div className="absolute bottom-2 right-4 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                                <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
                                <div className="absolute top-1/4 right-3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
                              </div>

                              {/* Award Ribbon */}
                              <div className="absolute -top-1 -right-1 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 transform rotate-12 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold transform -rotate-12">WINNER</span>
                              </div>

                              <div className="relative text-center">
                                {/* Title */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                      <span className="text-sm">🏆</span>
                                    </div>
                                    <h4 className={`text-lg font-bold ${
                                      isDarkMode ? "text-yellow-300" : "text-yellow-800"
                                    }`}>
                                      Player of the Match
                                    </h4>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                      <span className="text-sm">⭐</span>
                                    </div>
                                  </div>
                                  <div className="w-24 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto"></div>
                                </div>

                                {/* Player Image and Info */}
                                <div className="flex flex-col items-center space-y-3">
                                  {/* Profile Image with Trophy Frame */}
                                  <div className="relative">
                                    {/* Outer glow ring */}
                                    <div className="absolute inset-0 w-18 h-18 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse blur-sm"></div>
                                    
                                    {/* Trophy frame */}
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-0.5 shadow-2xl">
                                      <div className="w-full h-full rounded-full bg-white p-0.5 shadow-inner">
                                        <img
                                          src={playerOfTheMatch.profilePic || SketchImage}
                                          alt={playerOfTheMatch.name}
                                          className="w-full h-full rounded-full object-cover shadow-lg"
                                          onError={(e) => {
                                            e.target.src = SketchImage;
                                          }}
                                        />
                                      </div>
                                    </div>

                                    {/* Crown */}
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                      <span className="text-xs">👑</span>
                                    </div>
                                  </div>

                                  {/* Player Details */}
                                  <div className="space-y-1">
                                    <h3 className={`text-xl font-black ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                      {playerOfTheMatch.name}
                                    </h3>
                                    
                                    {/* Vote Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                      isDarkMode 
                                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30" 
                                        : "bg-yellow-200/80 text-yellow-800 border border-yellow-400/40"
                                    }`}>
                                      <span className="text-sm">🗳️</span>
                                      <span className="font-bold">
                                        {playerOfTheMatch.votes} vote{playerOfTheMatch.votes !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Award Message */}
                                  <div className={`mt-2 p-2 rounded-lg text-xs ${
                                    isDarkMode 
                                      ? "bg-gradient-to-r from-yellow-900/30 to-amber-900/30 text-yellow-200" 
                                      : "bg-gradient-to-r from-yellow-100/80 to-amber-100/80 text-yellow-800"
                                  }`}>
                                    <p className="font-medium italic">
                                      🎉 Outstanding performance! 🎉
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                                    {/* No Player of the Match fallback */}
                          {!playerOfTheMatch && (
                            <div className={`p-3 rounded-lg mb-3 border-2 border-dashed ${
                              isDarkMode 
                                ? "bg-gray-800/50 border-gray-600 text-gray-400" 
                                : "bg-gray-100/50 border-gray-300 text-gray-500"
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold ${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>
                                  Player Of The Match:
                                </span>
                                <span className="text-sm italic">No votes cast yet</span>
                              </div>
                            </div>
                          )}
                        {/* Game Results Summary */}
                        <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                          <div className="text-center mb-4">
                            <span className="text-3xl mb-2 block">🏆</span>
                            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                              Match Results
                            </h4>
                          </div>
                          
                          {/* Final Score */}
                          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                                Final Score:
                              </span>
                              <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                {game.score}
                              </span>
                            </div>
                          </div>
                          
                          {/* Match Result */}
                          <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isDarkMode ? "text-green-300" : "text-green-600"}`}>
                                Result:
                              </span>
                              <span className={`text-lg font-bold uppercase tracking-wide ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                {game.result.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          
                          {/* Average Rating */}
                          <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>
                                Team Rating:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">⭐</span>
                                <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                  {game.averageRating.toFixed(1)}/10
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Feedback Statistics */}
                          <div className={`p-3 rounded-lg border-t-2 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                            <h5 className={`font-semibold mb-2 ${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>
                              📝 Player Feedback Summary
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                                  Total Ratings Given:
                                </span>
                                <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                  {game.feedbacks.length}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                                  Comments Received:
                                </span>
                                <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                  {game.feedbacks.filter(f => f.comment && f.comment.trim().length > 0).length}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                                  Participation Rate:
                                </span>
                                <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                  {Math.round((game.feedbacks.length / (yesVoters.length || 1)) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                        </div>

                        {/* Feedback Encouragement */}
                        {!feedbackGiven && (
                          <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-blue-900/50" : "bg-blue-50"}`}>
                            <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                              💭 Share your thoughts about this match in the feedback section above!
                            </p>
                          </div>
                        )}
                      </div>
                        );
                      })()
                    ) : (
                      <div className="h-full">
                        <FormationCommentList gameId={gameId} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {isCreator && showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl transform transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-white border border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Confirm Game
                </h3>
              </div>
              
              <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Add a confirmation note for the players about the game details:
              </p>
              
              <textarea
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows={4}
                className={`w-full p-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-300 transition-all duration-300 resize-none ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
                placeholder="Add any important information about the confirmed game (meeting point, equipment needed, etc.)..."
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    confirmGame({ variables: { gameId, note: updatedNote } });
                    setShowConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Confirm Game
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreator && showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl transform transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-white border border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Cancel Game
                </h3>
              </div>
              
              <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Please provide a reason for canceling this game:
              </p>
              
              <textarea
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows={4}
                className={`w-full p-3 rounded-xl border-2 focus:ring-4 focus:ring-red-300 transition-all duration-300 resize-none ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
                placeholder="Explain the reason for cancellation (weather, venue issues, etc.)..."
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    cancelGame({ variables: { gameId, note: updatedNote } });
                    setShowCancel(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel Game
                </button>
                <button
                  onClick={() => setShowCancel(false)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Keep Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {isCreator && showReconfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`max-w-lg w-full rounded-2xl shadow-2xl transform transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-white border border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Re-confirm Game
                </h3>
              </div>
              
              <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Explain the reason for re-confirming this previously cancelled game:
              </p>
              
              <textarea
                value={updatedNote}
                onChange={(e) => setUpdatedNote(e.target.value)}
                rows={4}
                className={`w-full p-3 rounded-xl border-2 focus:ring-4 focus:ring-emerald-300 transition-all duration-300 resize-none ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
                placeholder="Explain why the game is being re-confirmed (issue resolved, new date confirmed, etc.)..."
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    confirmGame({ variables: { gameId, note: updatedNote } });
                    setShowReconfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                >
                  Re-confirm Game
                </button>
                <button
                  onClick={() => setShowReconfirm(false)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

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
  // COMPLETE_GAME, // Handled by GameComplete component
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
import { useOrganization } from "../../contexts/OrganizationContext";
import { getGameEffectiveStatus } from "../../utils/gameExpiration";
import VotersList from "../VotersList";
import GameComplete from "../GameComplete";
import GameFeedback from "../GameFeedback";
import GameFeedbackList from "../GameFeedbackList";
import FormationSection from "../FormationSection";
import FormationCommentList from "../FormationCommentList";
import FormationLikeButton from "../FormationLikeButton";
import AvailablePlayersList from "../AvailablePlayersList";
import WeatherForecast from "../WeatherForecast";
import SketchImage from "../../assets/images/sketch-removebg.png";

function RightColumn({
  game,
  formation,
  isCreator,
  startTransition,
  refetchGame,
  setFormation,
  isDarkMode,
}) {
  // Only show formation content for CONFIRMED games
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
  const { currentOrganization } = useOrganization();
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
    variables: { 
      gameId,
      organizationId: currentOrganization?._id 
    },
    skip: !gameId || !currentOrganization,
    fetchPolicy: "cache-first", // Prefer cache to reduce flickering
    errorPolicy: "ignore", // Ignore network errors
  });
  
  // Refetch game when organization changes
  useEffect(() => {
    if (currentOrganization && gameId) {
      refetchGame({ 
        gameId,
        organizationId: currentOrganization._id 
      });
    }
  }, [currentOrganization, gameId, refetchGame]);

  /* ─── FORMATION QUERY ──────────────────────────────────────── */
  const [formation, setFormation] = useState(null);
  useQuery(QUERY_FORMATION, {
    variables: { 
      gameId,
      organizationId: currentOrganization?._id 
    },
    skip: !gameId || !currentOrganization,
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
    onError: (error) => {
      if (error.message.includes('organization')) {
        alert('Organization access error: ' + error.message);
      }
    }
  });
  const [unvoteGame] = useMutation(UNVOTE_GAME, {
    onCompleted: () => refetchGame(),
    onError: (error) => {
      if (error.message.includes('organization')) {
        alert('Organization access error: ' + error.message);
      }
    }
  });
  const [confirmGame] = useMutation(CONFIRM_GAME, {
    refetchQueries: [
      { query: QUERY_GAME, variables: { gameId, organizationId: currentOrganization?._id } },
      { query: QUERY_GAMES, variables: { status: "PENDING", organizationId: currentOrganization?._id } },
    ],
    awaitRefetchQueries: true,
    onError: (error) => {
      if (error.message.includes('organization')) {
        alert('Organization access error: ' + error.message);
      }
    }
  });
  const [cancelGame] = useMutation(CANCEL_GAME, {
    refetchQueries: [
      { query: QUERY_GAME, variables: { gameId, organizationId: currentOrganization?._id } },
      { query: QUERY_GAMES, variables: { status: "PENDING", organizationId: currentOrganization?._id } },
    ],
    awaitRefetchQueries: true,
    onError: (error) => {
      if (error.message.includes('organization')) {
        alert('Organization access error: ' + error.message);
      }
    }
  });
  // Note: completeGame mutation is handled by GameComplete component
  // const [completeGame] = useMutation(COMPLETE_GAME, {...});


  /* ─── LOCAL UI STATE ───────────────────────────────────────── */
  const [currentVote, setCurrentVote] = useState(null);
  const [updatedNote, setUpdatedNote] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReconfirm, setShowReconfirm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [formationSubSection, setFormationSubSection] = useState("lineup"); // lineup, players, comment, feedback

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date & Time Card */}
            <div className={`rounded-lg shadow-sm border transition-colors ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Date & Time
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <dt className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Date
                    </dt>
                    <dd className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {humanDate}
                    </dd>
                  </div>
                  
                  <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
                  
                  <div>
                    <dt className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Time
                    </dt>
                    <dd className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {humanTime}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className={`rounded-lg shadow-sm border transition-colors ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-50"
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Location
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <dt className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Venue
                    </dt>
                    <dd className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {game.venue}
                    </dd>
                  </div>
                  
                  <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
                  
                  <div>
                    <dt className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      City
                    </dt>
                    <dd className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {game.city}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "weather":
        return (
          <div className={`rounded-lg shadow-sm border transition-colors ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-sky-900/30" : "bg-sky-50"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-sky-400" : "text-sky-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Weather Forecast
                </h3>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
              
              <div className="mt-5">
                <WeatherForecast 
                  date={game.date} 
                  city={game.city} 
                  isDarkMode={isDarkMode} 
                />
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className={`rounded-lg shadow-sm border transition-colors ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-orange-900/30" : "bg-orange-50"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Game Notes
                </h3>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
              
              <div className="mt-5">
                {isCreator ? (
                  <div>
                    <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Notes for players
                    </label>
                    <textarea
                      value={updatedNote}
                      onChange={(e) => setUpdatedNote(e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500" 
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder="Add game notes or instructions for players..."
                    />
                  </div>
                ) : (
                  <div>
                    <dt className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Notes
                    </dt>
                    <dd className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {game.notes || (
                        <span className={`italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          No notes available
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "management":
        return isCreator ? (
          <div className={`rounded-lg shadow-sm border transition-colors ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-50"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Game Management
                </h3>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
              
              {/* Instructions */}
              <div className={`mt-5 mb-6 px-4 py-3 rounded-md text-xs leading-relaxed ${
                isDarkMode ? "bg-blue-900/20 text-blue-300 border border-blue-800" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                <p>
                  <strong>Instructions:</strong> You can update game information while it's in the pending stage. Confirm the game when you're ready, or cancel anytime. Once confirmed and the game is finished, you can complete it with the final result.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {game.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Game
                    </button>
                    <button
                      onClick={() => navigate(`/game-update/${gameId}`)}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                        isDarkMode 
                          ? "bg-gray-700 hover:bg-gray-600 text-white" 
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Game
                    </button>
                    <button
                      onClick={() => setShowCancel(true)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Game
                    </button>
                  </>
                )}
                {game.status === "CANCELLED" && (
                  <button
                    onClick={() => setShowReconfirm(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-confirm Game
                  </button>
                )}
                {game.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => setShowComplete(true)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Game
                    </button>
                    <button
                      onClick={() => setShowCancel(true)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Game
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null;

      case "responses":
        return (
          <div className={`rounded-lg shadow-sm border transition-colors ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="p-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-teal-900/30" : "bg-teal-50"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-teal-400" : "text-teal-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Player Responses
                </h3>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
              
              {/* Voting Buttons - Only show for PENDING games */}
              {game.status === "PENDING" && (
                <div className="mt-5 mb-6">
                  <label className={`block text-xs font-medium uppercase tracking-wider mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Your Response
                  </label>
                  {/* Large screen: one row, Small screen: 2x2 grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentVote === null ? (
                      <>
                        <button
                          onClick={() =>
                            respondToGame({
                              variables: { 
                                input: { gameId, isAvailable: true },
                                organizationId: currentOrganization?._id
                              },
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
                              variables: { 
                                input: { gameId, isAvailable: false },
                                organizationId: currentOrganization?._id
                              },
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
                                organizationId: currentOrganization?._id
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
                          onClick={() => unvoteGame({ 
                            variables: { 
                              gameId,
                              organizationId: currentOrganization?._id
                            } 
                          })}
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
                <div className="mt-5 mb-6">
                  <label className={`block text-xs font-medium uppercase tracking-wider mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Response Summary
                  </label>
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
          </div>
        );

      case "guidelines":
        return (
          <div className={`p-4 sm:p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="mb-6">
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Game Guidelines
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Important reminders for all players
              </p>
            </div>

            <div className="space-y-4">
              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xl">ℹ️</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Be informed about time, venue, and opponent
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span className="text-xl">💧</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Stay hydrated before and during the game
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-xl">⏰</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Arrive 30 minutes before kick-off
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-xl">🏃</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Team warm-up before kick-off
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Know the game plan and formation
                  </p>
                </div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${
              isDarkMode ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <p className={`text-sm font-semibold ${isDarkMode ? "text-green-300" : "text-green-800"}`}>
                  Good Luck!
                </p>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-700"}`}>
                Play with passion, respect your teammates and opponents
              </p>
            </div>
          </div>
        );

      case "feedback":
        return game.status === "COMPLETED" ? (
          <div className={`rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="px-4 sm:px-6 py-4 space-y-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Game Feedback
              </h3>
              
              {/* Show Thank You message after submission */}
              {showThankYou && (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-green-800 dark:text-green-200 font-semibold">Thank you for your feedback!</p>
                </div>
              )}
              
              {/* Show form only if user hasn't given feedback yet */}
              {!feedbackGiven && !showThankYou && (
                <div>
                  <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Share Your Feedback
                  </h4>
                  <GameFeedback
                    gameId={gameId}
                    isDarkMode={isDarkMode}
                    onFeedback={handleFeedback}
                  />
                </div>
              )}

              {/* Always show feedback list for completed games */}
              <div>
                <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  All Feedback
                </h4>
                <GameFeedbackList gameId={gameId} isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        ) : null;

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
          <div className={`rounded-lg shadow-sm border ${
            isDarkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Game Results
                </h3>
              </div>

              <div className={`border-t mb-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Final Score Card */}
                <div className={`p-5 rounded-lg border ${
                  isDarkMode 
                    ? "bg-gray-900/50 border-gray-700" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded ${
                      isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                    }`}>
                      <svg className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Final Score
                    </h4>
                  </div>
                  <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {game.score}
                  </p>
                </div>

                {/* Result Card */}
                <div className={`p-5 rounded-lg border ${
                  isDarkMode 
                    ? "bg-gray-900/50 border-gray-700" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded ${
                      isDarkMode ? "bg-green-900/30" : "bg-green-100"
                    }`}>
                      <svg className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Match Result
                    </h4>
                  </div>
                  <p className={`text-3xl font-bold uppercase ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {game.result.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className={`border-t mb-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>

              {/* Player of the Match and Average Rating */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Player of the Match Card */}
                <div className={`p-5 rounded-lg border ${
                  isDarkMode 
                    ? "bg-gray-900/50 border-gray-700" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded ${
                      isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                    }`}>
                      <svg className={`w-4 h-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Player of the Match
                    </h4>
                  </div>
                  {playerOfTheMatch ? (
                    <div>
                      <p className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {playerOfTheMatch.name}
                      </p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium ${
                        isDarkMode 
                          ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800" 
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{playerOfTheMatch.votes} vote{playerOfTheMatch.votes !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm italic ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      No votes cast yet
                    </p>
                  )}
                </div>

                {/* Average Rating Card */}
                <div className={`p-5 rounded-lg border ${
                  isDarkMode 
                    ? "bg-gray-900/50 border-gray-700" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded ${
                      isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                    }`}>
                      <svg className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Average Rating
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {game.averageRating.toFixed(1)}
                    </span>
                    <span className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      / 10
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(game.averageRating / 2) 
                            ? isDarkMode ? "text-yellow-400" : "text-yellow-500"
                            : isDarkMode ? "text-gray-600" : "text-gray-300"
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className={`rounded-lg shadow-sm mb-6 ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            {/* Game Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/game-schedule")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>←</span>
                  <span>Back to Games</span>
                </button>
              </div>
              <span className={`${statusBadgeClass(effectiveStatus)} text-xs sm:text-sm`}>
                {effectiveStatus === 'PENDING' && '⏳ PENDING'}
                {effectiveStatus === 'CONFIRMED' && '✅ CONFIRMED'}
                {effectiveStatus === 'COMPLETED' && '🏆 COMPLETED'}
                {effectiveStatus === 'CANCELLED' && '❌ CANCELLED'}
                {effectiveStatus === 'EXPIRED' && '⏰ EXPIRED'}
                {!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(effectiveStatus) && effectiveStatus}
              </span>
            </div>

            {/* Game Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Opponent */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Opponent
                </h3>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {game.opponent}
                </p>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Date & Time
                </h3>
                <p className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {humanDate}
                </p>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {humanTime}
                </p>
              </div>

              {/* Location */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Location
                </h3>
                <p className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {game.venue}
                </p>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {game.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`rounded-lg shadow-sm mb-6 ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => { 
                  if (showFormation) setShowFormation(false);
                  setActiveSection("overview");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  !showFormation && activeSection === "overview"
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                    : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => { 
                  if (showFormation) setShowFormation(false);
                  setActiveSection("weather");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  !showFormation && activeSection === "weather"
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                    : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Weather
              </button>

              <button
                onClick={() => { 
                  if (showFormation) setShowFormation(false);
                  setActiveSection("notes");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  !showFormation && activeSection === "notes"
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                    : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Notes
              </button>

              <button
                onClick={() => { 
                  if (showFormation) setShowFormation(false);
                  setActiveSection("responses");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  !showFormation && activeSection === "responses"
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                    : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Responses
              </button>

              <button
                onClick={() => { 
                  if (showFormation) setShowFormation(false);
                  setActiveSection("guidelines");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  !showFormation && activeSection === "guidelines"
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                    : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Guidelines
              </button>

              {/* Formation/Feedback button - Show "Formation" for CONFIRMED, "Feedback" for COMPLETED */}
              {(game.status === "CONFIRMED" || game.status === "COMPLETED") && (
                <button
                  onClick={() => setShowFormation(!showFormation)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    showFormation
                      ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                      : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {game.status === "COMPLETED" ? "Feedback" : "Formation"}
                </button>
              )}

              {isCreator && (game.status === "PENDING" || game.status === "CONFIRMED" || game.status === "CANCELLED") && (
                <button
                  onClick={() => { 
                    if (showFormation) setShowFormation(false);
                    setActiveSection("management");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    !showFormation && activeSection === "management"
                      ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                      : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Management
                </button>
              )}

              {game.status === "COMPLETED" && (
                <button
                  onClick={() => { 
                    if (showFormation) setShowFormation(false);
                    setActiveSection("results");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    !showFormation && activeSection === "results"
                      ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                      : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {!showFormation ? (
          <div className="space-y-6">
            {renderActiveSection()}
          </div>
        ) : (
          <div>
            {/* Secondary Navigation for Formation (Mobile Only) - Only show for CONFIRMED games */}
            {game.status === "CONFIRMED" && (
              <div className="lg:hidden mb-6">
                <div className={`rounded-lg border overflow-hidden ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setFormationSubSection("lineup")}
                      className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        formationSubSection === "lineup"
                          ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                          : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Line-up
                    </button>
                    <button
                      onClick={() => setFormationSubSection("players")}
                      className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        formationSubSection === "players"
                          ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                          : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Players
                    </button>
                    <button
                      onClick={() => setFormationSubSection("comment")}
                      className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        formationSubSection === "comment"
                          ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                          : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Comment
                    </button>
                    <button
                      onClick={() => setFormationSubSection("like")}
                      className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        formationSubSection === "like"
                          ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                          : isDarkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Like
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile View - Single Column with Sub-sections */}
            <div className="lg:hidden space-y-6">
              {game.status === "CONFIRMED" ? (
                <>
                  {formationSubSection === "lineup" && (
                    !formation && !isCreator ? (
                      <div className={`p-6 rounded-md text-center ${
                        isDarkMode ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"
                      }`}>
                        <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-sm font-medium ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                          Formation is being prepared...
                        </p>
                      </div>
                    ) : (
                      <FormationSection
                        game={game}
                        formation={formation}
                        isCreator={isCreator}
                        setFormation={setFormation}
                        refetchFormation={() => startTransition(refetchGame)}
                        isLoading={loadingGame}
                      />
                    )
                  )}

                  {formationSubSection === "players" && (
                    <AvailablePlayersList
                      players={game.responses.filter(r => r.isAvailable).map(r => r.user)}
                      isCreator={false}
                      isLoading={loadingGame}
                    />
                  )}

                  {formationSubSection === "comment" && (
                    <FormationCommentList gameId={gameId} formationId={formation?._id} />
                  )}

                  {formationSubSection === "like" && (
                    <div className={`text-center p-6 rounded-md ${
                      isDarkMode ? "bg-purple-900/20 border border-purple-800" : "bg-purple-50 border border-purple-200"
                    }`}>
                      <svg className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h4 className={`text-base font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Formation Feedback
                      </h4>
                      <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Show your appreciation for this tactical setup
                      </p>
                      <FormationLikeButton formationId={formation?._id} isDarkMode={isDarkMode} />
                    </div>
                  )}
                </>
              ) : game.status === "COMPLETED" ? (
                /* For COMPLETED games - show feedback instead of formation */
                <div className={`rounded-lg shadow-sm border transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                        isDarkMode ? "bg-green-900/30" : "bg-green-50"
                      }`}>
                        <svg className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Game Feedback
                      </h3>
                    </div>
                    
                    {showThankYou && (
                      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-green-800 dark:text-green-200 font-semibold">Thank you for your feedback!</p>
                      </div>
                    )}
                    
                    {!feedbackGiven && !showThankYou && (
                      <div>
                        <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Share Your Feedback
                        </h4>
                        <GameFeedback
                          gameId={gameId}
                          isDarkMode={isDarkMode}
                          onFeedback={handleFeedback}
                        />
                      </div>
                    )}
                    
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        All Feedback
                      </h4>
                      <GameFeedbackList gameId={gameId} isDarkMode={isDarkMode} />
                    </div>
                  </div>
                </div>
              ) : (
                /* For PENDING or other statuses */
                <div className={`rounded-lg shadow-sm border transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="p-6">
                    <div className={`p-8 rounded-md text-center ${
                      isDarkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
                    }`}>
                      <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                        Formation will be available once the game is confirmed
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View - Two Column Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
              {/* Left Panel: Formation (CONFIRMED) or Feedback (COMPLETED) */}
              <div className={`rounded-lg shadow-sm border transition-colors ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                      game.status === "COMPLETED"
                        ? isDarkMode ? "bg-green-900/30" : "bg-green-50"
                        : isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50"
                    }`}>
                      {game.status === "COMPLETED" ? (
                        <svg className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {game.status === "COMPLETED" ? "Game Feedback" : "Game Formation"}
                    </h3>
                  </div>

                  <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
                  
                  <div className="mt-5">
                    {game.status === "COMPLETED" ? (
                      /* Show Feedback for COMPLETED games */
                      <div className="space-y-6">
                        {showThankYou && (
                          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                            <div className="text-4xl mb-3">🎉</div>
                            <p className="text-green-800 dark:text-green-200 font-semibold">Thank you for your feedback!</p>
                          </div>
                        )}
                        
                        {!feedbackGiven && !showThankYou && (
                          <div>
                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Share Your Feedback
                            </h4>
                            <GameFeedback
                              gameId={gameId}
                              isDarkMode={isDarkMode}
                              onFeedback={handleFeedback}
                            />
                          </div>
                        )}
                        
                        <div>
                          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            All Feedback
                          </h4>
                          <GameFeedbackList gameId={gameId} isDarkMode={isDarkMode} />
                        </div>
                      </div>
                    ) : game.status === "CONFIRMED" ? (
                      /* Show Formation for CONFIRMED games */
                      <div>
                        {!formation && !isCreator ? (
                          <div className={`p-6 rounded-md text-center ${
                            isDarkMode ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"
                          }`}>
                            <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className={`text-sm font-medium ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
                              Formation is being prepared...
                            </p>
                          </div>
                        ) : (
                          <FormationSection
                            game={game}
                            formation={formation}
                            isCreator={isCreator}
                            setFormation={setFormation}
                            refetchFormation={() => startTransition(refetchGame)}
                            isLoading={loadingGame}
                          />
                        )}
                      </div>
                    ) : (
                      /* For PENDING or other statuses */
                      <div className={`p-8 rounded-md text-center ${
                        isDarkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
                      }`}>
                        <svg className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                          Formation will be available once the game is confirmed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel: Comments/Discussion */}
            <div className={`rounded-lg shadow-sm border transition-colors ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {game.status === "COMPLETED" ? "Feedback Discussion" : "Formation Comments"}
                  </h3>
                </div>

                <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>
                
                <div className="mt-5">
                  {game.status === "COMPLETED" ? (
                    (() => {
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
                        
                        const players = Object.values(playerVotes);
                        if (players.length === 0) return null;
                        
                        return players.reduce((max, player) => 
                          player.votes > max.votes ? player : max
                        );
                      };

                      const playerOfTheMatch = calculatePlayerOfTheMatch();

                      return (
                        <div className="space-y-4">
                          {/* Player of the Match */}
                          {playerOfTheMatch && (
                            <div className={`p-4 rounded-lg ${
                              isDarkMode ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"
                            }`}>
                              <div className="flex items-center gap-3">
                                <img
                                  src={playerOfTheMatch.profilePic || SketchImage}
                                  alt={playerOfTheMatch.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => { e.target.src = SketchImage; }}
                                />
                                <div className="flex-1">
                                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                                    Player of the Match
                                  </p>
                                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {playerOfTheMatch.name}
                                  </p>
                                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {playerOfTheMatch.votes} vote{playerOfTheMatch.votes !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <div className="text-2xl">🏆</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Game Stats */}
                          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Match Results
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Final Score:</span>
                                <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{game.score}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Result:</span>
                                <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{game.result.replace("_", " ")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Team Rating:</span>
                                <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{game.averageRating.toFixed(1)}/10 ⭐</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <FormationCommentList gameId={gameId} formationId={formation?._id} />
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Modals */}
        {isCreator && showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`max-w-lg w-full rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
            }`}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Confirm Game
                </h3>
                
                <p className={`mb-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Add a confirmation note for the players:
                </p>
                
                <textarea
                  value={updatedNote}
                  onChange={(e) => setUpdatedNote(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Add any important information..."
                />
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      confirmGame({ 
                        variables: { 
                          gameId, 
                          organizationId: currentOrganization?._id,
                          note: updatedNote 
                        } 
                      });
                      setShowConfirm(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Confirm Game
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            <div className={`max-w-md w-full rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
            }`}>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Cancel This Game?
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    All players will be notified about the cancellation.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      cancelGame({ 
                        variables: { 
                          gameId, 
                          organizationId: currentOrganization?._id,
                          note: updatedNote || "Game cancelled by organizer" 
                        } 
                      });
                      setShowCancel(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancel(false)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Keep Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCreator && showComplete && (
          <GameComplete
            gameId={gameId}
            note={updatedNote}
            isDarkMode={isDarkMode}
            onComplete={(score, result) => {
              console.log('Game completed with score:', score, 'result:', result);
            }}
            onClose={() => setShowComplete(false)}
          />
        )}

        {isCreator && showReconfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`max-w-lg w-full rounded-lg shadow-xl ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
            }`}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Re-confirm Game
                </h3>
                
                <p className={`mb-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Explain the reason for re-confirming:
                </p>
                
                <textarea
                  value={updatedNote}
                  onChange={(e) => setUpdatedNote(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Explain why the game is being re-confirmed..."
                />
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      confirmGame({ variables: { gameId, organizationId: currentOrganization?._id, note: updatedNote } });
                      setShowReconfirm(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Re-confirm Game
                  </button>
                  <button
                    onClick={() => setShowReconfirm(false)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

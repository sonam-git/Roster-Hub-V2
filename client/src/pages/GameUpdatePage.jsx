// src/pages/GameUpdatePage.jsx
import React, { useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_GAME } from "../utils/queries";
import GameUpdate from "../components/GameUpdate";
import { ThemeContext } from "../components/ThemeContext";
import Auth from "../utils/auth";

const GameUpdatePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const { data, loading, error } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
  });

  const game = data?.game;
  
  // Handle auth redirect
  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Handle permission check - only redirect if we have game data and user is NOT creator
  useEffect(() => {
    if (!loading && game) {
      const currentUser = Auth.getProfile()?.data;
      const gameCreatorId = game?.creator?._id; // Fixed: using 'creator' instead of 'createdBy'
      const currentUserId = currentUser?._id;
      const isCreator = gameCreatorId === currentUserId;
      
      console.log('Permission check:', {
        gameCreatorId,
        currentUserId,
        isCreator,
        match: gameCreatorId === currentUserId
      });
      
      if (!isCreator) {
        console.log('Not creator, redirecting to game-schedule');
        navigate("/game-schedule", { replace: true });
      } else {
        console.log('✅ User IS the creator, staying on page');
      }
    }
  }, [loading, game, navigate]);

  const handleClose = () => {
    navigate(-1); // Go back to previous page (likely GameDetails)
  };

  // Debug logging
  console.log('GameUpdatePage render:', { gameId, loading, error, game: !!game });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Loading game details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl text-center ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Game Not Found
          </h2>
          <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error ? error.message : "The game you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/game-schedule")}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Go to Game Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen py-8 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleClose}
            className={`mb-6 flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3 ${
              isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="text-lg">←</span>
            <span>Back to Game Details</span>
          </button>
          
          <div className={`rounded-2xl shadow-lg p-6 border-2 ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 border-blue-600" 
              : "bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-300"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">✏️</span>
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Update Game Details
                </h1>
                <p className={`text-sm lg:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Modify game information and notify all players
                </p>
              </div>
            </div>

            {/* Game Info Summary */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl ${
              isDarkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white/70 border border-gray-200"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Current Date</p>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {new Date(parseInt(game.date)).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Current Time</p>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {game.time || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏟️</span>
                <div>
                  <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Current Venue</p>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {game.venue || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form Card */}
        <div className={`rounded-2xl shadow-lg p-6 border ${
          isDarkMode 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <GameUpdate
            gameId={gameId}
            initialDate={new Date(parseInt(game.date)).toISOString().split("T")[0]}
            initialTime={game.time || ""}
            initialVenue={game.venue || ""}
            initialCity={game.city || ""}
            initialNotes={game.notes || ""}
            initialOpponent={game.opponent || ""}
            onClose={handleClose}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Info Box */}
        <div className={`mt-6 p-4 rounded-xl border ${
          isDarkMode 
            ? "bg-blue-900/20 border-blue-700/50" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <h3 className={`font-semibold mb-1 ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>
                Important Note
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}>
                All players who have responded to this game will be automatically notified about any changes you make.
                Only update the fields that need to be changed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUpdatePage;

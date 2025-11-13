import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GameForm from "../components/GameForm";
import { ThemeContext } from "../components/ThemeContext";

const GameCreate = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const handleGameCreated = (newGame) => {
    // Navigate to the newly created game's details page
    navigate(`/game-schedule/${newGame._id}`);
  };

  const handleBackToGames = () => {
    // Navigate back to the game schedule
    navigate('/game-schedule');
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4 shadow-lg">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Create New Game
          </h1>
          <p className={`text-lg ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Schedule a new game for your team
          </p>
        </div>

        {/* Game Form */}
        <GameForm 
          onGameCreated={handleGameCreated}
          onBackToGames={handleBackToGames}
        />
      </div>
    </div>
  );
};

export default GameCreate;

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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gray-900" 
        : "bg-gray-50"
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex-1 w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create New Game
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Schedule a New Game
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

// src/pages/Game.jsx

import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";
import { ThemeContext } from "../components/ThemeContext";

const Game = () => {
  const { gameId } = useParams();
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`container mx-auto mt-5 p-4 `}
    >
      {gameId ? (
        <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
      ) : (
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* Left column: GameForm */}
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <GameForm />
          </div>
          {/* Right column: GameList */}
          <div className="lg:w-1/2 w-full">
            <GameList />
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;

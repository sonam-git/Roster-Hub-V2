import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";

import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";
import { ThemeContext } from "../components/ThemeContext";

import { QUERY_GAME } from "../utils/queries";

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  // Fetch game
  const {
    loading: loadingGame,
    data: gameData,
    error: gameError,
  } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
  });

  // Loading state
  if (!gameId) {
    return (
      <div className="container mx-auto mt-5 p-4">
        <div className="flex flex-col lg:flex-row lg:space-x-2">
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <GameForm />
          </div>
          <div className="lg:w-1/2 w-full">
            <GameList />
          </div>
        </div>
      </div>
    );
  }

  if (loadingGame) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (gameError) {
    return (
      <div className="text-center p-4 text-red-600">Error loading data</div>
    );
  }

  const game = gameData?.game;

  if (!game) {
    return (
      <div className="text-center p-6">
        <p className="text-lg text-gray-600 mb-4">
          This game no longer exists or has been deleted.
        </p>
        <button
          onClick={() => navigate("/game-schedule")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Game List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-5 p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className=" w-full mb-2">
          <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default Game;

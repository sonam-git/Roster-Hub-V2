import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";

import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";
import { ThemeContext } from "../components/ThemeContext";

import { QUERY_GAME } from "../utils/queries";

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useContext(ThemeContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);

  // Fetch game
  const {
    loading: loadingGame,
    data: gameData,
    error: gameError,
  } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
  });

  const game = gameData?.game;

  // Check if user came from "Create Game" button
  useEffect(() => {
    if (location.state?.showCreateGame || location.state?.scrollTo === "gameform") {
      setShowCreateGame(true);
    }
  }, [location.state]);

  // Redirect to /game-schedule if game does not exist, after showing message
  useEffect(() => {
    if (game === undefined) return; // Don't run until query resolves
    if (!game) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [game]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/game-schedule');
    }
  }, [shouldRedirect, navigate]);

  // Loading state
  if (!gameId) {
    // Show only GameForm if user clicked "Create Game"
    if (showCreateGame) {
      return (
        <div className="container mx-auto lg:mt-5 p-3">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <GameForm 
                onGameCreated={(game) => {
                  setShowCreateGame(false);
                  navigate(`/game-schedule/${game._id}`);
                }}
                onBackToGames={() => {
                  setShowCreateGame(false);
                  navigate("/game-schedule", { replace: true });
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    
    // Show GameList by default when no gameId
    return (
      <div className="container mx-auto lg:mt-5 p-3">
        <div className="flex flex-col lg:flex-row lg:space-x-2">
          <div className="w-full">
            <GameList onCreateGame={() => setShowCreateGame(true)} />
          </div>
        </div>
      </div>
    );
  }
  if (loadingGame) {
    return <div className="text-center p-4">Loading...</div>;
  }
  if (gameError) {
    return <div className="text-center p-4 text-red-600">Error loading data</div>;
  }

  if (game === undefined) {
    // Query not resolved yet
    return null;
  }

  if (!game) {
    return (
      <div className="text-center p-6">
        <p className="text-lg text-gray-600 mb-4">
          This game no longer exists or has been deleted.<br />
          Redirecting to game schedule…
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:mt-5 pt-4">
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className=" w-full mb-2">
          <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default Game;

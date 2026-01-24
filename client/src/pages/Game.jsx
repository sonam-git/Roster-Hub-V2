import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";

import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";
import Spinner from "../components/Spinner";
import { ThemeContext } from "../components/ThemeContext";
import { useOrganization } from "../contexts/OrganizationContext";

import { QUERY_GAME } from "../utils/queries";

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);

  // Debug logging
  console.log('🎮 Game Page Debug:', {
    gameId,
    organizationId: currentOrganization?._id,
    organizationName: currentOrganization?.name,
    hasOrganization: !!currentOrganization,
    locationState: location.state
  });

  // Fetch game
  const {
    loading: loadingGame,
    data: gameData,
    error: gameError,
    refetch,
  } = useQuery(QUERY_GAME, {
    variables: { 
      gameId,
      organizationId: currentOrganization?._id 
    },
    skip: !gameId || !currentOrganization,
  });
  
  // Debug logging for query results
  useEffect(() => {
    if (gameId && currentOrganization) {
      console.log('🎮 Game Query Debug:', {
        loading: loadingGame,
        hasData: !!gameData,
        hasError: !!gameError,
        errorMessage: gameError?.message,
        gameData: gameData?.game
      });
    }
  }, [loadingGame, gameData, gameError, gameId, currentOrganization]);
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization && gameId) {
      console.log('🔄 Refetching game with:', {
        gameId,
        organizationId: currentOrganization._id
      });
      refetch({ 
        gameId,
        organizationId: currentOrganization._id 
      });
    }
  }, [currentOrganization, gameId, refetch]);

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

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner fullScreen />;
  }

  // Loading state
  if (!gameId) {
    // Show only GameForm if user clicked "Create Game"
    if (showCreateGame) {
      return (
        <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-6 lg:mt-5 max-w-7xl pt-20 lg:pt-24">
          <div className="flex flex-col lg:flex-row lg:space-x-2">
            <div className="w-full">
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
      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-6 lg:mt-5 max-w-7xl pt-20 lg:pt-24">
        <div className="flex flex-col lg:flex-row lg:space-x-2">
          <div className="w-full">
            {/* Game Schedule Header */}
            <div className={`mb-6  text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <h1 className="text-2xl sm:text-3xl font-bold dark:text-white bg-clip-text ">
                Game Schedule
              </h1>
              <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your team's upcoming games and track their status
              </p>
            </div>
            <GameList onCreateGame={() => setShowCreateGame(true)} />
          </div>
        </div>
      </div>
    );
  }
  if (loadingGame) {
    return <Spinner />;
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
      <div className="text-center p-6 pt-20 lg:pt-24">
        <p className="text-lg text-gray-600 mb-4">
          This game no longer exists or has been deleted.<br />
          Redirecting to game schedule…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 lg:mt-5  max-w-7xl pt-20 lg:pt-24">
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className=" w-full mb-2">
          <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default Game;

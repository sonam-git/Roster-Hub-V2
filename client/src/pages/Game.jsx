import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";
import FormationSection from "../components/FormationSection";
import { ThemeContext } from "../components/ThemeContext";
import Auth from "../utils/auth";

import { QUERY_GAME, QUERY_FORMATION } from "../utils/queries";

import {
  FORMATION_CREATED_SUBSCRIPTION,
  FORMATION_UPDATED_SUBSCRIPTION,
  FORMATION_DELETED_SUBSCRIPTION,
} from "../utils/subscription";

import { UPDATE_FORMATION } from "../utils/mutations";

const Game = () => {
  const { gameId } = useParams();
  const { isDarkMode } = useContext(ThemeContext);
  const [formation, setFormation] = useState(null);

  const {
    loading: loadingGame,
    data: gameData,
    error: gameError,
  } = useQuery(QUERY_GAME, {
    variables: { gameId },
    skip: !gameId,
  });

  const {
    loading: loadingForm,
    error: formError,
    refetch: refetchFormation,
  } = useQuery(QUERY_FORMATION, {
    variables: { gameId },
    skip: !gameId,
    onCompleted: (data) => {
      if (data?.formation) {
        setFormation(data.formation);
      }
    },
  });

  const [updateFormation] = useMutation(UPDATE_FORMATION);

  // 📡 Subscriptions
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const created = data.data?.formationCreated;
      if (created) {
        setFormation(created);
      }
    },
  });

  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const updated = data.data?.formationUpdated;
      if (updated) {
        setFormation(updated);
      }
    },
  });

  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const deleted = data.data?.formationDeleted;
      if (deleted === gameId) {
        setFormation(null);
      }
    },
  });

  if (!gameId) {
    return (
      <div className="container mx-auto mt-5 p-4">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
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

  if (loadingGame || loadingForm) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (gameError || formError) {
    return (
      <div className="text-center p-4 text-red-600">Error loading data</div>
    );
  }

  const game = gameData.game;
  const currentUserId = Auth.getProfile()?.data?._id;
  const isCreator = game.creator._id === currentUserId;

  return (
    <div className="container mx-auto mt-5 p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className="lg:w-2/3 w-full">
          <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
        </div>
        {game.status === "CONFIRMED" && !formation && !isCreator && (
          <div className="p-4 text-sm text-center  dark:text-white">
            The formation will be displayed here once the creator creates it.
          </div>
        )}
        {game.status === "CONFIRMED" && (formation || isCreator) && (
          <div className="lg:w-1/3 w-full">
            <FormationSection
              game={game}
              formation={formation}
              isCreator={isCreator}
              setFormation={setFormation}
              refetchFormation={refetchFormation}
              onUpdateFormation={(positions) =>
                updateFormation({
                  variables: {
                    gameId,
                    positions,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;

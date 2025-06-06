import React from "react";
import { useParams } from "react-router-dom";
import GameList from "../components/GameList";
import GameForm from "../components/GameForm";
import GameDetails from "../components/GameDetails";

const Game = ({ isDarkMode }) => {
  const { gameId } = useParams();

  // Uncomment to debug:
  // console.log("Game.jsx useParams:", useParams());

  return (
    <div className="container mt-5">
      {gameId ? (
        <GameDetails gameId={gameId} isDarkMode={isDarkMode} />
      ) : (
        <>
          <GameForm />
          <GameList isDarkMode={isDarkMode} />
        </>
      )}
    </div>
  );
};

export default Game;

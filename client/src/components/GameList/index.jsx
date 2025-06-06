// src/components/GameList.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../ThemeContext";
import { useContext } from "react";

const GameList = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    pollInterval: 10000,
  });

  if (loading)
    return <div className="text-center mt-4">Loading games...</div>;
  if (error)
    return (
      <div className="text-center mt-4 text-red-600">
        Error: {error.message}
      </div>
    );

  const games = data.games || [];

  if (!games.length) {
    return <div className="text-center mt-4">No games scheduled yet.</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {games.map((game) => {
        const ts = Number(game.date);
        const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
        const humanDate = dateObj.toLocaleDateString();

        let statusIcon, borderColor, bgColor, textColor;
        if (game.status === "CONFIRMED") {
          statusIcon = (
            <FontAwesomeIcon icon={faCheck} className="text-green-600" />
          );
          borderColor = "border-green-600";
        } else if (game.status === "CANCELLED") {
          statusIcon = (
            <FontAwesomeIcon icon={faTimes} className="text-red-600" />
          );
          borderColor = "border-red-600";
        } else {
          statusIcon = (
            <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
          );
          borderColor = isDarkMode ? "border-gray-500" : "border-gray-300";
        }

        bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
        textColor = isDarkMode ? "text-gray-200" : "text-gray-800";

        return (
          <Link
            key={game._id}
            to={`/game-schedule/${game._id}`}
            className={`
              block p-4 rounded-lg shadow transition
              border-2 ${borderColor}
              hover:ring-2 hover:ring-blue-400
              ${bgColor} ${textColor}
            `}
          >
       <div className="flex justify-between items-center mb-2">
  <h3 className="text-xl font-semibold">
    <span>
      <span className="font-bold">Date:</span> {humanDate} &nbsp;|&nbsp;
      <span className="font-bold">Time:</span> {game.time}
    </span>
  </h3>
  {statusIcon}
</div>
<p className="mb-1">
  <span className="font-bold">Venue:</span> {game.venue}
</p>
<p className="text-sm mb-2">
  <span className="font-bold">Note:</span> {game.notes || "No notes provided"}
</p>
<div className="flex justify-between text-sm">
  <span>
    <span className="font-bold">Created By:</span> {game.creator.name}
  </span>
  <span>
    <span className="font-bold">Responses: </span> 👍 {game.availableCount} | 👎 {game.unavailableCount}
  </span>
</div>

          </Link>
        );
      })}
    </div>
  );
};

export default GameList;

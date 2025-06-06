// src/components/GameList.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";

const GameList = ({ isDarkMode }) => {
  // Fetch all games (no status filter) so we can show Pending, Confirmed, and Cancelled
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    // Do not pass variables, so it returns all statuses
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-4">
      {games.map((game) => {
        // Convert the stringified timestamp back into a Date
        const ts = Number(game.date);
        const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
        const humanDate = dateObj.toLocaleDateString();

        // Determine status icon and styling
        let statusIcon, borderColor;
        if (game.status === "CONFIRMED") {
          statusIcon = <FontAwesomeIcon icon={faCheck} className="text-green-600" />;
          borderColor = "border-green-600";
        } else if (game.status === "CANCELLED") {
          statusIcon = <FontAwesomeIcon icon={faTimes} className="text-red-600" />;
          borderColor = "border-red-600";
        } else {
          statusIcon = <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
          borderColor = isDarkMode ? "border-gray-500" : "border-gray-300";
        }

        return (
          <Link
            key={game._id}
            to={`/game-schedule/${game._id}`}
            className={`
              block p-4 rounded-lg shadow transition
              border-2 ${borderColor}
              hover:ring-2 hover:ring-blue-400
              ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"}
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">
                {humanDate} @ {game.time}
              </h3>
              {statusIcon}
            </div>
            <p className="truncate mb-1">{game.venue}</p>
            <p className="text-sm truncate mb-2">
              {game.notes || "No notes provided"}
            </p>
            <div className="flex justify-between text-sm">
              <span>By: {game.creator.name}</span>
              <span>
                👍 {game.availableCount} | 👎 {game.unavailableCount}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default GameList;

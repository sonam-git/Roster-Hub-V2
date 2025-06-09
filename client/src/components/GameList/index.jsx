// src/components/GameList.jsx

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../ThemeContext";

const GameList = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    pollInterval: 10000,
  });

  const [page, setPage] = useState(0);
  const itemsPerPage = 2;

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error)
    return (
      <div className="text-center mt-4 text-red-600">
        Error: {error.message}
      </div>
    );

  const games = data.games || [];
  const totalPages = Math.ceil(games.length / itemsPerPage);

  if (!games.length) {
    return <div className="text-center mt-4">No games scheduled yet.</div>;
  }

  const pagedGames = games.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Game Schedule</h2>
      <div className="flex flex-col space-y-4">
        {pagedGames.map((game) => {
          const ts = Number(game.date);
          const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
          const humanDate = dateObj.toLocaleDateString();

          // Determine status display
          let statusIcon, statusText, statusColor, borderColor;
          if (game.status === "CONFIRMED") {
            statusIcon = <FontAwesomeIcon icon={faCheck} />;
            statusText = "Confirmed";
            statusColor = "text-green-600";
            borderColor = "border-green-600";
          } else if (game.status === "CANCELLED") {
            statusIcon = <FontAwesomeIcon icon={faTimes} />;
            statusText = "Cancelled";
            statusColor = "text-red-600";
            borderColor = "border-red-600";
          } else {
            statusIcon = <FontAwesomeIcon icon={faClock} />;
            statusText = "Pending";
            statusColor = "text-yellow-500";
            borderColor = isDarkMode
              ? "border-gray-500"
              : "border-gray-300";
          }

          const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
          const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";

          return (
            <Link
              key={game._id}
              to={`/game-schedule/${game._id}`}
              className={`
                no-underline hover:no-underline
                block p-4 rounded-lg shadow transition
                border-2 ${borderColor}
                hover:ring-2 ${isDarkMode ? "hover:ring-blue-200" : "hover:ring-blue-600"}
                ${bgColor} ${textColor}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">
                  <span className="font-bold">Date:</span> {humanDate} &nbsp;|&nbsp;
                  <span className="font-bold">Time:</span> {game.time}
                </h3>
                <div className="flex items-center space-x-1">
                  <span className={statusColor}>{statusIcon}</span>
                  <span className={`font-semibold ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
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
                  <span className="font-bold">Responses:</span> 👍 {game.availableCount} | 👎 {game.unavailableCount}
                </span>
              </div>
              <p className="mt-3 flex items-center">
                <span role="img" aria-label="attention" className="mr-2">
                  ⚠️
                </span>
                <span className="font-bold">
                  Response cannot be changed once the game is confirmed.
                </span>
              </p>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GameList;

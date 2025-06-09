// src/components/GameList.jsx

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { DELETE_GAME } from "../../utils/mutations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faClock,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";

const GameList = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    pollInterval: 10000,
  });

  const [deleteGame] = useMutation(DELETE_GAME, {
    update(cache, { data: { deleteGame } }) {
      // remove the Game entity from the cache
      cache.evict({ id: cache.identify({ __typename: "Game", _id: deleteGame._id }) });
      cache.gc(); // garbage collect
    }
  });
  

  const userId = Auth.getProfile()?.data?._id || null;

  const [page, setPage] = useState(0);
  const itemsPerPage = 2;

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

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
  const handleNext = () =>
    setPage((p) => Math.min(p + 1, totalPages - 1));

  const openDeleteModal = (gameId) => {
    setDeleteError("");
    setGameToDelete(gameId);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };
  const confirmDelete = async () => {
    try {
      // this will wait until QUERY_GAMES has been re‐run
      await deleteGame({ variables: { gameId: gameToDelete } });
      closeDeleteModal();
      // at this point, the list is up-to-date
    } catch (err) {
      console.error("Delete failed", err);
    }
  };
  

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        {data.games.length} Upcoming Games
      </h2>

      <div className="flex flex-col space-y-4">
        {pagedGames.map((game) => {
          const ts = Number(game.date);
          const dateObj = isNaN(ts) ? new Date(game.date) : new Date(ts);
          const humanDate = dateObj.toLocaleDateString();
          const isCreator = game.creator._id === userId;

          // Determine status display
          let statusIcon,
            statusText,
            statusColor,
            borderColor;
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
            <div key={game._id} className="relative">
              <Link
                to={`/game-schedule/${game._id}`}
                className={`
                  no-underline hover:no-underline
                  block p-4 rounded-lg shadow transition
                  border-2 ${borderColor}
                  hover:ring-2 ${
                    isDarkMode
                      ? "hover:ring-blue-200"
                      : "hover:ring-blue-600"
                  }
                  ${bgColor} ${textColor}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">
                    <span className="font-bold">Date:</span> {humanDate}{" "}
                    &nbsp;|&nbsp;
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
                  <span className="font-bold">Note:</span>{" "}
                  {game.notes || "No notes provided"}
                </p>
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="font-bold">Created By:</span>{" "}
                    {game.creator.name}
                  </span>
                  <span>
                    <span className="font-bold">Responses:</span> 👍{" "}
                    {game.availableCount} | 👎 {game.unavailableCount}
                  </span>
                </div>
                <p className="mt-3 flex items-center">
                  <span role="img" aria-label="attention" className="mr-2">
                    ⚠️
                  </span>
                  <span className="text-yellow-800 italic">
                    Response cannot be changed once the game is confirmed.
                  </span>
                </p>
              </Link>

              {isCreator && (
                <button
                  onClick={() => openDeleteModal(game._id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-400"
                  title="Delete game"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-11/12 max-w-md ${
              isDarkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Delete Game?</h2>
            <p className="mb-6">
              Are you sure you want to delete this game? This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-red-500 mb-4">{deleteError}</p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className={`px-4 py-2 rounded ${
                  isDarkMode
                    ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameList;

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
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";

const GameList = () => {
  const { isDarkMode } = useContext(ThemeContext);

  // Fetch all games (no status filter)
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    pollInterval: 10000,
  });

  const [deleteGame] = useMutation(DELETE_GAME, {
    update(cache, { data: { deleteGame } }) {
      cache.evict({ id: cache.identify({ __typename: "Game", _id: deleteGame._id }) });
      cache.gc();
    },
  });

  const userId = Auth.getProfile()?.data?._id || null;
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = data.games || [];
  if (!games.length) {
    return <div className="text-center mt-4 text-xl font-bold">No games scheduled yet.</div>;
  }

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const pagedGames = games.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const handlePrev = () => setPage(p => Math.max(p - 1, 0));
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages - 1));

  const openDeleteModal = id => { setGameToDelete(id); setShowDeleteModal(true); };
  const closeDeleteModal = () => setShowDeleteModal(false);
  const confirmDelete = async () => {
    await deleteGame({ variables: { gameId: gameToDelete } });
    closeDeleteModal();
  };

  return (
    <>


      <div className="flex flex-col space-y-4">
        {pagedGames.map(game => {
          const dateObj = new Date(Number(game.date));
          const humanDate = isNaN(dateObj) ? game.date : dateObj.toLocaleDateString();
          const isCreator = game.creator._id === userId;

          // Determine status display, now including COMPLETED
          let statusIcon, statusText, statusColor, borderColor;
          if (game.status === "COMPLETED") {
            statusIcon = <FontAwesomeIcon icon={faCheckCircle} />;
            statusText = "Completed";
            statusColor = "text-green-600";
            borderColor = "border-green-600";
          } else if (game.status === "CONFIRMED") {
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
            borderColor = isDarkMode ? "border-gray-500" : "border-gray-300";
          }

          const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
          const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";
          
          // Format time to 12-hour format with AM/PM
          const [h, m] = game.time.split(":").map(n => parseInt(n, 10));
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            const gameTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

          return (
            <div key={game._id} className="relative">
              <Link
                to={`/game-schedule/${game._id}`}
                className={`
                  no-underline hover:no-underline
                  block p-4 rounded-lg shadow transition
                  border-2 ${borderColor}
                  hover:ring-2 ${isDarkMode ? "hover:ring-blue-200 text-white"  : "hover:ring-blue-600"}
                  ${bgColor} ${textColor}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">
                    <span className="font-bold">Date:</span> {humanDate}{" "}
                    &nbsp;|&nbsp;
                    <span className="font-bold">Time:</span> {gameTime}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <span className={statusColor}>{statusIcon}</span>
                    <span className={`font-semibold ${statusColor}`}>{statusText}</span>
                  </div>
                </div>
                <p className="mb-1"><span className="font-bold">Venue:</span> {game.venue}</p>
                <p className="text-sm mb-2">
                  <span className="font-bold">Note:</span> {game.notes || "No notes provided"}
                </p>
                <div className="flex justify-between text-sm">
                  <span><span className="font-bold">By:</span> {game.creator?.name}</span>
                  <span>
                    <span className="font-bold"> Available 👍 </span> {game.availableCount} |{" "}
                    <span className="font-bold">Not Available ❌ </span> {game.unavailableCount}
                  </span>
                </div>
                {game.status === "PENDING" && (
                  <p className="mt-3 flex items-center text-yellow-600 italic dark:text-yellow-300 text-xs">
                    <span role="img" aria-label="attention" className="mr-2">⚠️</span>
                    Response cannot be changed once the game is confirmed.
                  </p>
                )}
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

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
          <div className={`p-6 rounded-lg shadow-lg w-11/12 max-w-md ${
            isDarkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
          }`}>
            <h2 className="text-xl font-bold mb-4">Delete Game?</h2>
            <p className="mb-6 italic">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className={`px-4 py-2 rounded ${
                  isDarkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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

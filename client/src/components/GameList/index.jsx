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
  const [statusFilter, setStatusFilter] = useState('ALL');

  const STATUS_OPTIONS = [
    { key: 'ALL', label: 'All', color: 'bg-gray-200 text-gray-900 hover:bg-gray-400 dark:bg-gray-800 dark:text-white' },
    { key: 'PENDING', label: 'Pending', color: 'bg-orange-400 text-white hover:bg-orange-700' },
    { key: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-500 text-white hover:bg-green-700' },
    { key: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500 text-white hover:bg-red-700' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-purple-500 text-white hover:bg-purple-700' },
  ];

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = data.games || [];
  if (!games.length) {
    return <div className="text-center mt-4 text-xl font-semibold italic">No games scheduled yet.</div>;
  }

  // Filter games by status
  const filteredGames = statusFilter === 'ALL'
    ? games
    : games.filter(g => g.status === statusFilter);

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const pagedGames = filteredGames.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

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
      {/* Status filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setStatusFilter(opt.key)}
            className={`px-4 py-2 rounded-full font-bold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm
              ${statusFilter === opt.key
                ? 'bg-blue-500 text-white scale-105 ring-2 ring-blue-400' // Use blue for active
                : opt.color}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col space-y-4">
        {filteredGames.length === 0 ? (
          <div className="text-center mt-4 text-xl italic dark:text-white">
            {statusFilter === 'ALL'
              ? 'No games scheduled.'
              : `No ${statusFilter.toLowerCase()} game${statusFilter === 'COMPLETED' ? 's' : ''}.`}
          </div>
        ) : (
          pagedGames.map(game => {
            const dateObj = new Date(Number(game.date));
            const humanDate = isNaN(dateObj) ? game.date : dateObj.toLocaleDateString();
            const isCreator = game.creator._id === userId;

            // Determine status display, now including COMPLETED
            let statusIcon, statusText, statusColor;
            if (game.status === "COMPLETED") {
              statusIcon = faCheckCircle ? <FontAwesomeIcon icon={faCheckCircle} /> : null;
              statusText = "Completed";
              statusColor = "text-purple-600";
            } else if (game.status === "CONFIRMED") {
              statusIcon = faCheck ? <FontAwesomeIcon icon={faCheck} /> : null;
              statusText = "Confirmed";
              statusColor = "text-green-600";
            } else if (game.status === "CANCELLED") {
              statusIcon = faTimes ? <FontAwesomeIcon icon={faTimes} /> : null;
              statusText = "Cancelled";
              statusColor = "text-red-600";
            } else {
              statusIcon = faClock ? <FontAwesomeIcon icon={faClock} /> : null;
              statusText = "Pending";
              statusColor = "text-yellow-500";
            }

            
            
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
                    block p-6 rounded-2xl shadow-xl border-2 transition-all duration-300
                    bg-gradient-to-br
                    ${isDarkMode
                      ? `from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-gray-100 hover:ring-blue-300`
                      : `from-blue-50 via-white to-blue-100 border-blue-300 text-gray-800 hover:ring-blue-400`}
                    scale-100 hover:scale-[1.02]
                    ${game.status === 'PENDING' ? (isDarkMode ? 'hover:border-orange-400' : 'hover:border-orange-500') : ''}
                    ${game.status === 'CONFIRMED' ? (isDarkMode ? 'hover:border-green-400' : 'hover:border-green-500') : ''}
                    ${game.status === 'CANCELLED' ? (isDarkMode ? 'hover:border-red-400' : 'hover:border-red-500') : ''}
                    ${game.status === 'COMPLETED' ? (isDarkMode ? 'hover:border-purple-400' : 'hover:border-purple-500') : ''}
                  `}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className={`text-base md:text-2xl font-extrabold tracking-tight drop-shadow-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}> 
                      <span className="font-bold">Date:</span> {humanDate}
                      &nbsp;|&nbsp;
                      <span className="font-bold">Time:</span> {gameTime}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span className={`text-xl ${statusColor}`}>{statusIcon}</span>
                      <span className={`font-semibold ${statusColor}`}>{statusText}</span>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-col gap-1">
                    <p className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}><span className="font-bold">Venue:</span> {game.venue}</p>
                    <p className={`text-sm mb-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}><span className="font-bold">Note:</span> {game.notes || "No notes provided"}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className={isDarkMode ? 'text-blue-200' : 'text-blue-500'}><span className="font-bold">By:</span> {game.creator?.name}</span>
                    <span>
                      <span className="font-bold text-green-500">Available 👍</span> {game.availableCount} |{' '}
                      <span className="font-bold text-red-500">Not Available ❌</span> {game.unavailableCount}
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
                    className="absolute top-4 right-4 text-red-600 hover:text-red-400 bg-white bg-opacity-80 rounded-full p-2 shadow-lg transition-all duration-200"
                    title="Delete game"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            );
          })
        )}
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

import React from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { QUERY_GAMES } from "../utils/queries";
import { GAME_CREATED_SUBSCRIPTION, GAME_CONFIRMED_SUBSCRIPTION, GAME_UPDATED_SUBSCRIPTION, GAME_COMPLETED_SUBSCRIPTION, GAME_CANCELLED_SUBSCRIPTION, GAME_DELETED_SUBSCRIPTION } from "../utils/subscription";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons";

export default function CustomComingGames({ isDarkMode }) {
  const { loading, error, data } = useQuery(QUERY_GAMES);

  // Subscribe to all relevant game events for real-time updates
  useSubscription(GAME_CREATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_UPDATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_COMPLETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CANCELLED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = (data?.games || []).filter(g => g.status === "PENDING" || g.status === "CONFIRMED");
  if (!games.length) {
    return <div className="text-center italic">No upcoming games.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {games.map(game => {
          // Format date and time like GameDetails
          let humanDate = game.date;
          let humanTime = game.time;
          // Try to parse date if it's a timestamp
          if (!isNaN(Number(game.date))) {
            const dateObj = new Date(Number(game.date));
            humanDate = dateObj.toLocaleDateString();
          }
          if (game.time) {
            const [h, m] = game.time.split(":").map(Number);
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            humanTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
          }
          return (
            <div key={game._id} className={`rounded shadow p-4 flex flex-col mt-8 ${isDarkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="flex items-center gap-2">
                  Game against  <FontAwesomeIcon icon={faPersonRunning} className="ml-2 text-green-500 text-xl" />
                  <span className="font-bold text-xl text-blue-500 dark:text-gray-100 ml-1 flex items-center">
                    {game.opponent}
                  </span>
                </p>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${game.status === "CONFIRMED" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>{game.status}</span>
              </div>
              <div className="mb-1">Date: <span className="font-semibold">{humanDate}</span></div>
              <div className="mb-1">Time: <span className="font-semibold">{humanTime}</span></div>
              <div className="mb-1">Venue: <span className="font-semibold">{game.venue}</span></div>
              <div className="mb-1">Notes: <span className="italic">{game.notes || "-"}</span></div>
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition self-end"
                onClick={() => window.location.href = `/game-schedule/${game._id}`}
              >
                Details
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

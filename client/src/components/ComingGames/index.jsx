// src/components/ComingGames.jsx
import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";

const STATUS_STYLES = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100  text-green-800",
  CANCELLED: "bg-red-100    text-red-800",
  COMPLETED: "bg-blue-100   text-blue-800",
};

const ComingGames = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data } = useQuery(QUERY_GAMES);

  if (loading) return <p>Loading upcoming games…</p>;
  if (error)   return <p className="text-red-500">Error: {error.message}</p>;

  // midnight today in local
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // build list
  const games = (data.games || [])
    .map(g => ({
      ...g,
      dateObj: new Date(Number(g.date)),
      // copy only the calendar date
      dateOnly: (() => {
        const d = new Date(Number(g.date));
        d.setHours(0, 0, 0, 0);
        return d;
      })(),
    }))
    .filter(g =>
      // include games on/after today, and not cancelled
      g.dateOnly >= today && g.status !== "CANCELLED"
    )
    .sort((a, b) => a.dateObj - b.dateObj);

  if (games.length === 0) {
    return <p>No upcoming games.</p>;
  }

  const firstThree = games.slice(0, 3);
  const rest       = games.slice(3);
console.log(firstThree)
  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <h3 className="text-lg font-bold mb-3">Upcoming Games</h3>

      <ul className="space-y-3">
        {firstThree.map(game => (
          <li key={game._id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {game.dateObj.toLocaleDateString()}
              </p>
              <p className="text-sm">Against {game.opponent}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                STATUS_STYLES[game.status] || ""
              }`}
            >
              {game.status[0] + game.status.slice(1).toLowerCase()}
            </span>
          </li>
        ))}
      </ul>

      {rest.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">More…</h4>
          <div className="overflow-y-auto max-h-40">
            <ul className="space-y-2">
              {rest.map(game => (
                <li key={game._id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">
                      {game.dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs">{game.opponent}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      STATUS_STYLES[game.status] || ""
                    }`}
                  >
                    {game.status[0] + game.status.slice(1).toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComingGames;

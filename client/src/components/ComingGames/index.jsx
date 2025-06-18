// src/components/ComingGames.jsx
import React, { useContext, useState, useMemo } from "react";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { QUERY_GAMES } from "../../utils/queries";
import {
  GAME_CREATED_SUBSCRIPTION,
  GAME_UPDATED_SUBSCRIPTION,
  GAME_CONFIRMED_SUBSCRIPTION,
  GAME_CANCELLED_SUBSCRIPTION,
  GAME_DELETED_SUBSCRIPTION,
  GAME_COMPLETED_SUBSCRIPTION
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";

const STATUS_FILTERS = [
  { key: "PENDING",   label: <FontAwesomeIcon icon={faClock}   /> },
  { key: "CONFIRMED", label: <FontAwesomeIcon icon={faCheck}   /> },
  { key: "CANCELLED", label: <FontAwesomeIcon icon={faTimes}   /> },
];

export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const client = useApolloClient();

  // 1️⃣ base query
  const { loading, error, data } = useQuery(QUERY_GAMES);

  // 2️⃣ subscribe to changes; whenever any fires, refetch QUERY_GAMES
  useSubscription(GAME_CREATED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  useSubscription(GAME_UPDATED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  useSubscription(GAME_CANCELLED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  useSubscription(GAME_DELETED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  useSubscription(GAME_COMPLETED_SUBSCRIPTION, {
    onData: () => client.refetchQueries({ include: [QUERY_GAMES] }),
  });
  
  

  const [filter, setFilter] = useState("PENDING");

  // “midnight today” to filter out past games
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // pull upcoming out of data.games
  const upcoming = useMemo(() => {
    if (!data?.games) return [];
    return data.games
      .map(g => ({ ...g, dateObj: new Date(Number(g.date)) }))
      .filter(g => g.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [data, today]);

  // then filter by selected status
  const byStatus = useMemo(
    () => upcoming.filter(g => g.status === filter),
    [upcoming, filter]
  );

  if (loading) return <p>Loading upcoming games…</p>;
  if (error)   return <p className="text-red-500">Error: {error.message}</p>;
  if (upcoming.length === 0) return <p>No upcoming games.</p>;

  return (
    <div className={`p-4 rounded-lg shadow-md ${
      isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
    }`}>
      <p className="text-xs text-center mb-2">Select the button to see the game status.</p>

      {/* status filter bar */}
      <div className="flex justify-between mb-4 bg-gray-200 p-2 rounded">
        {STATUS_FILTERS.map(opt => {
          const active = opt.key === filter;
          const base = active
            ? opt.key === "PENDING"
              ? "bg-yellow-500 text-white"
              : opt.key === "CONFIRMED"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            : isDarkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-800";
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`${base} text-xs px-3 py-1 rounded transition`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* list */}
      {byStatus.length === 0 ? (
        <p className="italic">No {filter.toLowerCase()} games.</p>
      ) : (
        <ul className="space-y-3">
          {byStatus.map(game => {
            const { _id, opponent, dateObj, status, time } = game;

            // format date and time
            const monthDay = dateObj.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            });
            const [h, m] = time.split(":").map(n => parseInt(n, 10));
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

            return (
              <li key={_id}>
                <Link
                  to={`/game-schedule/${_id}`}
                  className="flex justify-between items-center p-2 rounded hover:bg-indigo-200 hover:no-underline dark:hover:bg-gray-700 transition"
                >
                  <div>
                    <p className="font-medium">{monthDay}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {timeStr} vs. {opponent}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {status[0] + status.slice(1).toLowerCase()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

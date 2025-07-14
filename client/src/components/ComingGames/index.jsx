// src/components/ComingGames.jsx
import React, { useContext, useState, useMemo, useEffect } from "react";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { QUERY_FORMATION, QUERY_GAMES } from "../../utils/queries";
import {
  GAME_CREATED_SUBSCRIPTION,
  GAME_UPDATED_SUBSCRIPTION,
  GAME_CONFIRMED_SUBSCRIPTION,
  GAME_CANCELLED_SUBSCRIPTION,
  GAME_DELETED_SUBSCRIPTION,
  GAME_COMPLETED_SUBSCRIPTION,
  FORMATION_CREATED_SUBSCRIPTION,
  FORMATION_UPDATED_SUBSCRIPTION,
  FORMATION_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const STATUS_FILTERS = [
  { key: "PENDING", label: <FontAwesomeIcon icon={faClock} /> },
  { key: "CONFIRMED", label: <FontAwesomeIcon icon={faCheck} /> },
  { key: "CANCELLED", label: <FontAwesomeIcon icon={faTimes} /> },
];

export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const client = useApolloClient();
  const [filter, setFilter] = useState("PENDING");

  // Query games with status variable (but fallback to all if server does not filter)
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    variables: filter ? { status: filter } : {},
    fetchPolicy: 'network-only', // always get latest
  });

  // Refetch helper
  const refetchGames = () => {
    client.refetchQueries({ include: [QUERY_GAMES] });
  };
  const refetchFormations = () => {
    client.refetchQueries({ include: [QUERY_FORMATION] });
  };

  // Game and Formation Subscriptions
  useSubscription(GAME_CREATED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(GAME_UPDATED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(GAME_CANCELLED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(GAME_DELETED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(GAME_COMPLETED_SUBSCRIPTION, { onData: refetchGames });
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    onData: refetchFormations,
  });
  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    onData: refetchFormations,
  });
  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    onData: refetchFormations,
  });

  // Filter out past games
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcoming = useMemo(() => {
    if (!data?.games) return [];
    return data.games
      .map((g) => ({ ...g, dateObj: new Date(Number(g.date)) }))
      .filter((g) => g.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [data, today]);

  const byStatus = useMemo(() => {
    // If server returns all statuses, filter client-side
    if (!upcoming.length) return [];
    if (!upcoming[0].status || upcoming.some(g => g.status !== filter)) {
      return upcoming.filter(g => g.status === filter);
    }
    return upcoming;
  }, [upcoming, filter]);

  const allUpcomingEmpty = !upcoming.length;
  const noStatusGames = byStatus.length === 0;

  const [fade, setFade] = useState(true);
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 120);
    return () => clearTimeout(timeout);
  }, [filter, data]);

  // Loading and error states
  if (loading) return <p>Loading upcoming games…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <p className="text-xs text-center mb-2 dark:text-gray-100">
        Select the button to see the game status.
      </p>
      {/* Status filter */}
      <div className="flex justify-between mb-4 bg-gray-200 p-2 rounded">
        {STATUS_FILTERS.map((opt) => {
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
      {noStatusGames && !allUpcomingEmpty && (
        <p className="text-center italic text-sm">No {filter.toLowerCase()} games.</p>
      )}
      {allUpcomingEmpty && (
        <p className="text-center italic dark:text-white">No upcoming games.</p>
      )}
      <div className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <ul className="overflow-y-auto max-h-72 space-y-3">
          {byStatus.map((game) => {
            const { _id, opponent, dateObj, status, time, formation } = game;

            const monthDay = dateObj.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            });
            const [h, m] = time.split(":").map((n) => parseInt(n, 10));
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

            // Color classes for card backgrounds
            let cardBg =
              status === "PENDING"
                ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30"
                : status === "CONFIRMED"
                ? "bg-green-50 border-green-300 dark:bg-green-900/30"
                : "bg-red-50 border-red-300 dark:bg-red-900/30";
            let borderColor =
              status === "PENDING"
                ? "border-yellow-400"
                : status === "CONFIRMED"
                ? "border-green-400"
                : "border-red-400";
            let icon =
              status === "PENDING"
                ? faClock
                : status === "CONFIRMED"
                ? faCheck
                : faTimes;

            return (
              <li key={_id}>
                <Link
                  to={`/game-schedule/${_id}`}
                  className={`flex flex-col justify-between items-start p-2 rounded-xl border shadow transition hover:border-blue-400 hover:shadow-lg hover:no-underline cursor-pointer ${cardBg} ${borderColor}`}
                  style={{ borderWidth: 2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FontAwesomeIcon icon={icon} className={`text-lg ${status === "PENDING" ? "text-yellow-500" : status === "CONFIRMED" ? "text-green-500" : "text-red-500"}`} />
                    <p className="font-semibold text-base">{monthDay}</p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    {timeStr} <span className="font-medium">vs. {opponent}</span>
                  </p>
                  {formation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-1">
                      Formation: {formation.formationType.slice(2)}
                    </p>
                  )}
                  <div className="flex items-center justify-between w-full mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        status === "PENDING"
                          ? "bg-yellow-200 text-yellow-900"
                          : status === "CONFIRMED"
                          ? "bg-green-200 text-green-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {status[0] + status.slice(1).toLowerCase()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 font-semibold animate-pulse select-none">
                      <FontAwesomeIcon icon={faArrowRight} className="text-base" />
                      Click for details
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

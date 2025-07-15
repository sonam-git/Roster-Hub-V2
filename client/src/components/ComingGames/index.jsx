// src/components/ComingGames.jsx
import React, { useContext, useState, useMemo } from "react";
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
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";

const STATUS_FILTERS = [
  { key: "PENDING", label: <FontAwesomeIcon icon={faClock} /> },
  { key: "CONFIRMED", label: <FontAwesomeIcon icon={faCheck} /> },
  { key: "CANCELLED", label: <FontAwesomeIcon icon={faTimes} /> },
];

export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const client = useApolloClient();
  const [filter, setFilter] = useState("PENDING");

  // Query games
  const { loading, error, data } = useQuery(QUERY_GAMES);

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

  const byStatus = useMemo(
    () => upcoming.filter((g) => g.status === filter),
    [upcoming, filter]
  );

  if (loading) return <p>Loading upcoming games…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (upcoming.length === 0)
    return <p className="text-center italic">No upcoming games.</p>;

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <p className="text-xs text-center mb-2">
        Select the button to see the game and its status.
      </p>

      {/* Status filter */}
      <div className="flex justify-between mb-4 gap-2">
        {STATUS_FILTERS.map((opt) => {
          const active = opt.key === filter;
          const base =
            active
              ? opt.key === "PENDING"
                ? "bg-orange-500 text-white shadow-md"
                : opt.key === "CONFIRMED"
                ? "bg-green-500 text-white shadow-md"
                : "bg-red-500 text-white shadow-md"
              : isDarkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-200 text-gray-800";
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`${base} text-xs px-4 py-1 rounded-full transition font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
              style={{ minWidth: 40 }}
            >
              {opt.label}
              <span className="ml-1 capitalize">{opt.key.toLowerCase()}</span>
            </button>
          );
        })}
      </div>
      { byStatus.length === 0 &&
        <p className="text-center italic text-sm">No {filter.toLowerCase()} games.</p>}
      <ul className="overflow-y-auto max-h-40 space-y-3">
        {byStatus.map((game) => {
          const { _id, opponent, dateObj, status, time, formation, address, venue } = game;
          const monthDay = dateObj.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
          });
          const [h, m] = time.split(":").map((n) => parseInt(n, 10));
          const hour12 = ((h + 11) % 12) + 1;
          const ampm = h >= 12 ? "PM" : "AM";
          const timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
          // Color classes for card and badge
          let cardBorder = "";
          let cardBg = "";
          let badgeBg = "";
          let badgeText = "";
          if (status === "PENDING") {
            cardBorder = "border-l-4 border-orange-500";
            cardBg = isDarkMode ? "bg-orange-900/30" : "bg-orange-50";
            badgeBg = "bg-orange-500";
            badgeText = "text-white";
          } else if (status === "CONFIRMED") {
            cardBorder = "border-l-4 border-green-500";
            cardBg = isDarkMode ? "bg-green-900/30" : "bg-green-50";
            badgeBg = "bg-green-500";
            badgeText = "text-white";
          } else {
            cardBorder = "border-l-4 border-red-500";
            cardBg = isDarkMode ? "bg-red-900/30" : "bg-red-50";
            badgeBg = "bg-red-500";
            badgeText = "text-white";
          }
          return (
            <li key={_id}>
              <Link
                to={`/game-schedule/${_id}`}
                className={`flex flex-col justify-between items-start p-3 rounded-lg hover:bg-indigo-200 dark:hover:bg-gray-700 hover:no-underline transition shadow-sm ${cardBorder} ${cardBg}`}
              >
                <div>
                  <p className="font-medium text-base">{monthDay}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {timeStr} vs. {opponent}
                  </p>
                  {venue && (
                    <p className="text-xs text-blue-500 dark:text-blue-300 mt-1 truncate max-w-xs sm:max-w-sm md:max-w-md" title={venue}>
                      <span className="font-semibold text-blue-400 dark:text-blue-500">Venue:</span> {venue}
                    </p>
                  )}
                  {address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs sm:max-w-sm md:max-w-md" title={address}>
                      <span className="font-semibold text-gray-400 dark:text-gray-500">Address:</span> {address}
                    </p>
                  )}
                  {formation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                      Formation: {formation.formationType}
                    </p>
                  )}
                </div>
                <span
                  className={`self-end px-3 py-1 rounded-full text-xs mt-2 font-bold shadow ${badgeBg} ${badgeText}`}
                  style={{ letterSpacing: 1 }}
                >
                  {status[0] + status.slice(1).toLowerCase()}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

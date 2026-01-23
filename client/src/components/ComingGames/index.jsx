// src/components/ComingGames.jsx
import React, { useContext, useMemo, useEffect } from "react";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { Link } from "react-router-dom";
import { QUERY_FORMATION, QUERY_GAMES } from "../../utils/queries";
import Spinner from "../Spinner";
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
import { useOrganization } from "../../contexts/OrganizationContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faClock } from "@fortawesome/free-solid-svg-icons";



export default function ComingGames() {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const client = useApolloClient();

  // Query games with organization context
  const { loading, error, data, refetch } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);

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

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner size="sm" />;
  }

  // Group games by status
  const grouped = {
    PENDING: [],
    CONFIRMED: [],
    CANCELLED: [],
    COMPLETED: [],
  };
  upcoming.forEach((g) => {
    if (grouped[g.status]) grouped[g.status].push(g);
  })

  if (loading) return <p>Loading upcoming games…</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (upcoming.length === 0) {
    return (
      <div className="w-full py-8 ">
        <div className={`rounded-2xl shadow-xl border p-10 text-center backdrop-blur-sm ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border-gray-600' 
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-gray-200'
        }`}>
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${
            isDarkMode 
              ? 'text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' 
              : 'text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
          }`}>
            No Upcoming Games
          </h3>
          <p className={`text-base mb-6 leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No games scheduled at the moment. Check back soon for new matches!
          </p>
          <div className={`flex items-center justify-center gap-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>New games will appear here once scheduled</span>
          </div>
        </div>
      </div>
    );
  }

  // Column config
  const columns = [
    { key: "PENDING", label: "Pending", icon: faClock, color: "orange" },
    { key: "CONFIRMED", label: "Confirmed", icon: faCheck, color: "green" },
    { key: "CANCELLED", label: "Cancelled", icon: faTimes, color: "red" },
    { key: "COMPLETED", label: "Completed", icon: faCheck, color: "blue" },
  ];

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col">
            <div
              className={`flex items-center gap-2 mb-2 font-bold text-lg ${
                col.color === "orange"
                  ? "text-orange-500"
                  : col.color === "green"
                  ? "text-green-500"
                  : col.color === "red"
                  ? "text-red-500"
                  : "text-blue-500"
              }`}
            >
              <FontAwesomeIcon icon={col.icon} />
              <span>{col.label}</span>
            </div>
            {grouped[col.key].length === 0 ? (
              <span className="italic text-gray-400">No {col.label} games</span>
            ) : (
              <ul className="space-y-3">
                {grouped[col.key].map((game) => {
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
                  } else if (status === "CANCELLED") {
                    cardBorder = "border-l-4 border-red-500";
                    cardBg = isDarkMode ? "bg-red-900/30" : "bg-red-50";
                    badgeBg = "bg-red-500";
                    badgeText = "text-white";
                  } else {
                    cardBorder = "border-l-4 border-blue-500";
                    cardBg = isDarkMode ? "bg-blue-900/30" : "bg-blue-50";
                    badgeBg = "bg-blue-500";
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

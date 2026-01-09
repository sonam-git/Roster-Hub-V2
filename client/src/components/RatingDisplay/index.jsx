// src/components/RatingDisplay.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { StarIcon as SolidStar } from "@heroicons/react/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { QUERY_PROFILES } from "../../utils/queries";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function RatingDisplay({ limit = 10 }) {
  const { currentOrganization } = useOrganization();
  
  const { loading, error, data } = useQuery(QUERY_PROFILES, {
    variables: { 
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization,
  });

  // Loading state for organization
  if (!currentOrganization) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading organization...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading top ratings…
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading ratings: {error.message}
      </div>
    );
  }

  const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
  if (profiles.length === 0) {
    return (
      <div className="text-center italic p-8 text-gray-500 dark:text-gray-400">
        No players rated yet in this organization.
      </div>
    );
  }

  // Filter out profiles with missing _id or name
  const validProfiles = profiles.filter((p) => p._id && p.name);

  // Sort by average rating (highest first), then by name
  const sortedProfiles = [...validProfiles].sort((a, b) => {
    const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return a.name.localeCompare(b.name);
  });

  // Apply limit if specified
  const displayProfiles = limit ? sortedProfiles.slice(0, limit) : sortedProfiles;

  // Group profiles by rounded rating
  const grouped = {
    5: [],
    4: [],
    3: [],
    2: [],
    unrated: [],
  };
  displayProfiles.forEach((p) => {
    const stars = Math.round(p.averageRating);
    if (stars >= 5) grouped[5].push(p);
    else if (stars === 4) grouped[4].push(p);
    else if (stars === 3) grouped[3].push(p);
    else if (stars === 2) grouped[2].push(p);
    else grouped.unrated.push(p);
  });

  const columns = [
    { label: "5 Stars", stars: 5, players: grouped[5] },
    { label: "4 Stars", stars: 4, players: grouped[4] },
    { label: "3 Stars", stars: 3, players: grouped[3] },
    { label: "2 Stars", stars: 2, players: grouped[2] },
    { label: "Not Rated Yet", stars: 0, players: grouped.unrated },
  ];

  return (
    <div className="w-full overflow-x-auto">
      {/* Top Players Summary */}
      {displayProfiles.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
          <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
            <SolidStar className="h-6 w-6 text-yellow-500" />
            Top {Math.min(limit, displayProfiles.length)} Players
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {displayProfiles.slice(0, 5).map((player, index) => (
              <Link
                key={player._id}
                to={`/profiles/${player._id}`}
                className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-yellow-400 dark:hover:border-yellow-500"
              >
                {/* Rank Badge */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-800' :
                  'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                  #{index + 1}
                </div>
                
                {/* Profile Picture */}
                <div className="relative mb-2">
                  <img
                    src={player.profilePic || ProfileAvatar}
                    alt={player.name}
                    className="w-16 h-16 rounded-full border-4 border-yellow-400 dark:border-yellow-600 object-cover"
                  />
                  {/* Rating Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full px-2 py-0.5 shadow-lg border-2 border-white dark:border-gray-800 flex items-center gap-1">
                    <SolidStar className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">
                      {player.averageRating ? player.averageRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                
                {/* Name */}
                <span className="text-sm font-bold text-gray-800 dark:text-white text-center line-clamp-2">
                  {player.name}
                </span>
                
                {/* Position */}
                {player.position && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {player.position}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Players Grouped by Star Rating */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {columns.map((col) => (
          <div
            key={col.label}
            className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow p-4 border-2 border-blue-200 dark:border-gray-700 min-w-[180px]"
          >
            <div className="flex flex-col items-center mb-2">
              <span className="font-bold text-base dark:text-white mb-1">
                {col.label}
              </span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < col.stars ? (
                    <SolidStar key={i} className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <OutlineStar key={i} className="h-5 w-5 text-gray-300" />
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              {col.players.length === 0 ? (
                <span className="italic text-gray-400">No players</span>
              ) : (
                col.players
                  .filter((p) => p._id && p.name)
                  .map((p) => (
                    <Link
                      key={p._id}
                      to={`/profiles/${p._id}`}
                      className="hover:text-blue-300 hover:no-underline flex flex-col items-center transition-transform hover:scale-105"
                    >
                      <div className="relative">
                        <img
                          src={p.profilePic || ProfileAvatar}
                          alt={p.name}
                          className="w-12 h-12 rounded-full mb-1 border-2 border-gray-300 dark:border-gray-700 object-cover"
                        />
                        {/* Small rating badge */}
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 dark:bg-yellow-600 rounded-full px-1.5 py-0.5 shadow-md border border-white dark:border-gray-800">
                          <span className="text-[10px] font-bold text-white">
                            {p.averageRating ? p.averageRating.toFixed(1) : '0'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs dark:text-white text-center break-words max-w-[80px] line-clamp-2">
                        {p.name}
                      </span>
                      {p.position && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {p.position}
                        </span>
                      )}
                    </Link>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

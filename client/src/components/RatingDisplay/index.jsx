// src/components/RatingDisplay.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { StarIcon as SolidStar } from "@heroicons/react/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { QUERY_PROFILES } from "../../utils/queries";

export default function RatingDisplay() {
  const { loading, error, data } = useQuery(QUERY_PROFILES);

  if (loading) return <div>Loading top ratings…</div>;
  if (error) return <div className="text-red-500">Error loading ratings.</div>;

  const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
  if (profiles.length === 0) {
    return <div className="text-center italic">No ratings yet.</div>;
  }

  // Group profiles by rounded rating
  const grouped = {
    5: [],
    4: [],
    3: [],
    2: [],
    unrated: [],
  };
  profiles.forEach((p) => {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {columns.map((col) => (
          <div key={col.label} className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow p-4 border-2 border-blue-200 dark:border-gray-700 min-w-[180px]">
            <div className="flex flex-col items-center mb-2">
              <span className="font-bold text-base dark:text-white mb-1">{col.label}</span>
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
                col.players.map((p) => (
                  <Link
                    key={p._id}
                    to={`/profiles/${p._id}`}
                    className="hover:text-blue-300 hover:no-underline flex flex-col items-center"
                  >
                    <img
                      src={p.profilePic || ProfileAvatar}
                      alt={p.name}
                      className="w-12 h-12 rounded-full mb-1 border border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-xs dark:text-white text-center break-words max-w-[80px]">{p.name}</span>
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

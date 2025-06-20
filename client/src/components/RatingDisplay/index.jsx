// src/components/RatingDisplay.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { StarIcon as SolidStar } from "@heroicons/react/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import ProfileAvatar from "../../assets/images/profile-avatar.png";

import { QUERY_PROFILES } from "../../utils/queries";

export default function RatingDisplay({ limit = 8 }) {
  const { data, loading, error } = useQuery(QUERY_PROFILES);
  if (loading) return <div>Loading top ratings…</div>;
  if (error) return <div>Error!</div>;

  // grab and sort by averageRating desc
  const top = [...data.profiles]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return (
    <div className="flex space-x-8 overflow-x-auto px-6 bg-gray-200 dark:bg-gray-600 p-4 rounded-xl shadow-md">
      {top.map((p) => {
        // round to nearest whole star
        const stars = Math.round(p.averageRating);
        return (
          <div key={p._id} className="flex flex-col items-center">
            <Link
              className={` hover:no-underline hover:text-blue-500   `}
              to={`/profiles/${p._id}`}
            >
              <img
                src={p.profilePic || ProfileAvatar}
                alt={p.name}
                className="w-12 h-12 rounded-full mb-1"
              />
              <span className="text-xs">{p.name}</span>
            </Link>
            <div className="flex mt-1">
              {Array.from({ length: 5 }).map((_, i) =>
                i < stars ? (
                  <SolidStar key={i} className="h-5 w-5 text-yellow-600" />
                ) : (
                  <OutlineStar key={i} className="h-5 w-5 text-gray-300" />
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

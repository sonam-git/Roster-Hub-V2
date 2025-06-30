// src/components/RatingDisplay.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { StarIcon as SolidStar } from "@heroicons/react/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/outline";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { QUERY_PROFILES } from "../../utils/queries";

export default function RatingDisplay({ limit = 8 }) {
  const { loading, error, data } = useQuery(QUERY_PROFILES);

  if (loading) return <div>Loading top ratings…</div>;
  if (error) return <div className="text-red-500">Error loading ratings.</div>;

  // safely grab the array (or default to [])
  const profiles = Array.isArray(data?.profiles) ? data.profiles : [];

  if (profiles.length === 0) {
    return <div className="text-center italic">No ratings yet.</div>;
  }

  const top = [...profiles]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return (
    <>
      <h2 className="text-center lg:text-left font-bold text-lg mb-2">
        Top Ratings
      </h2>

      <div className="flex space-x-4 overflow-x-auto p-4 bg-gray-100 dark:bg-gray-600 rounded-xl shadow-md">
        {top.map((p) => {
          const stars = Math.round(p.averageRating);
          return (
            <div key={p._id} className="flex flex-col items-center">
              <Link
                to={`/profiles/${p._id}`}
                className="hover:text-blue-300 hover:no-underline"
              >
                <img
                  src={p.profilePic || ProfileAvatar}
                  alt={p.name}
                  className="w-12 h-12 rounded-full mb-1"
                />
                <span className="text-xs ">{p.name}</span>
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
    </>
  );
}

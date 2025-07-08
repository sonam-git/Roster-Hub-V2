// src/pages/Score.jsx
import React, { useState, useEffect } from "react";
import Scoreboard from "../components/ScoreBoard";

// a little lookup for all the leagues we support:
const ALL_LEAGUES = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "CL", name: "Champions League" },
  { code: "EL", name: "Europa League" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
];

export default function Score() {
  // load from localStorage so favorites stick across reloads:
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favLeagues")) || [];
    } catch {
      return [];
    }
  });

  // persist changes:
  useEffect(() => {
    localStorage.setItem("favLeagues", JSON.stringify(favorites));
  }, [favorites]);

  // toggle presence in favorites
  const toggleFav = (code) => {
    setFavorites((favs) =>
      favs.includes(code)
        ? favs.filter((c) => c !== code)
        : [...favs, code]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 ">
      {/* My Favorites */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-4  ">
        <h2 className="font-bold text-lg mb-2 dark:text-white ">My Favorite Leagues</h2>
        {favorites.length ? (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((code) => {
              const league = ALL_LEAGUES.find((l) => l.code === code);
              return (
                <Scoreboard
                  key={code}
                  competitionCode={code}
                  title={league?.name || code}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-white">You haven’t added any yet.</p>
        )}
      </div>

      {/* All Leagues List with Add/Remove buttons */}
      <div className="bg-gray-100 dark:bg-gray-500 rounded-lg shadow p-4">
        <h2 className="font-bold text-lg mb-2 dark:text-white">League Lists</h2>
        <ul className="space-y-2">
          {ALL_LEAGUES.map(({ code, name }) => {
            const isFav = favorites.includes(code);
            return (
              <li
                key={code}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="dark:text-white">{name}</span>
                <button
                  onClick={() => toggleFav(code)}
                  className={
                    (isFav
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 dark:bg-gray-600 hover:bg-blue-600") +
                    " text-white px-3 py-1 rounded"
                  }
                >
                  {isFav ? "Remove" : "Add to Favorites"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

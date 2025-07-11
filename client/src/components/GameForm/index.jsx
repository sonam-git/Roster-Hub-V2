import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";

const GameForm = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const [formState, setFormState] = useState({
    date: "",
    time: "",
    venue: "",
    notes: "",
    opponent: "",
  });

  const [createGame, { loading, error }] = useMutation(CREATE_GAME, {
    update(cache, { data: { createGame } }) {
      try {
        const existing = cache.readQuery({ query: QUERY_GAMES }) || { games: [] };
        cache.writeQuery({
          query: QUERY_GAMES,
          data: { games: [createGame, ...existing.games] },
        });
      } catch (e) {
        console.error("Error updating cache after creating game", e);
      }
    },
    optimisticResponse: ({ input }) => {
      const user = Auth.getProfile().data;
      return {
        createGame: {
          __typename: "Game",
          _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
          creator: {
            __typename: "Profile",
            _id: user._id,
            name: user.name,
          },
          date: input.date,
          time: input.time,
          venue: input.venue,
          notes: input.notes,
          opponent: input.opponent,
          score: "0 - 0",
          result: "NOT_PLAYED",
          status: "PENDING",
          availableCount: 0,
          unavailableCount: 0,
        },
      };
    },
    refetchQueries: [{ query: QUERY_GAMES }],
    awaitRefetchQueries: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, time, venue, notes, opponent } = formState;
    if (!date || !time || !venue || !opponent) {
      return alert("Date, time, venue and opponent are required");
    }
    try {
      const { data } = await createGame({
        variables: { input: { date, time, venue, notes, opponent } },
      });
      navigate(`/game-schedule/${data.createGame._id}`);
    } catch (err) {
      console.error("Create game failed", err);
    }
  };

  return (
    <div
      className={`max-w-lg mx-auto p-4 rounded-xl shadow-xl border-2 transition-all duration-300
      ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-gray-200" : "bg-gradient-to-br from-white via-blue-50 to-blue-100 border-blue-200 text-gray-800"}
    `}
    >
      <h2 className={`text-3xl text-center font-extrabold mb-6 tracking-tight drop-shadow-lg ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
      ⚽️ Schedule a Game ⚽️
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <label className={`text-sm font-semibold ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all
              ${isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white border-blue-300"}
            `}
            required
          />
        </label>
        {/* Time */}
        <label className={`text-sm font-semibold ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
          Time
          <input
            type="time"
            name="time"
            value={formState.time}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all
              ${isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white border-blue-300"}
            `}
            required
          />
        </label>
      </div>
        {/* Venue */}
        <label className={`text-sm font-semibold w-full block ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
          Venue
          <input
            type="text"
            name="venue"
            value={formState.venue}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all
              ${isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white border-blue-300"}
            `}
            placeholder="e.g. Central Park Field #3"
            required
          />
        </label>
        {/* Opponent */}
        <label className={`text-sm font-semibold w-full block ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
          Opponent
          <input
            type="text"
            name="opponent"
            value={formState.opponent}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all
              ${isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white border-blue-300"}
            `}
            placeholder="e.g. Rockets FC"
            required
          />
        </label>
        {/* Notes */}
        <label className={`italic text-sm font-medium w-full block ${isDarkMode ? "text-blue-100" : "text-blue-600"}`}>
          Special Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all
              ${isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white border-blue-300"}
            `}
            placeholder="Any additional details…"
            rows={3}
          />
        </label>
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full py-2 rounded-lg font-bold shadow-lg transition-all duration-200
            ${isDarkMode ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-500 text-white hover:bg-blue-700"}
            disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400`
          }
        >
          {loading ? "Scheduling…" : "Schedule Game"}
        </button>
        {error && <p className="text-red-600 mt-2">Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default GameForm;

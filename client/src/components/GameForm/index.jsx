// src/components/GameForm.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";

const GameForm = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const [formState, setFormState] = useState({
    date: "",
    time: "",
    venue: "",
    notes: "",
  });

  const [createGame, { loading, error }] = useMutation(CREATE_GAME, {
    update(cache, { data: { createGame } }) {
      try {
        const existing = cache.readQuery({
          query: QUERY_GAMES,
          variables: { status: "PENDING" },
        });
        if (existing) {
          cache.writeQuery({
            query: QUERY_GAMES,
            variables: { status: "PENDING" },
            data: {
              games: [createGame, ...existing.games],
            },
          });
        }
      } catch {
        console.error("Error updating cache after creating game");
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, time, venue, notes } = formState;
    if (!date || !time || !venue) {
      return alert("Date, time, and venue are required");
    }
    try {
      const { data } = await createGame({
        variables: {
          input: { date, time, venue, notes },
        },
      });
      navigate(`/game-schedule/${data.createGame._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`max-w-lg mx-auto p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${
          isDarkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        Schedule a Game
      </h2>
      <form onSubmit={handleSubmit}>
        <label
          className={`block mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded ${
              isDarkMode
                ? "dark:bg-gray-700 dark:text-gray-200 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            required
          />
        </label>
        <label
          className={`block mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Time
          <input
            type="time"
            name="time"
            value={formState.time}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded ${
              isDarkMode
                ? "dark:bg-gray-700 dark:text-gray-200 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            required
          />
        </label>
        <label
          className={`block mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Venue
          <input
            type="text"
            name="venue"
            value={formState.venue}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded ${
              isDarkMode
                ? "dark:bg-gray-700 dark:text-gray-200 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            placeholder="e.g. Central Park Field #3"
            required
          />
        </label>
        <label
          className={`block mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Special Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded ${
              isDarkMode
                ? "dark:bg-gray-700 dark:text-gray-200 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            placeholder="Any additional details…"
            rows={3}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full py-2 rounded hover:opacity-90 disabled:opacity-50 ${
            isDarkMode
              ? "bg-blue-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Scheduling…" : "Schedule Game"}
        </button>
        {error && (
          <p className="text-red-600 mt-2">
            Error: {error.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default GameForm;

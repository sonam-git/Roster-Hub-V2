import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { QUERY_GAMES } from "../../utils/queries";

const GameForm = () => {
  const navigate = useNavigate();
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
          input: { date, time, venue, notes }, // pass raw "YYYY-MM-DD"
        },
      });
      // Navigate to /game-schedule/:newGameId
      navigate(`/game-schedule/${data.createGame._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Schedule a Game
      </h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-gray-200"
            required
          />
        </label>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Time
          <input
            type="time"
            name="time"
            value={formState.time}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-gray-200"
            required
          />
        </label>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Venue
          <input
            type="text"
            name="venue"
            value={formState.venue}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-gray-200"
            placeholder="e.g. Central Park Field #3"
            required
          />
        </label>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Special Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-gray-200"
            placeholder="Any additional details…"
            rows={3}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Scheduling…" : "Schedule Game"}
        </button>
        {error && (
          <p className="text-red-600 mt-2">Error: {error.message}</p>
        )}
      </form>
    </div>
  );
};

export default GameForm;

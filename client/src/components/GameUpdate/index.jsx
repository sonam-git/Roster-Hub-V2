import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";

const GameUpdate = ({
  gameId,
  initialDate,
  initialTime,
  initialVenue,
  initialNotes,
  initialOpponent,
  onClose,
  isDarkMode,
}) => {
  const [formState, setFormState] = useState({
    date: initialDate || "",
    time: initialTime || "",
    venue: initialVenue || "",
    notes: initialNotes || "",
    opponent: initialOpponent || "",
  });

  const [updateGame, { loading, error }] = useMutation(UPDATE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME,  variables: { gameId } },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setFormState(prev => ({ ...prev, notes: "" }));
      onClose();
    },
  });

  useEffect(() => {
    setFormState({
      date: initialDate || "",
      time: initialTime || "",
      venue: initialVenue || "",
      notes: initialNotes || "",
      opponent: initialOpponent || "",
    });
  }, [initialDate, initialTime, initialVenue, initialNotes, initialOpponent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = {};
    if (formState.date     !== initialDate)    input.date     = formState.date;
    if (formState.time     !== initialTime)    input.time     = formState.time;
    if (formState.venue    !== initialVenue)   input.venue    = formState.venue;
    if (formState.notes    !== initialNotes)   input.notes    = formState.notes;
    if (formState.opponent !== initialOpponent)input.opponent = formState.opponent;

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

    try {
      await updateGame({ variables: { gameId, input } });
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-50">
      <div
        className={`p-6 rounded-lg shadow-lg w-11/12 max-w-md ${
          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Update Game Info</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <span className="font-bold">Date</span>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded text-black"
            />
          </label>
          <label className="block mb-2">
            <span className="font-bold">Time</span>
            <input
              type="time"
              name="time"
              value={formState.time}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded text-black"
            />
          </label>
          <label className="block mb-2">
            <span className="font-bold">Venue</span>
            <input
              type="text"
              name="venue"
              value={formState.venue}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded text-black"
              placeholder="e.g. Central Park Field #3"
            />
          </label>
          <label className="block mb-2">
            <span className="font-bold">Opponent</span>
            <input
              type="text"
              name="opponent"
              value={formState.opponent}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded text-black"
              placeholder="e.g. Rockets FC"
            />
          </label>
          <label className="block mb-4">
            <span className="font-bold">Notes</span>
            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded text-black"
              rows={3}
            />
          </label>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update Game"}
            </button>
          </div>
          {error && <p className="text-red-600 mt-3">Error: {error.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default GameUpdate;

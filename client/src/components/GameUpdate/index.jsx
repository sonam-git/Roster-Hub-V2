import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import { useOrganization } from "../../contexts/OrganizationContext";

const GameUpdate = ({
  gameId,
  initialDate,
  initialTime,
  initialVenue,
  initialCity,
  initialNotes,
  initialOpponent,
  initialJerseyColor,
  onClose,
  isDarkMode,
}) => {
  const { currentOrganization } = useOrganization();
  const [formState, setFormState] = useState({
    date: initialDate || "",
    time: initialTime || "",
    venue: initialVenue || "",
    city: initialCity || "",
    notes: initialNotes || "",
    opponent: initialOpponent || "",
    jerseyColor: initialJerseyColor || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [updateGame, { loading, error }] = useMutation(UPDATE_GAME, {
    refetchQueries: [
      { 
        query: QUERY_GAME, 
        variables: { 
          gameId,
          organizationId: currentOrganization?._id 
        } 
      },
      { 
        query: QUERY_GAMES, 
        variables: { 
          organizationId: currentOrganization?._id 
        } 
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setShowSuccess(true);
      // Auto-hide success message and close after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          onClose();
        }, 300); // Small delay for fade out animation
      }, 3000);
    },
  });

  useEffect(() => {
    setFormState({
      date: initialDate || "",
      time: initialTime || "",
      venue: initialVenue || "",
      city: initialCity || "",
      notes: initialNotes || "",
      opponent: initialOpponent || "",
      jerseyColor: initialJerseyColor || "",
    });
  }, [initialDate, initialTime, initialVenue, initialCity, initialNotes, initialOpponent, initialJerseyColor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = {};
    const updatedFields = [];
    
    // Field name mapping for user-friendly display
    const fieldLabels = {
      date: 'Date',
      time: 'Time',
      venue: 'Venue',
      city: 'City',
      notes: 'Notes',
      opponent: 'Opponent Team',
      jerseyColor: 'Jersey Color'
    };
    
    if (formState.date     !== initialDate)    {
      input.date     = formState.date;
      updatedFields.push(fieldLabels.date);
    }
    if (formState.time     !== initialTime)    {
      input.time     = formState.time;
      updatedFields.push(fieldLabels.time);
    }
    if (formState.venue    !== initialVenue)   {
      input.venue    = formState.venue;
      updatedFields.push(fieldLabels.venue);
    }
    if (formState.city     !== initialCity)    {
      input.city     = formState.city;
      updatedFields.push(fieldLabels.city);
    }
    if (formState.notes    !== initialNotes)   {
      input.notes    = formState.notes;
      updatedFields.push(fieldLabels.notes);
    }
    if (formState.opponent !== initialOpponent){
      input.opponent = formState.opponent;
      updatedFields.push(fieldLabels.opponent);
    }
    if (formState.jerseyColor !== initialJerseyColor) {
      input.jerseyColor = formState.jerseyColor;
      updatedFields.push(fieldLabels.jerseyColor);
    }

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

    // Create success message
    let message = "The ";
    if (updatedFields.length === 1) {
      message += `${updatedFields[0]} has been updated successfully!`;
    } else if (updatedFields.length === 2) {
      message += `${updatedFields[0]} and ${updatedFields[1]} have been updated successfully!`;
    } else {
      const lastField = updatedFields.pop();
      message += `${updatedFields.join(', ')}, and ${lastField} have been updated successfully!`;
    }
    setSuccessMessage(message);

    if (!currentOrganization) {
      console.error('No organization selected');
      alert('Please select an organization to update the game.');
      return;
    }

    try {
      await updateGame({ 
        variables: { 
          gameId, 
          input,
          organizationId: currentOrganization._id
        } 
      });
    } catch (e) {
      console.error("Update failed", e);
      alert('Failed to update game. Please try again.');
    }
  };

  return (
    <div className="w-full relative">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              📅 <span>Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              ⏰ <span>Time</span>
            </label>
            <input
              type="time"
              name="time"
              value={formState.time}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Venue & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              🏟️ <span>Venue</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formState.venue}
              onChange={handleChange}
              placeholder="Central Park Field #3"
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              🌍 <span>City</span>
            </label>
            <input
              type="text"
              name="city"
              value={formState.city}
              onChange={handleChange}
              placeholder="New York"
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Opponent  */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            🏃‍♂️ <span>Opponent Team</span>
          </label>
          <input
            type="text"
            name="opponent"
            value={formState.opponent}
            onChange={handleChange}
            placeholder="Rockets FC"
            className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
        {/* Jersey Color */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            👕 <span>Jersey Color</span>
          </label>
          <input
            type="text"
            name="jerseyColor"
            value={formState.jerseyColor}
            onChange={handleChange}
            placeholder="Red and White"
            className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
</div>
        {/* Notes */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            📝 <span>Additional Notes</span>
          </label>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            placeholder="Add any special instructions, equipment needed, or other important details..."
            rows={4}
            className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 animate-fade-in shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-green-800 dark:text-green-300 font-bold text-base mb-1">
                  Update Successful!
                </h4>
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                  {successMessage}
                </p>
                <p className="text-green-600 dark:text-green-500 text-xs mt-2">
                  All players have been notified about the changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-sm mt-0.5">⚠️</span>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span className="text-lg">✅</span>
                <span>Update Game</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameUpdate;

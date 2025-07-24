import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import { filterCities } from "../../utils/usCities";
import Auth from "../../utils/auth";

const GameForm = ({ onGameCreated, onBackToGames }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const [formState, setFormState] = useState({
    date: "",
    time: "",
    venue: "",
    city: "",
    notes: "",
    opponent: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // City autocomplete state
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const cityInputRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Handle clicking outside city dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target) &&
        !cityInputRef.current?.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    refetchQueries: [{ query: QUERY_GAMES }],
    awaitRefetchQueries: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Handle city autocomplete
    if (name === 'city') {
      const suggestions = filterCities(value);
      setCitySuggestions(suggestions);
      setShowCitySuggestions(suggestions.length > 0 && value.length >= 2);
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCitySelect = (selectedCity) => {
    setFormState(prev => ({ ...prev, city: selectedCity }));
    setShowCitySuggestions(false);
    setCitySuggestions([]);
    
    // Clear validation error
    if (validationErrors.city) {
      setValidationErrors(prev => ({ ...prev, city: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const { date, time, venue, city, opponent } = formState;

    if (!date) errors.date = "Date is required";
    if (!time) errors.time = "Time is required";
    if (!venue.trim()) errors.venue = "Venue is required";
    if (!city.trim()) errors.city = "City is required";
    if (!opponent.trim()) errors.opponent = "Opponent is required";

    // Check if date is in the past
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const { date, time, venue, city, notes, opponent } = formState;
    
    try {
      const { data } = await createGame({
        variables: { input: { date, time, venue, city, notes, opponent } },
      });
      
      // Reset form on success
      setFormState({
        date: "",
        time: "",
        venue: "",
        city: "",
        notes: "",
        opponent: "",
      });
      
      // If onGameCreated callback is provided, call it instead of navigating
      if (onGameCreated) {
        onGameCreated(data.createGame);
      } else {
        navigate(`/game-schedule/${data.createGame._id}`);
      }
    } catch (err) {
      console.error("Create game failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`w-full p-8 rounded-2xl shadow-2xl border transition-all duration-300
      ${isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border-gray-600 text-gray-100" 
        : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-blue-200 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
          <span className="text-2xl">⚽</span>
        </div>
        <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Schedule New Game
        </h2>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Fill in the details to create a new game for your team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Field */}
          <div className="space-y-2">
            <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <span className="mr-2">📅</span>
              Game Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                ${validationErrors.date 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              required
            />
            {validationErrors.date && (
              <p className="text-red-500 text-xs flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.date}
              </p>
            )}
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <span className="mr-2">🕐</span>
              Game Time
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formState.time}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                ${validationErrors.time 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              required
            />
            {validationErrors.time && (
              <p className="text-red-500 text-xs flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.time}
              </p>
            )}
          </div>
        </div>

        {/* Venue and City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Venue Field */}
          <div className="space-y-2">
            <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <span className="mr-2">📍</span>
              Venue
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formState.venue}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                ${validationErrors.venue 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              placeholder="e.g. Central Park Field #3, Community Sports Center"
              required
            />
            {validationErrors.venue && (
              <p className="text-red-500 text-xs flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.venue}
              </p>
            )}
          </div>

          {/* City Field */}
          <div className="space-y-2 relative">
            <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <span className="mr-2">🏙️</span>
              City
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                ref={cityInputRef}
                type="text"
                name="city"
                value={formState.city}
                onChange={handleChange}
                onFocus={() => {
                  if (formState.city.length >= 2) {
                    const suggestions = filterCities(formState.city);
                    setCitySuggestions(suggestions);
                    setShowCitySuggestions(suggestions.length > 0);
                  }
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                  ${validationErrors.city 
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                    : isDarkMode 
                      ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                placeholder="e.g. New York, Los Angeles, Chicago"
                required
                autoComplete="off"
              />
              
              {/* City Suggestions Dropdown */}
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div
                  ref={cityDropdownRef}
                  className={`absolute z-50 w-full mt-1 border-2 rounded-xl shadow-lg max-h-48 overflow-y-auto
                    ${isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-gray-100" 
                      : "bg-white border-gray-300 text-gray-800"
                    }`}
                >
                  {citySuggestions.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-500 hover:text-white transition-colors duration-200 border-b border-opacity-10
                        ${isDarkMode ? "border-gray-600 hover:bg-blue-600" : "border-gray-200 hover:bg-blue-500"}
                        ${index === citySuggestions.length - 1 ? 'border-b-0' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🏙️</span>
                        <span className="font-medium">{city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.city && (
              <p className="text-red-500 text-xs flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.city}
              </p>
            )}
          </div>
        </div>

        {/* Opponent Field */}
        <div className="space-y-2">
          <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            <span className="mr-2">🥅</span>
            Opponent Team
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="opponent"
            value={formState.opponent}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
              ${validationErrors.opponent 
                ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                : isDarkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            placeholder="e.g. Rockets FC, Thunder United, City Rangers"
            required
          />
          {validationErrors.opponent && (
            <p className="text-red-500 text-xs flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.opponent}
            </p>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <label className={`flex items-center text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            <span className="mr-2">📝</span>
            Special Notes
            <span className={`ml-2 text-xs font-normal ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              (Optional)
            </span>
          </label>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none
              ${isDarkMode 
                ? "bg-gray-700 text-gray-100 border-gray-600 hover:border-gray-500" 
                : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            placeholder="Any additional details: dress code, equipment needed, transportation info..."
            rows={4}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <p className="text-red-700 text-sm font-medium">
                {error.message || "An error occurred while creating the game"}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`pt-6 ${onBackToGames ? 'flex gap-4' : ''}`}>
          {onBackToGames && (
            <button
              type="button"
              onClick={onBackToGames}
              className={`${onBackToGames ? 'flex-1' : 'w-full'} py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 
                ${isDarkMode 
                  ? "bg-gray-600 text-gray-100 hover:bg-gray-700 border border-gray-500" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                } 
                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2`}
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">←</span>
                Back to Games
              </span>
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className={`${onBackToGames ? 'flex-1' : 'w-full'} py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200
              ${(loading || isSubmitting)
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg`}
          >
            <span className="flex items-center justify-center">
              {(loading || isSubmitting) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Game...
                </>
              ) : (
                <>
                  <span className="mr-2">⚽</span>
                  Schedule Game
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;

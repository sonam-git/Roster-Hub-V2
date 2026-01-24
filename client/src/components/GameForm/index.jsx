import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_GAME } from "../../utils/mutations";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import { OrganizationContext } from "../../contexts/OrganizationContext";
import { filterCities } from "../../utils/usCities";
import Auth from "../../utils/auth";

const GameForm = ({ onGameCreated, onBackToGames }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useContext(OrganizationContext);

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
        const existing = cache.readQuery({ 
          query: QUERY_GAMES,
          variables: { organizationId: currentOrganization?._id }
        }) || { games: [] };
        cache.writeQuery({
          query: QUERY_GAMES,
          variables: { organizationId: currentOrganization?._id },
          data: { games: [createGame, ...existing.games] },
        });
      } catch (e) {
        console.error("Error updating cache after creating game", e);
      }
    },
    refetchQueries: [{ 
      query: QUERY_GAMES,
      variables: { organizationId: currentOrganization?._id }
    }],
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

    // Check if organization is selected
    if (!currentOrganization) {
      alert('Please select an organization first');
      return;
    }

    setIsSubmitting(true);
    const { date, time, venue, city, notes, opponent } = formState;
    
    try {
      const { data } = await createGame({
        variables: { 
          input: { date, time, venue, city, notes, opponent },
          organizationId: currentOrganization._id
        },
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
      if (err.message.includes('organization')) {
        alert('Organization access error: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`w-full p-6 rounded-lg border transition-colors duration-200 relative z-10
      ${isDarkMode 
        ? "bg-gray-800 border-gray-700" 
        : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Game Details
        </h2>
        <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Enter the information for the new game
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-20">
        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Field */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Game Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors cursor-pointer relative z-10
                ${validationErrors.date 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                    : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              required
            />
            {validationErrors.date && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.date}
              </p>
            )}
          </div>

          {/* Time Field */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Game Time
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formState.time}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors cursor-pointer relative z-10
                ${validationErrors.time 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                    : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              required
            />
            {validationErrors.time && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.time}
              </p>
            )}
          </div>
        </div>

        {/* Venue and City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Venue Field */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Venue
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formState.venue}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors relative z-10
                ${validationErrors.venue 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : isDarkMode 
                    ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                    : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              placeholder="Central Park Field #3"
              required
            />
            {validationErrors.venue && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.venue}
              </p>
            )}
          </div>

          {/* City Field */}
          <div className="space-y-1.5 relative">
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors relative z-10
                  ${validationErrors.city 
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                    : isDarkMode 
                      ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                      : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="New York"
                required
                autoComplete="off"
              />
              
              {/* City Suggestions Dropdown */}
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div
                  ref={cityDropdownRef}
                  className={`absolute z-[150] w-full mt-1 border rounded-md shadow-lg max-h-48 overflow-y-auto
                    ${isDarkMode 
                      ? "bg-gray-700 border-gray-600" 
                      : "bg-white border-gray-300"
                    }`}
                >
                  {citySuggestions.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCitySelect(city);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer
                        ${isDarkMode 
                          ? "hover:bg-gray-600 text-gray-100" 
                          : "hover:bg-gray-50 text-gray-900"
                        }
                        ${index < citySuggestions.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}
                      `}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.city && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.city}
              </p>
            )}
          </div>
        </div>

        {/* Opponent Field */}
        <div className="space-y-1.5">
          <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Opponent Team
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="opponent"
            value={formState.opponent}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors relative z-10
              ${validationErrors.opponent 
                ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                : isDarkMode 
                  ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                  : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Rockets FC"
            required
          />
          {validationErrors.opponent && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.opponent}
            </p>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-1.5">
          <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Additional Notes
            <span className={`ml-2 text-xs font-normal ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              (Optional)
            </span>
          </label>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors resize-none relative z-10
              ${isDarkMode 
                ? "bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500 focus:border-blue-500" 
                : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Any additional details about the game..."
            rows={3}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className={`p-3 rounded-md border ${
            isDarkMode 
              ? "bg-red-900/20 border-red-800 text-red-300" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <p className="text-sm">
              {error.message || "An error occurred while creating the game"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`pt-4 relative z-10 ${onBackToGames ? 'flex gap-3' : ''}`}>
          {onBackToGames && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBackToGames();
              }}
              className={`${onBackToGames ? 'flex-1' : 'w-full'} px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer active:scale-95
                ${isDarkMode 
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 active:bg-gray-500" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 active:bg-gray-100"
                } 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className={`${onBackToGames ? 'flex-1' : 'w-full'} px-4 py-2 text-sm font-medium text-white rounded-md transition-colors cursor-pointer active:scale-95
              ${(loading || isSubmitting)
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {(loading || isSubmitting) ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create Game"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;

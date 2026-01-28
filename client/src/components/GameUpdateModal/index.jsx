import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import { useOrganization } from "../../contexts/OrganizationContext";

const GameUpdateModal = ({
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
  // Step 1: Field selection, Step 2: Update form
  const [step, setStep] = useState(1);
  const [selectedFields, setSelectedFields] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [formState, setFormState] = useState({
    date: initialDate || "",
    time: initialTime || "",
    venue: initialVenue || "",
    city: initialCity || "",
    notes: initialNotes || "",
    opponent: initialOpponent || "",
    jerseyColor: initialJerseyColor || "",
  });

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
      onClose();
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isDropdownOpen]);

  const fields = [
    { id: "date", label: "Date", icon: "📅", type: "date" },
    { id: "time", label: "Time", icon: "⏰", type: "time" },
    { id: "venue", label: "Venue", icon: "🏟️", type: "text" },
    { id: "city", label: "City", icon: "🏙️", type: "text" },
    { id: "opponent", label: "Opponent Team", icon: "🥅", type: "text" },
    { id: "jerseyColor", label: "Jersey Color", icon: "👕", type: "text" },
    { id: "notes", label: "Additional Notes", icon: "📝", type: "textarea" },
  ];

  const toggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only send changed fields that were selected
    const input = {};
    selectedFields.forEach(fieldId => {
      input[fieldId] = formState[fieldId];
    });

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

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

  const handleNext = () => {
    if (selectedFields.length > 0) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl my-8">
        <div className={`rounded-2xl shadow-2xl transform transition-all duration-300 animate-in zoom-in-95 ${
          isDarkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600" : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
        }`}>
          {/* Modal Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-xl">✏️</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Update Game Details
                </h3>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {step === 1 ? "Select fields to update" : `Updating ${selectedFields.length} field${selectedFields.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? "text-gray-400 hover:bg-gray-700 hover:text-white" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-6">
            {step === 1 ? (
              /* Step 1: Field Selection */
              <div className="space-y-4" ref={dropdownRef}>
                <div className={`text-center mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <p className="text-sm">Select the fields you want to update</p>
                  <p className="text-xs mt-1">(You can select multiple fields)</p>
                </div>

                {/* Dropdown Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    isDropdownOpen
                      ? isDarkMode
                        ? "border-green-500 bg-green-900/20"
                        : "border-green-500 bg-green-50"
                      : isDarkMode
                        ? "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                        : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {selectedFields.length === 0 
                        ? "Click to select fields" 
                        : `${selectedFields.length} field${selectedFields.length !== 1 ? 's' : ''} selected`
                      }
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    } ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-300 bg-white"
                  }`}>
                    <div className="max-h-96 overflow-y-auto">
                      {fields.map((field) => (
                        <button
                          key={field.id}
                          onClick={() => toggleField(field.id)}
                          className={`w-full p-4 transition-all duration-200 text-left border-b last:border-b-0 ${
                            selectedFields.includes(field.id)
                              ? isDarkMode
                                ? "bg-green-900/30 hover:bg-green-900/40 border-green-500/30"
                                : "bg-green-50 hover:bg-green-100 border-green-200"
                              : isDarkMode
                                ? "hover:bg-gray-600/50 border-gray-600"
                                : "hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{field.icon}</span>
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                selectedFields.includes(field.id)
                                  ? isDarkMode ? "text-green-300" : "text-green-700"
                                  : isDarkMode ? "text-white" : "text-gray-800"
                              }`}>
                                {field.label}
                              </p>
                              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Current: {formState[field.id] || "Not set"}
                              </p>
                            </div>
                            {selectedFields.includes(field.id) && (
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFields.length > 0 && (
                  <div className={`mt-4 p-4 rounded-xl ${
                    isDarkMode ? "bg-green-900/20 border border-green-500/30" : "bg-green-50 border border-green-200"
                  }`}>
                    <div className="flex flex-wrap gap-2">
                      {selectedFields.map(fieldId => {
                        const field = fields.find(f => f.id === fieldId);
                        return (
                          <div
                            key={fieldId}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                              isDarkMode 
                                ? "bg-green-800/40 text-green-300 border border-green-600/40" 
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}
                          >
                            <span className="text-sm">{field.icon}</span>
                            <span className="text-sm font-medium">{field.label}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleField(fieldId);
                              }}
                              className="ml-1 hover:scale-110 transition-transform"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Update Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedFields.map(fieldId => {
                  const field = fields.find(f => f.id === fieldId);
                  return (
                    <div key={fieldId} className="space-y-2">
                      <label className={`text-sm font-medium flex items-center gap-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}>
                        <span>{field.icon}</span>
                        <span>{field.label}</span>
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          name={fieldId}
                          value={formState[fieldId]}
                          onChange={handleChange}
                          rows={4}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none ${
                            isDarkMode 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={fieldId}
                          value={formState[fieldId]}
                          onChange={handleChange}
                          placeholder={field.type === "text" ? `Enter ${field.label.toLowerCase()}...` : ""}
                          className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 ${
                            isDarkMode 
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}

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
              </form>
            )}
          </div>

          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t flex gap-3 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            {step === 1 ? (
              <>
                <button
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
                  onClick={handleNext}
                  disabled={selectedFields.length === 0}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedFields.length === 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  }`}
                >
                  <span>Next</span>
                  <span className="text-lg">→</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                    isDarkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300"
                  }`}
                >
                  <span className="text-lg">←</span>
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUpdateModal;

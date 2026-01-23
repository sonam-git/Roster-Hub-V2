import React, { useState, useEffect, useContext } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useSubscription } from "@apollo/client";
import {
  CREATE_FORMATION,
  UPDATE_FORMATION,
  DELETE_FORMATION,
} from "../../utils/mutations";
import {
  FORMATION_CREATED_SUBSCRIPTION,
  FORMATION_UPDATED_SUBSCRIPTION,
  FORMATION_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import AvailablePlayersList from "../AvailablePlayersList";
import FormationBoard from "../FormationBoard";
import FormationLikeButton from "../FormationLikeButton";

const FORMATION_TYPES = [
  "1-4-3-3",
  "1-3-5-2",
  "1-4-2-3-1",
  "1-4-1-4-1",
  "1-5-3-2",
];

export default function FormationSection({
  game,
  formation,
  isCreator,
  setFormation,
  refetchFormation,
  isLoading = false,
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const [createFormation] = useMutation(CREATE_FORMATION);
  const [updateFormation] = useMutation(UPDATE_FORMATION);
  const [deleteFormation] = useMutation(DELETE_FORMATION);

  const [selectedFormation, setSelectedFormation] = useState("");
  const [draggingPlayer, setDraggingPlayer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const gameId   = game._id;
  const isFormed = Boolean(formation);
  const creator = game.creator || {};

  // Debug logging
  useEffect(() => {
    console.log('🎮 FormationSection Debug:', {
      gameId,
      isFormed,
      hasFormation: !!formation,
      formationType: formation?.formationType,
      positionsCount: formation?.positions?.length
    });
  }, [gameId, isFormed, formation]);

  // ─── Subscriptions ───────────────────────────────────────────────────────
  console.log('🔗 Setting up subscriptions for gameId:', gameId);

  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    skip: !gameId,
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('📥 FORMATION_CREATED raw subscription data:', subscriptionData);
      if (subscriptionData.data?.formationCreated) {
        const created = subscriptionData.data.formationCreated;
        console.log('🔔 Formation created subscription received:', created);
        setFormation(created);
        
        // Update assignments from subscription data
        const newAssignments = {};
        created.positions?.forEach(p => {
          if (p.player) {
            newAssignments[p.slot] = p.player;
          }
        });
        setAssignments(newAssignments);
        
        refetchFormation?.();
      }
    },
    onError: (error) => {
      console.error('❌ Formation created subscription error:', error);
    },
  });

  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    variables: { gameId },
    skip: !gameId,
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('� FORMATION_UPDATED raw subscription data:', subscriptionData);
      if (subscriptionData.data?.formationUpdated) {
        const updated = subscriptionData.data.formationUpdated;
        console.log('🔔 Formation updated subscription received:', updated);
        setFormation(updated);
        
        // Update assignments from subscription data
        const newAssignments = {};
        updated.positions?.forEach(p => {
          if (p.player) {
            newAssignments[p.slot] = p.player;
          }
        });
        setAssignments(newAssignments);
        
        refetchFormation?.();
      }
    },
    onError: (error) => {
      console.error('❌ Formation updated subscription error:', error);
    },
  });

  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    variables: { gameId },
    skip: !gameId,
    onSubscriptionData: ({ subscriptionData }) => {
      console.log('� FORMATION_DELETED raw subscription data:', subscriptionData);
      if (subscriptionData.data?.formationDeleted) {
        const deleted = subscriptionData.data.formationDeleted;
        console.log('🔔 Formation deleted subscription received:', deleted);
        if (deleted === gameId) {
          setFormation(null);
          setAssignments({});
          refetchFormation?.();
        }
      }
    },
    onError: (error) => {
      console.error('❌ Formation deleted subscription error:', error);
    },
  });
  // ─────────────────────────────────────────────────────────────────────────

  const availablePlayers = React.useMemo(() => {
    if (!game?.responses) return [];
    
    return game.responses
      .filter(r => r?.isAvailable && r?.user && r.user._id && r.user.name)
      .map(r => r.user);
  }, [game?.responses]);

  // Backend returns formations without goalkeeper (e.g., "4-3-3")
  // Frontend displays with goalkeeper (e.g., "1-4-3-3")
  // selectedFormation already has "1-" prefix, so remove it for processing
  const formationType = formation?.formationType || 
    (selectedFormation.startsWith("1-") ? selectedFormation.slice(2) : selectedFormation);
  
  // Create rows including goalkeeper (slot 0)
  const rows = React.useMemo(() => {
    if (!formationType) return [];
    
    // Goalkeeper row (always 1 player, slot 0)
    const goalkeeperRow = { rowIndex: -1, slotIds: [0], isGoalkeeper: true };
    
    // Outfield rows
    const outfieldRows = formationType
      .split("-")
      .map((n, idx) => ({
        rowIndex: idx,
        slotIds: Array.from({ length: +n }, (_, i) => (idx + 1) * 10 + i),
        isGoalkeeper: false
      }));
    
    return [goalkeeperRow, ...outfieldRows];
  }, [formationType]);

  const [assignments, setAssignments] = useState({});
  useEffect(() => {
    if (formation?.positions) {
      const map = {};
      formation.positions.forEach(p => {
        map[p.slot] = p.player;
      });
      setAssignments(map);
    }
  }, [formation]);

  const sensors = useSensors(
    // Mouse sensor for desktop - immediate response
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 0, // Immediate drag, no delay
      },
    }),
    // Touch sensor for mobile devices - minimal delay
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Very short delay to distinguish from tap/scroll
        tolerance: 8,
      },
    }),
    // Pointer sensor as fallback
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    })
  );

  const handleDragStart = event => {
    const player = availablePlayers.find(p => p?._id === event.active.id);
    if (player && player.name) {
      setDraggingPlayer(player);
      // Add haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else {
      setDraggingPlayer(null);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggingPlayer(null);
    
    // Haptic feedback on drop
    if (navigator.vibrate && over) {
      navigator.vibrate(20);
    }
    
    if (!isCreator || !over) return;

    const player = availablePlayers.find(u => u?._id === active.id);
    if (!player || !player.name) return;

    const newMap = { ...assignments };
    // Remove player from previous position
    Object.entries(newMap).forEach(([slot, p]) => {
      if (p?._id === player._id) delete newMap[slot];
    });
    newMap[over.id] = player;
    setAssignments(newMap);
  };

  // Function to show success popup
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleSubmitFormation = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      alert('Please select an organization to create or update formation.');
      return;
    }
    
    const positions = rows.flatMap(r =>
      r.slotIds.map(slot => ({
        slot,
        playerId: assignments[slot]?._id || null,
      }))
    );
    
    try {
      if (!isFormed) {
        // Remove the goalkeeper prefix "1-" before sending to backend
        const backendFormationType = selectedFormation.startsWith("1-") 
          ? selectedFormation.slice(2) 
          : selectedFormation;
        
        await createFormation({ 
          variables: { 
            gameId, 
            formationType: backendFormationType,
            organizationId: currentOrganization._id
          } 
        });
        
        console.log('✅ Formation created successfully!');
        showSuccess('Formation created successfully!');
      }
      
      // Update formation with player positions
      const { data } = await updateFormation({ 
        variables: { 
          gameId, 
          positions,
          organizationId: currentOrganization._id
        } 
      });
      
      // Update local formation state with the response
      if (data?.updateFormation) {
        setFormation(data.updateFormation);
        
        // Update assignments from the response to keep players visible
        const newAssignments = {};
        data.updateFormation.positions?.forEach(p => {
          if (p.player) {
            newAssignments[p.slot] = p.player;
          }
        });
        setAssignments(newAssignments);
      }
      
      refetchFormation?.();
      
      // Show success message for update
      if (isFormed) {
        console.log('✅ Formation updated successfully!');
        showSuccess('Formation updated successfully!');
      }
    } catch (err) {
      console.error("❌ Formation submit error:", err.message);
      alert('Failed to save formation. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await deleteFormation({ 
        variables: { 
          gameId,
          organizationId: currentOrganization._id
        } 
      });
      setFormation(null);
      setSelectedFormation("");
      setAssignments({});
      setShowDeleteModal(false);
    } catch (err) {
      console.error("❌ Delete failed:", err.message);
      alert('Failed to delete formation. Please try again.');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-5">
      {!isFormed && isCreator && (
        <div className={`rounded-lg p-5 border transition-colors ${
          isDarkMode 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Formation Setup
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Choose your tactical formation for this match
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Formation Type
              </label>
              <select
                value={selectedFormation}
                onChange={e => setSelectedFormation(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">Select a formation</option>
                {FORMATION_TYPES.map(ft => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            
            {selectedFormation && (
              <div className="flex justify-end">
                <button
                  onClick={() => { setSelectedFormation(""); setAssignments({}); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {formationType && (
        <>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {isCreator && (
              <div className={`rounded-lg p-5 border transition-colors ${
                isDarkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-200"
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Available Players
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Drag players to positions on the formation board
                    </p>
                  </div>
                </div>
                <AvailablePlayersList
                  players={availablePlayers}
                  isCreator={isCreator}
                  isLoading={isLoading}
                />
              </div>
            )}

            <div className={`rounded-lg p-5 border transition-colors ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}>
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Formation Board 
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {isCreator ? "Drop players onto positions" : "Current tactical setup"}
                  </p>
                </div>
              </div>
              <FormationBoard 
                rows={rows} 
                assignments={assignments} 
                formationType={`1-${formationType}`}  // Add goalkeeper prefix for display
                creator={creator}
                isLoading={isLoading}
                isDragging={!!draggingPlayer}
              />
            </div>

            {isCreator && (
              <>
                {/* Success Popup Message */}
                {showSuccessPopup && (
                  <div className="mt-4">
                    <div className={`rounded-lg p-4 border ${
                      isDarkMode 
                        ? "bg-green-900/20 border-green-800 text-green-100" 
                        : "bg-green-50 border-green-200 text-green-800"
                    }`}>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                        <button
                          onClick={() => setShowSuccessPopup(false)}
                          className={`text-sm font-medium transition-colors ${
                            isDarkMode 
                              ? "text-green-300 hover:text-white" 
                              : "text-green-700 hover:text-green-900"
                          }`}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <button
                    onClick={handleSubmitFormation}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isFormed ? "Update Formation" : "Create Formation"}
                  </button>
                  
                  {isFormed && (
                    <button
                      onClick={handleDeleteClick}
                      className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Formation
                    </button>
                  )}
                </div>
              </>
            )}
          </DndContext>

          {formation && (
            <div className={`mt-8 rounded-3xl p-4 border-2 transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800 via-purple-900 to-gray-900 border-purple-700 shadow-lg shadow-purple-900/20" 
                : "bg-gradient-to-br from-purple-50 via-pink-50 to-white border-purple-200 shadow-lg shadow-purple-200/50"
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">❤️</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Formation Feedback
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Show your appreciation for this tactical setup
                  </p>
                </div>
              </div>
              <FormationLikeButton
                formationId={formation._id}
                likes={formation.likes}
                likedBy={formation.likedBy}
                onUpdate={partial =>
                  setFormation(prev => ({ ...prev, ...partial }))
                }
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelDelete}
          />
          
          {/* Modal Content */}
          <div className={`relative p-6 rounded-lg shadow-xl border max-w-md w-full ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Warning Icon */}
            <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 ${
              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className={`text-base font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Formation?
            </h3>
            
            {/* Description */}
            <p className={`mb-6 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Are you sure you want to delete this formation? This action will remove all player positions and cannot be undone.
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              
              <button
                onClick={handleCancelDelete}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

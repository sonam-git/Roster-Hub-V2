import React, { useState, useEffect, useContext } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
  const [createFormation] = useMutation(CREATE_FORMATION);
  const [updateFormation] = useMutation(UPDATE_FORMATION);
  const [deleteFormation] = useMutation(DELETE_FORMATION);

  const [selectedFormation, setSelectedFormation] = useState("");
  const [draggingPlayer, setDraggingPlayer] = useState(null);

  const gameId   = game._id;
  const isFormed = Boolean(formation);
  const creator = game.creator || {};

  // ─── Subscriptions ───────────────────────────────────────────────────────
  useSubscription(FORMATION_CREATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const created = data.data?.formationCreated;
      if (created) {
        setFormation(created);
        refetchFormation?.();
      }
    },
  });

  useSubscription(FORMATION_UPDATED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const updated = data.data?.formationUpdated;
      if (updated) {
        setFormation(updated);
        refetchFormation?.();
      }
    },
  });

  useSubscription(FORMATION_DELETED_SUBSCRIPTION, {
    variables: { gameId },
    onData: ({ data }) => {
      const deleted = data.data?.formationDeleted;
      if (deleted === gameId) {
        setFormation(null);
        refetchFormation?.();
      }
    },
  });
  // ─────────────────────────────────────────────────────────────────────────

  const availablePlayers = React.useMemo(() => {
    if (!game?.responses) return [];
    
    return game.responses
      .filter(r => r?.isAvailable && r?.user && r.user._id && r.user.name)
      .map(r => r.user);
  }, [game?.responses]);

  const formationType = formation?.formationType.slice(2) || selectedFormation;
  const rows = formationType
    .split("-")
    .map((n, idx) => ({
      rowIndex: idx,
      slotIds: Array.from({ length: +n }, (_, i) => (idx + 1) * 10 + i),
    }));

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = event => {
    const player = availablePlayers.find(p => p?._id === event.active.id);
    if (player && player.name) {
      setDraggingPlayer(player);
    } else {
      setDraggingPlayer(null);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggingPlayer(null);
    if (!isCreator || !over) return;

    const player = availablePlayers.find(u => u?._id === active.id);
    if (!player || !player.name) return;

    const newMap = { ...assignments };
    Object.entries(newMap).forEach(([slot, p]) => {
      if (p?._id === player._id) delete newMap[slot];
    });
    newMap[over.id] = player;
    setAssignments(newMap);
  };

  const handleSubmitFormation = async () => {
    const positions = rows.flatMap(r =>
      r.slotIds.map(slot => ({
        slot,
        playerId: assignments[slot]?._id || null,
      }))
    );
    try {
      if (!isFormed) {
        await createFormation({ variables: { gameId, formationType: selectedFormation } });
      }
      const { data } = await updateFormation({ variables: { gameId, positions } });
      setFormation(data.updateFormation);
      refetchFormation?.();
    } catch (err) {
      console.error("❌ Formation submit error:", err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFormation({ variables: { gameId } });
      setFormation(null);
      setSelectedFormation("");
      setAssignments({});
    } catch (err) {
      console.error("❌ Delete failed:", err.message);
    }
  };

  return (
    <div className="space-y-6">
      {!isFormed && isCreator && (
        <div className={`rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-indigo-900 to-gray-900 border-indigo-700 shadow-lg shadow-indigo-900/20" 
            : "bg-gradient-to-br from-indigo-50 via-blue-50 to-white border-indigo-200 shadow-lg shadow-indigo-200/50"
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Formation Setup
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Choose your tactical formation for this match
              </p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                🎯 Choose Formation Type:
              </label>
              <select
                value={selectedFormation}
                onChange={e => setSelectedFormation(e.target.value)}
                className={`w-full px-4 py-4 rounded-2xl border-2 font-medium shadow-lg focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 text-base ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-400" 
                    : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
                }`}
              >
                <option value="">-- Select Formation --</option>
                {FORMATION_TYPES.map(ft => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            
            {selectedFormation && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setSelectedFormation(""); setAssignments({}); }}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="relative z-10 text-lg">❌</span>
                  <span className="relative z-10">Cancel Selection</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
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
              <div className={`rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? "bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 border-blue-700 shadow-lg shadow-blue-900/20" 
                  : "bg-gradient-to-br from-blue-50 via-green-50 to-white border-blue-200 shadow-lg shadow-blue-200/50"
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      Available Players
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
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

            <div className={`rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800 via-green-900 to-gray-900 border-green-700 shadow-lg shadow-green-900/20" 
                : "bg-gradient-to-br from-green-50 via-teal-50 to-white border-green-200 shadow-lg shadow-green-200/50"
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚽</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Formation Board 
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {isCreator ? "Drop players onto positions" : "Current tactical setup"}
                  </p>
                </div>
              </div>
              <FormationBoard 
                rows={rows} 
                assignments={assignments} 
                formationType={formationType} 
                creator={creator}
                isLoading={isLoading}
              />
            </div>

            <DragOverlay>
              {draggingPlayer && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/30 text-sm font-semibold flex items-center gap-3 backdrop-blur-sm transform scale-110">
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-bold">{draggingPlayer?.name || 'Unknown Player'}</div>
                    <div className="text-xs opacity-75">• Dragging to position</div>
                  </div>
                </div>
              )}
            </DragOverlay>

            {isCreator && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={handleSubmitFormation}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 min-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative z-10 text-2xl">⚽</span>
                  <span className="relative z-10 text-lg">
                    {isFormed ? "Update Formation" : "Create Formation"}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                </button>
                
                {isFormed && (
                  <button
                    onClick={handleDelete}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 min-w-[200px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <span className="relative z-10 text-2xl">🗑️</span>
                    <span className="relative z-10 text-lg">Delete Formation</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                  </button>
                )}
              </div>
            )}
          </DndContext>

          {formation && (
            <div className={`mt-8 rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
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
    </div>
  );
}

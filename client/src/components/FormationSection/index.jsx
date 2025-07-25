import React, { useState, useEffect } from "react";
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

  const formationType = formation?.formationType || selectedFormation;
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
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚙️</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Formation Setup</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Choose Formation Type:
              </label>
              <select
                value={selectedFormation}
                onChange={e => setSelectedFormation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
              >
                <option value="">-- Select Formation --</option>
                {FORMATION_TYPES.map(ft => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            
            {selectedFormation && (
              <div className="flex justify-end">
                <button
                  onClick={() => { setSelectedFormation(""); setAssignments({}); }}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="relative z-10 text-sm">❌</span>
                  <span className="relative z-10">Cancel Selection</span>
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
              <AvailablePlayersList
                players={availablePlayers}
                isCreator={isCreator}
                isLoading={isLoading}
              />
            )}

            <FormationBoard 
              rows={rows} 
              assignments={assignments} 
              formationType={formationType} 
              creator={creator}
              isLoading={isLoading}
            />
            <DragOverlay>
              {draggingPlayer && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-xl border-2 border-white/20 text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                  <span className="text-lg">👤</span>
                  <span>{draggingPlayer?.name || 'Unknown Player'}</span>
                  <span className="text-xs opacity-75">• Dragging</span>
                </div>
              )}
            </DragOverlay>

            {isCreator && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleSubmitFormation}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 min-w-[180px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative z-10 text-lg">⚽</span>
                  <span className="relative z-10">
                    {isFormed ? "Update Formation" : "Create Formation"}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                </button>
                
                {isFormed && (
                  <button
                    onClick={handleDelete}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 min-w-[180px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <span className="relative z-10 text-lg">🗑️</span>
                    <span className="relative z-10">Delete Formation</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                  </button>
                )}
              </div>
            )}
          </DndContext>

          {formation && (
            <div className="mt-6 space-y-4">
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

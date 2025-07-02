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
import FormationCommentList from "../FormationCommentList";

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

  const availablePlayers = game.responses
    .filter(r => r.isAvailable)
    .map(r => r.user);

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
    const player = availablePlayers.find(p => p._id === event.active.id);
    setDraggingPlayer(player || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggingPlayer(null);
    if (!isCreator || !over) return;

    const player = availablePlayers.find(u => u._id === active.id);
    if (!player) return;

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
        <div className="space-y-2">
          <label className="block text-sm font-bold">Choose Formation:</label>
          <div className="flex items-center space-x-4">
            <select
              value={selectedFormation}
              onChange={e => setSelectedFormation(e.target.value)}
              className="p-2 rounded border dark:bg-gray-600"
            >
              <option value="">-- Select --</option>
              {FORMATION_TYPES.map(ft => (
                <option key={ft} value={ft}>{ft}</option>
              ))}
            </select>
            {selectedFormation && (
              <button
                onClick={() => { setSelectedFormation(""); setAssignments({}); }}
                className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
              >
                Cancel
              </button>
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
              />
            )}

            <FormationBoard rows={rows} assignments={assignments} formationType={formationType} creator={creator} />
            <DragOverlay>
              {draggingPlayer && (
                <div className="p-2 bg-white rounded shadow text-sm font-semibold">
                  {draggingPlayer.name}
                </div>
              )}
            </DragOverlay>

            {isCreator && (
              <div className="flex flex-col lg:flex-row mt-4 space-y-2 lg:space-y-0 lg:space-x-2">
                <button
                  onClick={handleSubmitFormation}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-900"
                >
                  {isFormed ? "Update Formation" : "Create Formation"}
                </button>
                {isFormed && (
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete Formation
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

              <FormationCommentList gameId={gameId} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

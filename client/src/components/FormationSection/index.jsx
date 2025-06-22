import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import AvailablePlayersList from "../AvailablePlayersList";
import FormationBoard from "../Formationboard";
import {
  CREATE_FORMATION,
  UPDATE_FORMATION,
  DELETE_FORMATION,
} from "../../utils/mutations";
import { useMutation } from "@apollo/client";

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

  const isFormed = !!formation;

  const availablePlayers = game.responses
    .filter((r) => r.isAvailable)
    .map((r) => r.user);

  const formationType = formation?.formationType || selectedFormation;
  

  const rows = formationType
    ? formationType.split("-").map((n, idx) => ({
        rowIndex: idx,
        slotIds: Array.from({ length: +n }, (_, i) => (idx + 1) * 10 + i),
      }))
    : [];

  const [assignments, setAssignments] = useState({});

  // Update assignments from formation prop
  useEffect(() => {
    if (formation?.positions) {
      const fresh = {};
      formation.positions.forEach((p) => {
        fresh[p.slot] = p.player;
      });
      setAssignments(fresh);
    }
  }, [formation]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!isCreator || !over) return;

    const player = availablePlayers.find((u) => u._id === active.id);
    if (!player) return;

    const alreadyUsed = Object.entries(assignments).find(
      ([, p]) => p && p._id === player._id
    );

    const updatedAssignments = { ...assignments };

    if (alreadyUsed) {
      const [slotId] = alreadyUsed;
      delete updatedAssignments[slotId];
    }

    updatedAssignments[over.id] = player;
    setAssignments(updatedAssignments);
  };

  const handleSubmitFormation = async () => {
    const positions = rows
      .flatMap((r) => r.slotIds)
      .map((slot) => ({
        slot,
        playerId: assignments[slot]?._id || null,
      }));

    try {
      if (!isFormed) {
        await createFormation({
          variables: {
            gameId: game._id,
            formationType: selectedFormation,
          },
        });
      }

      const updateRes = await updateFormation({
        variables: {
          gameId: game._id,
          positions,
        },
      });

      setFormation(updateRes.data.updateFormation);
      refetchFormation?.();
    } catch (err) {
      console.error("❌ Formation submit error:", err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFormation({ variables: { gameId: game._id } });
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
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="p-2 rounded border dark:bg-gray-600"
          >
            <option value="">-- Select --</option>
            {FORMATION_TYPES.map((ft) => (
              <option key={ft} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>
      )}

      {formationType && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {isCreator && (
            <AvailablePlayersList
              players={availablePlayers}
              isCreator={isCreator}
            />
          )}

          <FormationBoard rows={rows} assignments={assignments} />

          {isCreator && (
            <div className="space-x-2 mt-4">
              <button
                onClick={handleSubmitFormation}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                {isFormed ? "Update Formation" : "Create Formation"}
              </button>
              {isFormed && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Delete Formation
                </button>
              )}
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
}

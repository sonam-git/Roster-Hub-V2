// src/components/FormationBoard.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function FormationBoard({ rows, assignments }) {
  
  return (
    <div className="p-4 bg-green-600 dark:bg-gray-800 rounded shadow">
      <h3 className="font-bold mb-2">Formation Board</h3>
      <div className="space-y-4">
        {rows.map(({ rowIndex, slotIds }) => (
          <div key={rowIndex} className="flex justify-center space-x-10">
            {slotIds.map((slotId) => (
              <Slot
                key={slotId}
                slotId={slotId}
                player={assignments[slotId]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({ slotId, player }) {
  const { isOver, setNodeRef } = useDroppable({ id: slotId });

  const base =
    "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold";
  const highlight = isOver ? "bg-green-200" : "bg-gray-200 dark:bg-gray-600";

  return (
    <div ref={setNodeRef} className={`${base} ${highlight} text-xs`}>
      {player ? player.name : "—"}
    </div>
  );
}

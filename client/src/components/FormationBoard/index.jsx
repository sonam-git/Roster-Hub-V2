import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function FormationBoard({ rows, assignments }) {

  
  return (
    <div className="relative p-4 bg-green-600 dark:bg-gray-800 rounded shadow">
      <h3 className="font-bold mb-2 text-white">Formation Board</h3>

      <div className="relative w-full h-[500px] mx-auto rounded-lg overflow-hidden bg-green-700 bg-[repeating-linear-gradient(to-bottom,_#006400_0px,_#006400_40px,_#228B22_40px,_#228B22_80px)] border-4 border-white dark:bg-gray-800">

        {/* 🟩 Large 3-sided rectangle (no top border) */}
        <div className="absolute top-0 left-[10%] w-[80%] h-[160px] border-l-2 border-r-2 border-b-2 border-white z-10" />

        {/* ⬛ Small 3-sided rectangle (no top border) */}
        <div className="absolute top-[1px] left-1/2 w-[160px] h-[80px] border-l-2 border-r-2 border-b-2 border-white z-20 transform -translate-x-1/2" />

        {/* ◠ Semi-circle at bottom */}
        <div className="absolute bottom-[-30px] left-1/2 w-[160px] h-[70px] border-2 border-white border-b-0 z-10 transform -translate-x-1/2 rounded-t-full" />

        {/* Player rows */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {rows.map(({ rowIndex, slotIds }) => (
            <div
              key={rowIndex}
              className="flex justify-center space-x-6"
            >
              {slotIds.map((slotId) => (
                <Slot key={slotId} slotId={slotId} player={assignments[slotId]} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slot({ slotId, player }) {
  function getFirstName(name) {
    return name.split(" ")[0];
  }
  const { isOver, setNodeRef } = useDroppable({ id: slotId });

  const base =
    "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-transform";
  const highlight = isOver
    ? "bg-yellow-300 border-yellow-600"
    : "bg-white dark:bg-gray-200 border-gray-400";

  return (
    <div
      ref={setNodeRef}
      className={`${base} ${highlight} text-xs text-center dark:text-gray-800`}
    >
      {player ? getFirstName(player.name) : "—"}

    </div>
  );
}

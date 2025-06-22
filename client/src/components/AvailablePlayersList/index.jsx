// src/components/AvailablePlayersList.jsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";

export default function AvailablePlayersList({ players, isCreator }) {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded shadow">
      <h3 className="font-bold mb-2">Available Players</h3>
      <ul className="space-y-2">
        {players.map((player) =>
          isCreator ? (
            <DraggablePlayer key={player._id} player={player} />
          ) : (
            <li key={player._id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
              {player.name}{player.jerseyNumber ? ` (#${player.jerseyNumber})` : ""}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function DraggablePlayer({ player }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player._id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move p-2 bg-gray-100 dark:bg-gray-700 rounded"
    >
      {player.name}
    </li>
  );
}

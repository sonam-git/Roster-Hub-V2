// src/components/AvailablePlayersList.jsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { AvailablePlayersListSkeleton } from "../LoadingSkeleton";
import { FadeInOut } from "../SmoothTransition";

export default function AvailablePlayersList({ players, isCreator, isLoading = false }) {
  // Filter out any null/undefined players with memoization to prevent flickering
  const validPlayers = React.useMemo(() => {
    if (!players || !Array.isArray(players)) return [];
    return players.filter(player => 
      player && 
      player._id && 
      player.name && 
      typeof player.name === "string" && 
      player.name.trim().length > 0
    );
  }, [players]);

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <AvailablePlayersListSkeleton />;
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-xl">👥</span>
          <div>
            <h3 className="font-bold text-lg">Available Players</h3>
            <p className="text-indigo-100 text-xs">
              {isCreator ? 'Drag players to formation positions' : `${validPlayers.length} players ready to play`}
            </p>
          </div>
          <div className="ml-auto bg-white/20 px-3 py-1 rounded-full">
            <span className="font-semibold text-sm">{validPlayers.length}</span>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="p-6">
        {validPlayers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No available players</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Players who marked themselves as available will appear here
            </p>
          </div>
        ) : (
          <FadeInOut show={validPlayers.length > 0} duration={300}>
            <div className="grid grid-cols-3 gap-3 auto-rows-fr">
              {validPlayers.map((player) =>
                isCreator ? (
                  <DraggablePlayer key={player._id} player={player} />
                ) : (
                  <PlayerCard key={player._id} player={player} />
                )
              )}
            </div>
          </FadeInOut>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ player }) {
  const playerName = React.useMemo(() => player?.name || 'Unknown Player', [player?.name]);
  const initial = React.useMemo(() => 
    playerName.charAt(0)?.toUpperCase() || '?', [playerName]
  );
  
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-3 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
            {playerName}
          </h4>
          {player?.jerseyNumber && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Jersey #{player.jerseyNumber}
            </p>
          )}
        </div>
        <div className="text-green-500">
          <span className="text-lg">✅</span>
        </div>
      </div>
    </div>
  );
}

function DraggablePlayer({ player }) {
  // Memoize to prevent unnecessary re-renders
  const playerId = React.useMemo(() => player?._id || 'unknown', [player?._id]);
  const playerName = React.useMemo(() => player?.name || 'Unknown Player', [player?.name]);
  const initial = React.useMemo(() => 
    playerName.charAt(0)?.toUpperCase() || '?', [playerName]
  );

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: playerId,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 p-3 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-move ${
        isDragging ? 'opacity-50 rotate-3 scale-110 shadow-xl z-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
            {playerName}
          </h4>
          {player?.jerseyNumber && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Jersey #{player.jerseyNumber}
            </p>
          )}
        </div>
        <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
          <span className="text-lg">↗️</span>
        </div>
      </div>
      
      {!isDragging && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="flex items-center gap-1">
            <span>🖱️</span>
            <span>Drag to position</span>
          </span>
        </div>
      )}
    </div>
  );
}

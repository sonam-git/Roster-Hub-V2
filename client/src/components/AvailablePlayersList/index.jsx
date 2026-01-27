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
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
      
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {isCreator ? 'Available Players' : 'Squad List'}
            </h3>
          </div>
          <div className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
            {validPlayers.length}
          </div>
        </div>
        {isCreator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Drag players to formation positions
          </p>
        )}
      </div>

      {/* Players List */}
      <div className="p-4">
        {validPlayers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              No available players
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Players who confirm will appear here
            </p>
          </div>
        ) : (
          <FadeInOut show={validPlayers.length > 0} duration={300}>
            {/* Grid Layout - 4 players per row */}
            <div className="grid grid-cols-4 gap-3">
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
  const jerseyNumber = React.useMemo(() => player?.jerseyNumber || 'N/A', [player?.jerseyNumber]);
  const position = React.useMemo(() => player?.position || 'N/A', [player?.position]);
  const initial = React.useMemo(() => playerName ? playerName.charAt(0).toUpperCase() : '?', [playerName]);
  
  return (
    <div className="group relative">
      {/* Square Player Card */}
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-2 transition-all duration-150 flex flex-col items-center justify-center">
        {/* Avatar/Initial Circle */}
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800 mb-1.5">
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {initial}
          </span>
        </div>
        
        {/* Jersey Number Badge */}
        <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-200 dark:border-indigo-800">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            #{jerseyNumber}
          </span>
        </div>
        
        {/* Available Status */}
        <div className="mt-1">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
          <p className="font-semibold">{playerName}</p>
          {position && position !== 'N/A' && (
            <p className="text-gray-300 text-xs mt-0.5">{position}</p>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-black"></div>
        </div>
      </div>
    </div>
  );
}

function DraggablePlayer({ player }) {
  // Memoize to prevent unnecessary re-renders
  const playerId = React.useMemo(() => player?._id || 'unknown', [player?._id]);
  const playerName = React.useMemo(() => player?.name || 'Unknown Player', [player?.name]);
  const jerseyNumber = React.useMemo(() => player?.jerseyNumber || 'N/A', [player?.jerseyNumber]);
  const position = React.useMemo(() => player?.position || 'N/A', [player?.position]);
  const initial = React.useMemo(() => playerName ? playerName.charAt(0).toUpperCase() : '?', [playerName]);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: playerId,
  });

  // Combine all inline styles to avoid duplicate style attributes
  const style = transform
    ? { 
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: 'none',
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        zIndex: 9999,
      }
    : {
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      };

  return (
    <div className="group relative">
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`aspect-square border-2 rounded-lg p-2 transition-all duration-150 touch-none select-none flex flex-col items-center justify-center ${
          isDragging 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 opacity-90 scale-105 shadow-xl ring-4 ring-blue-400/50 cursor-grabbing' 
            : 'border-dashed border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:scale-105 cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Avatar/Initial Circle */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-1.5 transition-all duration-150 ${
          isDragging 
            ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500 scale-110' 
            : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
        }`}>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {initial}
          </span>
        </div>
        
        {/* Jersey Number Badge */}
        <div className={`px-2 py-0.5 rounded-md border transition-all duration-150 ${
          isDragging 
            ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500' 
            : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
        }`}>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {jerseyNumber}{position === 'N/A' ? '' : ` - ${position}`}
          </span>
        </div>
        
        {/* Drag Icon */}
        {!isDragging && (
          <div className="mt-1.5">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Tooltip on Hover - Only show when not dragging */}
      {!isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
            <p className="font-semibold">{playerName}</p>
            {position && position !== 'N/A' && (
              <p className="text-gray-300 text-xs mt-0.5">{position}</p>
            )}
            <p className="text-blue-300 text-xs mt-1 italic">Click & drag to position</p>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-black"></div>
          </div>
        </div>
      )}
    </div>
  );
}

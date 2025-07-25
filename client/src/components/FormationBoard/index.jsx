import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { FormationBoardSkeleton } from "../LoadingSkeleton";
import { FadeInOut } from "../SmoothTransition";

export default function FormationBoard({ rows, assignments, formationType, creator, isLoading = false }) {
  // Show loading skeleton while data is loading
  if (isLoading || !formationType) {
    return <FormationBoardSkeleton />;
  }
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-4 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <div>
              <h3 className="font-bold text-lg">Formation: {formationType}</h3>
              <p className="text-green-100 text-xs">Tactical Formation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍💼</span>
            <div className="text-right">
              <h4 className="font-semibold text-sm">{creator?.name || 'Unknown'}</h4>
              <p className="text-green-100 text-xs">Formation Creator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Football Field */}
      <div className="p-6">
        <div className="relative w-full h-[500px] mx-auto rounded-xl overflow-hidden shadow-inner border-4 border-white" 
             style={{
               background: `
                 linear-gradient(to bottom, 
                   #2d5016 0%, 
                   #3a6b1c 50%, 
                   #2d5016 100%
                 ),
                 repeating-linear-gradient(
                   to bottom,
                   transparent 0px,
                   transparent 38px,
                   rgba(255,255,255,0.1) 38px,
                   rgba(255,255,255,0.1) 42px
                 )
               `
             }}>

          {/* Field Markings */}
          {/* Goal Area (18-yard box) */}
          <div className="absolute top-0 left-[15%] w-[70%] h-[140px] border-l-4 border-r-4 border-b-4 border-white opacity-80" />
          
          {/* Small Box (6-yard box) */}
          <div className="absolute top-0 left-1/2 w-[140px] h-[70px] border-l-4 border-r-4 border-b-4 border-white opacity-80 transform -translate-x-1/2" />
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-4 border-white opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white opacity-60 transform -translate-y-1/2" />
          
          {/* Goal Area (bottom) */}
          <div className="absolute bottom-0 left-[15%] w-[70%] h-[140px] border-l-4 border-r-4 border-t-4 border-white opacity-80" />
          
          {/* Small Box (bottom) */}
          <div className="absolute bottom-0 left-1/2 w-[140px] h-[70px] border-l-4 border-r-4 border-t-4 border-white opacity-80 transform -translate-x-1/2" />

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-8 h-8 border-b-4 border-r-4 border-white opacity-60 rounded-br-full" />
          <div className="absolute top-0 right-0 w-8 h-8 border-b-4 border-l-4 border-white opacity-60 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-t-4 border-r-4 border-white opacity-60 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-t-4 border-l-4 border-white opacity-60 rounded-tl-full" />

          {/* Player Rows */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 py-12">
            {rows.map(({ rowIndex, slotIds }) => (
              <FadeInOut key={rowIndex} show={true} duration={200}>
                <div
                  className="flex justify-center space-x-4 sm:space-x-6"
                  style={{ zIndex: 10 + rowIndex }}
                >
                  {slotIds.map((slotId) => (
                    <Slot key={slotId} slotId={slotId} player={assignments[slotId]} />
                  ))}
                </div>
              </FadeInOut>
            ))}
          </div>
        </div>
        
        {/* Field Info */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Assigned Players</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white"></div>
            <span>Empty Positions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Drop Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slot({ slotId, player }) {
  function getFirstName(name) {
    if (!name || typeof name !== 'string') return '';
    return name.split(" ")[0];
  }
  
  const { isOver, setNodeRef } = useDroppable({ id: slotId });

  // Memoize player data to prevent flickering
  const playerData = React.useMemo(() => {
    const hasPlayer = !!(player && player._id && player.name);
    const firstName = hasPlayer ? getFirstName(player.name) : '';
    const initial = hasPlayer && firstName ? firstName.charAt(0).toUpperCase() : '';
    
    return { hasPlayer, firstName, initial, playerName: player?.name || 'Unknown Player' };
  }, [player]);

  const { hasPlayer, firstName, initial, playerName } = playerData;

  return (
    <div
      ref={setNodeRef}
      className={`relative group transition-all duration-300 transform hover:scale-110 ${
        isOver ? 'scale-125' : ''
      }`}
    >
      {/* Player Circle */}
      <div
        className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 shadow-lg ${
          isOver
            ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-yellow-400/50'
            : hasPlayer
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white shadow-blue-500/30'
            : 'bg-white border-gray-400 text-gray-600 shadow-gray-400/30 hover:border-blue-400'
        }`}
      >
        {hasPlayer ? (
          <>
            <span className="font-bold text-lg leading-none">{initial}</span>
            <span className="text-[8px] leading-none mt-0.5 opacity-90">
              {firstName.length > 6 ? firstName.substring(0, 6) : firstName}
            </span>
          </>
        ) : (
          <span className="text-2xl text-gray-400">+</span>
        )}
      </div>

      {/* Player Name Tooltip */}
      {hasPlayer && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {playerName}
            {player?.jerseyNumber && (
              <span className="ml-1 opacity-75">#{player.jerseyNumber}</span>
            )}
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-black"></div>
        </div>
      )}

      {/* Drop Zone Indicator */}
      {!hasPlayer && isOver && (
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-full border-2 border-dashed border-yellow-400 animate-pulse"></div>
      )}
    </div>
  );
}

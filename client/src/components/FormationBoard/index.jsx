import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { FormationBoardSkeleton } from "../LoadingSkeleton";
import { FadeInOut } from "../SmoothTransition";

export default function FormationBoard({ rows, assignments, formationType, creator, isLoading = false, isDragging = false, onSlotClick, isCreator = false }) {
  // Show loading skeleton while data is loading
  if (isLoading || !formationType) {
    return <FormationBoardSkeleton />;
  }
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-3 sm:p-4 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl ">⚽</span>
            <div>
              <h3 className="font-bold text-lg">Formation: {formationType.slice(2)}</h3>
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
      <div className="p-1 sm:p-4 lg:p-6">
        <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] mx-auto rounded-xl overflow-hidden shadow-inner border-2 sm:border-4 border-white" 
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
          <div className="absolute top-0 left-[15%] w-[70%] h-[120px] sm:h-[140px] border-l-2 border-r-2 border-b-2 sm:border-l-4 sm:border-r-4 sm:border-b-4 border-white opacity-80" />
          
          {/* Small Box (6-yard box) */}
          <div className="absolute top-0 left-1/2 w-[120px] sm:w-[140px] h-[60px] sm:h-[70px] border-l-2 border-r-2 border-b-2 sm:border-l-4 sm:border-r-4 sm:border-b-4 border-white opacity-80 transform -translate-x-1/2" />
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-2 sm:border-4 border-white opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 sm:h-1 bg-white opacity-60 transform -translate-y-1/2" />
          
          {/* Goal Area (bottom) */}
          <div className="absolute bottom-0 left-[15%] w-[70%] h-[120px] sm:h-[140px] border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-white opacity-80" />
          
          {/* Small Box (bottom) */}
          <div className="absolute bottom-0 left-1/2 w-[120px] sm:w-[140px] h-[60px] sm:h-[70px] border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-white opacity-80 transform -translate-x-1/2" />

          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 sm:border-b-4 sm:border-r-4 border-white opacity-60 rounded-br-full" />
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 sm:border-b-4 sm:border-l-4 border-white opacity-60 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 sm:border-t-4 sm:border-r-4 border-white opacity-60 rounded-tr-full" />
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 sm:border-t-4 sm:border-l-4 border-white opacity-60 rounded-tl-full" />

          {/* Player Rows */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 py-6 sm:p-6 sm:py-8 lg:p-8 lg:py-12">
            {rows.map(({ rowIndex, slotIds, isGoalkeeper }) => (
              <FadeInOut key={rowIndex} show={true} duration={200}>
                <div
                  className={`flex justify-center ${isGoalkeeper ? 'space-x-0' : 'space-x-2 sm:space-x-4 lg:space-x-6'}`}
                  style={{ zIndex: isGoalkeeper ? 20 : 10 + rowIndex }}
                >
                  {slotIds.map((slotId) => (
                    <Slot 
                      key={slotId} 
                      slotId={slotId} 
                      player={assignments[slotId]} 
                      isDragging={isDragging}
                      isGoalkeeper={isGoalkeeper}
                      onSlotClick={onSlotClick}
                      isCreator={isCreator}
                    />
                  ))}
                </div>
              </FadeInOut>
            ))}
          </div>
        </div>
        
        {/* Field Info */}
        <div className="mt-2 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 px-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs sm:text-sm">Goalkeeper</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs sm:text-sm">Assigned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-gray-400 sm:border-2 bg-white"></div>
            <span className="text-xs sm:text-sm">Empty</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs sm:text-sm">Drop Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slot({ slotId, player, isDragging = false, isGoalkeeper = false, onSlotClick, isCreator = false }) {
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

  // Handle click/tap for mobile assignment
  const handleClick = (e) => {
    // Only trigger if creator and onSlotClick is provided
    if (isCreator && onSlotClick) {
      e.stopPropagation(); // Prevent event bubbling
      onSlotClick(slotId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`relative group transition-all duration-300 transform hover:scale-110 ${
        isOver ? 'scale-125 z-10' : ''
      } ${isDragging && !hasPlayer ? 'animate-pulse' : ''} ${
        isCreator && onSlotClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Player Circle - Larger for goalkeeper */}
      <div
        className={`${
          isGoalkeeper 
            ? 'w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20' 
            : 'w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18'
        } rounded-full border-2 sm:border-4 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 shadow-lg ${
          isOver
            ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-yellow-400/50 scale-110 ring-4 ring-yellow-300 animate-bounce'
            : hasPlayer
            ? isGoalkeeper
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-300 text-white shadow-orange-500/30 hover:shadow-orange-500/50'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
            : isDragging
            ? 'bg-green-100 border-green-400 text-green-700 shadow-green-400/50 ring-2 ring-green-300'
            : 'bg-white border-gray-400 text-gray-600 shadow-gray-400/30 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {hasPlayer ? (
          <>
            <span className={`font-bold ${isGoalkeeper ? 'text-base sm:text-xl' : 'text-sm sm:text-lg'} leading-none`}>
              {isGoalkeeper ? '🧤' : initial}
            </span>
            <span className={`${isGoalkeeper ? 'text-[7px] sm:text-[9px]' : 'text-[6px] sm:text-[8px]'} leading-none mt-0.5 opacity-90`}>
              {firstName.length > 6 ? firstName.substring(0, 6) : firstName}
            </span>
          </>
        ) : (
          <span className={`${isGoalkeeper ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-2xl'} text-gray-400`}>
            {isGoalkeeper ? '🧤' : '+'}
          </span>
        )}
      </div>

      {/* Player Name Tooltip */}
      {hasPlayer && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {isGoalkeeper && <span className="mr-1">🧤 GK:</span>}
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

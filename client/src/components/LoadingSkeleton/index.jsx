// src/components/LoadingSkeleton/index.jsx
import React from "react";

export function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

export function FormationBoardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-300 dark:bg-gray-600 p-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded w-1/3"></div>
          <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-1/4"></div>
        </div>
      </div>
      
      {/* Field */}
      <div className="p-6">
        <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col justify-between p-8 py-12">
          {/* Mock formation rows */}
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex justify-center space-x-6">
              {Array.from({ length: row }, (_, i) => (
                <div 
                  key={i} 
                  className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-full"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AvailablePlayersListSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-300 dark:bg-gray-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-400 dark:bg-gray-500 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-6 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Players Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

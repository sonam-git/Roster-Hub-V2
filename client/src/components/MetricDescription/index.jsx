import React, { useState } from "react";
import { FaEnvelope, FaComment, FaTrophy, FaCalendarAlt, FaVoteYea, FaRegListAlt } from "react-icons/fa";

const MetricDescription = ({ profile, allGames }) => {
  const [hoveredMetric, setHoveredMetric] = useState(null);

  // Calculate metrics
  const messageCount = profile?.receivedMessages?.length || 0;
  const skillsCount = profile?.skills?.length || 0;
  const upcomingGamesCount = allGames.filter(game => 
    game.status === "PENDING" || game.status === "CONFIRMED"
  ).length;
  const votedGamesCount = allGames.filter(game =>
    game.responses?.some(response => response.user?._id === profile._id)
  ).length;
  const postsCount = profile?.posts?.length || 0;
  const commentsCount = profile?.posts?.reduce((total, post) => 
    total + (post?.comments?.length || 0), 0) || 0;
  
  // Split upcoming games count for detailed description
  const pendingGamesCount = allGames.filter(game => game.status === "PENDING").length;
  const confirmedGamesCount = allGames.filter(game => game.status === "CONFIRMED").length;

  // Metric descriptions
  const getMetricDescription = (metric) => {
    switch(metric) {
      case 'messages':
        return messageCount === 0 
          ? "There is no message in your inbox." 
          : "Your friend sent you a message, go and check the message inbox for detail message.";
      case 'skills':
        return skillsCount === 0 
          ? "No one has endorsed you yet." 
          : `Your friends have endorsed you ${skillsCount} skill${skillsCount !== 1 ? 's' : ''}.`;
      case 'upcomingGames':
        return upcomingGamesCount === 0 
          ? "There is no upcoming game yet." 
          : `You have ${pendingGamesCount} pending game${pendingGamesCount !== 1 ? 's' : ''}, and ${confirmedGamesCount} confirmed game${confirmedGamesCount !== 1 ? 's' : ''}.`;
      case 'votedGames':
        return votedGamesCount === 0 
          ? "You haven't voted any game yet, cast your vote if there is any upcoming games." 
          : `You have voted ${votedGamesCount} game${votedGamesCount !== 1 ? 's' : ''}, go to the game details and check if you miss to vote any game you are available.`;
      case 'posts':
        return postsCount === 0 
          ? "You haven't posted anything yet." 
          : `You have ${postsCount} post${postsCount !== 1 ? 's' : ''}, keep on posting new post.`;
      case 'comments':
        return commentsCount === 0 
          ? "Your friend haven't commented yet to your post." 
          : `Your friends have commented on your post ${commentsCount} time${commentsCount !== 1 ? 's' : ''}.`;
      default:
        return '';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* Messages */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-blue-300 dark:border-blue-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('messages')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'messages' ? null : 'messages')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaEnvelope className="text-blue-600 dark:text-blue-400 text-2xl" />
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{messageCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Messages</p>
        {hoveredMetric === 'messages' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-blue-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-blue-400"></div>
            {getMetricDescription('messages')}
          </div>
        )}
      </div>

      {/* Skills */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-purple-300 dark:border-purple-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('skills')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'skills' ? null : 'skills')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaTrophy className="text-purple-600 dark:text-purple-400 text-2xl" />
          <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">{skillsCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Skills</p>
        {hoveredMetric === 'skills' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-purple-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-purple-400"></div>
            {getMetricDescription('skills')}
          </div>
        )}
      </div>

      {/* Upcoming Games */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-green-300 dark:border-green-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('upcomingGames')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'upcomingGames' ? null : 'upcomingGames')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaCalendarAlt className="text-green-600 dark:text-green-400 text-2xl" />
          <span className="text-2xl font-bold text-green-700 dark:text-green-300">{upcomingGamesCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upcoming Games</p>
        {hoveredMetric === 'upcomingGames' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-green-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-green-400"></div>
            {getMetricDescription('upcomingGames')}
          </div>
        )}
      </div>

      {/* Voted Games */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-orange-300 dark:border-orange-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('votedGames')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'votedGames' ? null : 'votedGames')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaVoteYea className="text-orange-600 dark:text-orange-400 text-2xl" />
          <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{votedGamesCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Voted Games</p>
        {hoveredMetric === 'votedGames' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-orange-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-orange-400"></div>
            {getMetricDescription('votedGames')}
          </div>
        )}
      </div>

      {/* Posts */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-yellow-300 dark:border-yellow-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('posts')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'posts' ? null : 'posts')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaRegListAlt className="text-yellow-600 dark:text-yellow-400 text-2xl" />
          <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{postsCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Posts</p>
        {hoveredMetric === 'posts' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-yellow-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-yellow-400"></div>
            {getMetricDescription('posts')}
          </div>
        )}
      </div>

      {/* Comments */}
      <div 
        className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 shadow-lg border-2 border-red-300 dark:border-red-700 hover:scale-105 transition-transform cursor-pointer relative group"
        onMouseEnter={() => setHoveredMetric('comments')}
        onMouseLeave={() => setHoveredMetric(null)}
        onClick={() => setHoveredMetric(hoveredMetric === 'comments' ? null : 'comments')}
      >
        <div className="flex items-center justify-between mb-1">
          <FaComment className="text-red-600 dark:text-red-400 text-2xl" />
          <span className="text-2xl font-bold text-red-700 dark:text-red-300">{commentsCount}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Comments</p>
        {hoveredMetric === 'comments' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-xs rounded-lg p-3 shadow-xl z-50 border-2 border-red-400">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-50 dark:bg-gray-800 border-r-2 border-b-2 border-red-400"></div>
            {getMetricDescription('comments')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricDescription;

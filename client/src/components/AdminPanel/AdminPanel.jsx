import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";
import { DELETE_PROFILE, SEND_TEAM_INVITE } from "../../utils/mutations";
import InvitePlayersModal from "../InvitePlayersModal";

const AdminPanel = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [expandedStat, setExpandedStat] = useState(null);

  const { loading, data, refetch, error } = useQuery(QUERY_ME, {
    fetchPolicy: 'network-only', // Always fetch fresh data
    nextFetchPolicy: 'network-only', // Continue fetching fresh data on refetch
    notifyOnNetworkStatusChange: true, // Get updates when network status changes
  });
  
  // Query games data for statistics
  const { data: gamesData } = useQuery(QUERY_GAMES, {
    variables: { organizationId: data?.me?.currentOrganization?._id },
    skip: !data?.me?.currentOrganization?._id,
    fetchPolicy: 'network-only',
  });
  
  const [deleteProfile] = useMutation(DELETE_PROFILE);

  // Debug: Log any GraphQL errors
  useEffect(() => {
    if (error) {
      console.error("❌ GraphQL Error:", error);
      console.error("❌ Error Message:", error.message);
      console.error("❌ Network Error:", error.networkError);
      console.error("❌ GraphQL Errors:", error.graphQLErrors);
    }
  }, [error]);

  const currentUser = data?.me || {};
  const organization = currentUser.currentOrganization || {};
  const members = organization.members || [];

  // Debug: Simple logging
  if (data && !loading) {
    console.log("🔍 AdminPanel Debug:", {
      hasCurrentOrganization: !!data.me?.currentOrganization,
      inviteCode: data.me?.currentOrganization?.inviteCode,
      orgName: data.me?.currentOrganization?.name,
    });
  }

  // Auto-hide success/error messages
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (showErrorMessage) {
      const timer = setTimeout(() => setShowErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorMessage]);

  // Handle delete player
  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      await deleteProfile({
        variables: {
          profileId: selectedPlayer._id,
        },
      });

      setShowSuccessMessage(`${selectedPlayer?.name || 'Player'} has been removed from the team`);
      setShowDeleteModal(false);
      setSelectedPlayer(null);
      refetch();
    } catch (error) {
      console.error("Error deleting player:", error);
      setShowErrorMessage(error.message || "Failed to delete player. Please try again.");
    }
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    // Safety checks to prevent null/undefined errors
    const memberName = member?.name || '';
    const memberEmail = member?.email || '';
    const searchLower = searchTerm?.toLowerCase() || '';
    
    const matchesSearch = memberName.toLowerCase().includes(searchLower) ||
                         memberEmail.toLowerCase().includes(searchLower);
    
    const matchesRole = filterRole === "all" || 
                       (filterRole === "owner" && member._id === organization.owner?._id) ||
                       (filterRole === "member" && member._id !== organization.owner?._id);
    
    return matchesSearch && matchesRole;
  });

  // Get roster statistics
  const stats = {
    totalMembers: members.length,
    owner: members.find(m => m._id === organization.owner?._id),
    regularMembers: members.filter(m => m._id !== organization.owner?._id).length,
    withJerseyNumber: members.filter(m => m.jerseyNumber).length,
    withPosition: members.filter(m => m.position).length,
  };

  // Get game statistics
  const games = useMemo(() => gamesData?.games || [], [gamesData?.games]);
  
  // Debug: Log game statuses to understand the data
  useEffect(() => {
    if (games.length > 0) {
      console.log('🎮 Game Statistics Debug:', {
        totalGames: games.length,
        gameDetails: games.map(g => ({
          id: g._id,
          date: g.date,
          time: g.time,
          status: g.status,
          venue: g.venue,
        })),
        statuses: games.map(g => g.status),
      });
    }
  }, [games]);
  
  // Calculate game statistics based on status and date
  const gameStats = {
    totalGames: games.length,
    // Upcoming: Future games that aren't completed/canceled (may have PENDING or UPCOMING status)
    upcomingGames: games.filter(g => g.status === 'PENDING').length,
    // Confirmed: Games with CONFIRMED status (if this status exists in your system)
    confirmedGames: games.filter(g => g.status === 'CONFIRMED').length,
    // Canceled: Games marked as canceled
    canceledGames: games.filter(g => g.status === 'CANCELED').length,
    // Completed: Games marked as completed
    completedGames: games.filter(g => g.status === 'COMPLETED').length,
    // Past Due: Games that have passed their date but aren't completed or cancele
    totalVotes: games.reduce((sum, g) => sum + (g.responses?.length || 0), 0),
    totalFormations: games.reduce((sum, g) => sum + (g.formation ? 1 : 0), 0),
    totalFeedback: games.reduce((sum, g) => sum + (g.feedbacks?.length || 0), 0),
    avgResponseRate: games.length > 0 ? ((games.reduce((sum, g) => sum + (g.responses?.length || 0), 0) / games.length / Math.max(stats.totalMembers, 1)) * 100).toFixed(0) : 0,
  };

  return (
    <div className="mt-4 mb-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full lg:w-auto text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage your team: {organization.name}
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full lg:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm sm:text-base">Send Email Invites</span>
            </button>
          </div>

          {/* Success/Error Messages */}
          {showSuccessMessage && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{showSuccessMessage}</span>
              </div>
            </div>
          )}

          {showErrorMessage && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span className="font-medium">{showErrorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-full">
          {/* Total Members Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExpandedStat(expandedStat === 'totalMembers' ? null : 'totalMembers')}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalMembers}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Active roster size
                  </p>
                </div>
                <div className="ml-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 sm:p-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {expandedStat === 'totalMembers' ? 'Hide breakdown' : 'View breakdown'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedStat === 'totalMembers' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expandedStat === 'totalMembers' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Team Owner:</span>
                  <span className="font-medium text-gray-900 dark:text-white">1</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Regular Members:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.regularMembers}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profile Completeness:</span>
                  <span className="font-medium text-gray-900 dark:text-white"></span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pl-2">
                  <span className="text-gray-600 dark:text-gray-400">• With Jersey #:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.withJerseyNumber} ({stats.totalMembers > 0 ? Math.round((stats.withJerseyNumber / stats.totalMembers) * 100) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pl-2">
                  <span className="text-gray-600 dark:text-gray-400">• With Position:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.withPosition} ({stats.totalMembers > 0 ? Math.round((stats.withPosition / stats.totalMembers) * 100) : 0}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Total Games Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExpandedStat(expandedStat === 'totalGames' ? null : 'totalGames')}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Games</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {gameStats.totalGames}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {gameStats.upcomingGames} upcoming
                  </p>
                </div>
                <div className="ml-3">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 sm:p-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {expandedStat === 'totalGames' ? 'Hide breakdown' : 'View breakdown'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedStat === 'totalGames' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expandedStat === 'totalGames' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Upcoming:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.upcomingGames}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Confirmed:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.confirmedGames}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Canceled:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.canceledGames}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Completed:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.completedGames}</span>
                </div>
                {games.length > 0 && (
                  <Link
                    to="/game-schedule"
                    className="block mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center"
                  >
                    View All Games →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Player Engagement Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExpandedStat(expandedStat === 'engagement' ? null : 'engagement')}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Player Engagement</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {gameStats.avgResponseRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Response rate
                  </p>
                </div>
                <div className="ml-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2 sm:p-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {expandedStat === 'engagement' ? 'Hide metrics' : 'View metrics'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedStat === 'engagement' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expandedStat === 'engagement' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Responses:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.totalVotes}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Formations Created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.totalFormations}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Feedback Given:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameStats.totalFeedback}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg Responses/Game:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {gameStats.totalGames > 0 ? (gameStats.totalVotes / gameStats.totalGames).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Team Completion Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-3 sm:p-4 lg:p-5 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExpandedStat(expandedStat === 'completion' ? null : 'completion')}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Team Setup</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalMembers > 0 ? Math.round(((stats.withJerseyNumber + stats.withPosition) / (stats.totalMembers * 2)) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Profile completion
                  </p>
                </div>
                <div className="ml-3">
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2 sm:p-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {expandedStat === 'completion' ? 'Hide status' : 'View status'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedStat === 'completion' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expandedStat === 'completion' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Jersey Numbers:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.withJerseyNumber}/{stats.totalMembers} ({stats.totalMembers > 0 ? Math.round((stats.withJerseyNumber / stats.totalMembers) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Positions Set:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.withPosition}/{stats.totalMembers} ({stats.totalMembers > 0 ? Math.round((stats.withPosition / stats.totalMembers) * 100) : 0}%)
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.totalMembers > 0 ? Math.round(((stats.withJerseyNumber + stats.withPosition) / (stats.totalMembers * 2)) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {stats.totalMembers > 0 && Math.round(((stats.withJerseyNumber + stats.withPosition) / (stats.totalMembers * 2)) * 100) < 100 
                      ? 'Encourage members to complete profiles' 
                      : 'All profiles complete! 🎉'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 max-w-full">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Team Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Team Name</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{organization.name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Team Owner</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{stats.owner?.name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Team Slug</p>
              <p className="text-sm sm:text-base font-mono text-gray-900 dark:text-white">{organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700 max-w-full">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Players
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="   Search by name or email"
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Members</option>
                <option value="owner">Owner</option>
                <option value="member">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-full">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team Roster ({filteredMembers.length})
            </h2>
          </div>
          
          {filteredMembers.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No players found matching your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Jersey #
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map((member) => {
                    const isOwner = member._id === organization.owner?._id;
                    const isCurrentUser = member._id === currentUser._id;
                    
                    return (
                      <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Link 
                            to={`/profiles/${member._id}`}
                            className="flex items-center group no-underline"
                          >
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-200 group-hover:scale-110">
                              {member.profilePic ? (
                                <img
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover cursor-pointer ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                                  src={member.profilePic}
                                  alt={member?.name || 'User'}
                                />
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs sm:text-base font-bold cursor-pointer ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                                  {member?.name ? member.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                                {member?.name || 'Unknown User'}
                                {isCurrentUser && (
                                  <span className="ml-1 sm:ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{member?.email || 'No email'}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                            {member.jerseyNumber || (
                              <span className="text-gray-400 dark:text-gray-500">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                            {member.position || (
                              <span className="text-gray-400 dark:text-gray-500">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {isOwner ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              Owner
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          {!isOwner && !isCurrentUser && (
                            <button
                              onClick={() => {
                                setSelectedPlayer(member);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              Remove Player?
            </h3>
            <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Are you sure you want to remove <strong>{selectedPlayer?.name || 'this player'}</strong> from the team? This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlayer(null);
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {organization && (
        <InvitePlayersModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organization={organization}
        />
      )}
    </div>
  );
};

export default AdminPanel;

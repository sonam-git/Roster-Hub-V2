import { useState, useEffect } from "react";
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
  const games = gamesData?.games || [];
  const gameStats = {
    totalGames: games.length,
    upcomingGames: games.filter(g => g.status === 'UPCOMING').length,
    completedGames: games.filter(g => g.status === 'COMPLETED').length,
    canceledGames: games.filter(g => g.status === 'CANCELED').length,
    totalVotes: games.reduce((sum, g) => sum + (g.responses?.length || 0), 0),
    totalFormations: games.reduce((sum, g) => sum + (g.formations?.length || 0), 0),
    totalFeedback: games.reduce((sum, g) => sum + (g.feedback?.length || 0), 0),
  };

  return (
    <div className="mt-4 mb-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage your team: {organization.name}
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full lg:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm sm:text-base">Send Email Invites</span>
            </button>
          </div>

          {/* Success/Error Messages */}
          {showSuccessMessage && (
            <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{showSuccessMessage}</span>
              </div>
            </div>
          )}

          {showErrorMessage && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span className="font-semibold">{showErrorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-full">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-xs sm:text-sm font-medium  text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.totalMembers}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-2 sm:p-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Regular Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.regularMembers}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">With Jersey #</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.withJerseyNumber}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 sm:p-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">With Position</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.withPosition}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 sm:p-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Game Statistics Section */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 max-w-full">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Game Statistics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
            {/* Total Games */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.totalGames}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Total Games</p>
            </div>

            {/* Upcoming Games */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.upcomingGames}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Upcoming</p>
            </div>

            {/* Completed Games */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.completedGames}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Completed</p>
            </div>

            {/* Canceled Games */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.canceledGames}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Canceled</p>
            </div>

            {/* Total Votes */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.totalVotes}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Total Votes</p>
            </div>

            {/* Total Formations */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.totalFormations}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Formations</p>
            </div>

            {/* Total Feedback */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-pink-200 dark:border-pink-700">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{gameStats.totalFeedback}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Feedback</p>
            </div>

            {/* View Games Button */}
            <Link 
              to="/game-schedule"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 block"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">View Games</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Go to Schedule</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 max-w-full">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            📋 Team Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Name</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{organization.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Owner</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{stats.owner?.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Slug</p>
              <p className="text-base sm:text-lg font-mono text-gray-900 dark:text-white">{organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700 max-w-full">
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
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Members</option>
                <option value="owner">Owner</option>
                <option value="member">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-full">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              👥 Team Roster ({filteredMembers.length})
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
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Jersey #
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map((member) => {
                    const isOwner = member._id === organization.owner?._id;
                    const isCurrentUser = member._id === currentUser._id;
                    
                    return (
                      <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              {member.profilePic ? (
                                <img
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                  src={member.profilePic}
                                  alt={member?.name || 'User'}
                                />
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs sm:text-base font-bold">
                                  {member?.name ? member.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                {member?.name || 'Unknown User'}
                                {isCurrentUser && (
                                  <span className="ml-1 sm:ml-2 text-xs text-emerald-600 dark:text-emerald-400">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white">{member?.email || 'No email'}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                            {member.jerseyNumber || (
                              <span className="text-gray-400 dark:text-gray-500">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                            {member.position || (
                              <span className="text-gray-400 dark:text-gray-500">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {isOwner ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              👑 Owner
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
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
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
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

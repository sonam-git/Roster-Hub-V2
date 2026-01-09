import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";
import { DELETE_PROFILE, SEND_TEAM_INVITE } from "../../utils/mutations";
import InvitePlayersModal from "../InvitePlayersModal";
import Auth from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
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

  // Check if current user is admin/owner
  const isAdmin = organization.owner?._id === currentUser._id;

  // Fetch all games for statistics
  const { data: gamesData } = useQuery(QUERY_GAMES, {
    variables: { organizationId: organization._id },
    skip: !organization._id,
    fetchPolicy: 'network-only',
  });

  const allGames = gamesData?.games || [];

  useEffect(() => {
    // Redirect if not admin
    if (!loading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [loading, isAdmin, navigate]);

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

      setShowSuccessMessage(`${selectedPlayer.name} has been removed from the team`);
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
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Calculate game statistics
  const now = new Date();
  const gameStats = {
    totalGames: allGames.length,
    upcomingGames: allGames.filter(game => {
      const gameDate = new Date(parseInt(game.date));
      return game.status === 'PENDING' && gameDate >= now;
    }).length,
    completedGames: allGames.filter(game => game.status === 'COMPLETED').length,
    canceledGames: allGames.filter(game => game.status === 'CANCELLED').length,
    confirmedGames: allGames.filter(game => {
      const gameDate = new Date(parseInt(game.date));
      return game.status === 'CONFIRMED' || (game.status === 'PENDING' && gameDate >= now);
    }).length,
    totalVotes: allGames.reduce((sum, game) => sum + (game.availableCount || 0) + (game.unavailableCount || 0), 0),
    averageVotesPerGame: allGames.length > 0 
      ? Math.round(allGames.reduce((sum, game) => sum + (game.availableCount || 0) + (game.unavailableCount || 0), 0) / allGames.length)
      : 0,
    gamesWithFormation: allGames.filter(game => game.formation).length,
    gamesWithFeedback: allGames.filter(game => game.feedbacks && game.feedbacks.length > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">
                Manage your team: {organization.name}
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="whitespace-nowrap">Send Email Invites</span>
            </button>
          </div>

          {/* Success/Error Messages */}
          {showSuccessMessage && (
            <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              <div className="flex items-start sm:items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base font-semibold">{showSuccessMessage}</span>
              </div>
            </div>
          )}

          {showErrorMessage && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              <div className="flex items-start sm:items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span className="text-sm sm:text-base font-semibold">{showErrorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.totalMembers}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-2 sm:p-3 md:p-4 w-fit">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Regular Members</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.regularMembers}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-3 md:p-4 w-fit">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">With Jersey #</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.withJerseyNumber}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 sm:p-3 md:p-4 w-fit">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">With Position</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                  {stats.withPosition}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2 sm:p-3 md:p-4 w-fit">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-6 md:mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            📋 Team Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Name</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{organization.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Owner</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{stats.owner?.name}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Slug</p>
              <p className="text-sm sm:text-base md:text-lg font-mono text-gray-900 dark:text-white break-all">{organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Game Statistics Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-6 md:mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              ⚽ Game Statistics
            </h2>
            <button
              onClick={() => navigate('/game-schedule')}
              className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition"
            >
              View All Games →
            </button>
          </div>
          
          {/* Game Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Games */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-3 sm:p-4 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">Total Games</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-100">{gameStats.totalGames}</p>
            </div>

            {/* Upcoming Games */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Upcoming</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{gameStats.upcomingGames}</p>
            </div>

            {/* Completed Games */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Completed</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{gameStats.completedGames}</p>
            </div>

            {/* Canceled Games */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Canceled</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-100">{gameStats.canceledGames}</p>
            </div>

            {/* Total Votes */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">Total Votes</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">{gameStats.totalVotes}</p>
            </div>

            {/* Avg Votes Per Game */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">Avg Votes</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100">{gameStats.averageVotesPerGame}</p>
            </div>

            {/* Games with Formation */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-3 sm:p-4 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300">Formations</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-teal-900 dark:text-teal-100">{gameStats.gamesWithFormation}</p>
            </div>

            {/* Games with Feedback */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-3 sm:p-4 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-pink-700 dark:text-pink-300">With Feedback</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-pink-900 dark:text-pink-100">{gameStats.gamesWithFeedback}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Search Players
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <svg className="absolute left-2.5 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Members</option>
                <option value="owner">Owner</option>
                <option value="member">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Jersey #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {member.profilePic ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
                                    src={member.profilePic}
                                    alt={member.name}
                                    onClick={() => navigate(`/profiles/${member._id}`)}
                                  />
                                ) : (
                                  <div 
                                    onClick={() => navigate(`/profiles/${member._id}`)}
                                    className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
                                  >
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div 
                                  onClick={() => navigate(`/profiles/${member._id}`)}
                                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition"
                                >
                                  {member.name}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">(You)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {member.jerseyNumber || (
                                <span className="text-gray-400 dark:text-gray-500">Not set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {member.position || (
                                <span className="text-gray-400 dark:text-gray-500">Not set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!isOwner && !isCurrentUser && (
                              <button
                                onClick={() => {
                                  setSelectedPlayer(member);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition"
                                title="Remove player"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

              {/* Mobile Card View - Visible only on mobile */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => {
                  const isOwner = member._id === organization.owner?._id;
                  const isCurrentUser = member._id === currentUser._id;
                  
                  return (
                    <div key={member._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div 
                          onClick={() => navigate(`/profiles/${member._id}`)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            {member.profilePic ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                                src={member.profilePic}
                                alt={member.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200 dark:ring-gray-700">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {member.name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">(You)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{member.email}</div>
                          </div>
                        </div>
                        {!isOwner && !isCurrentUser && (
                          <button
                            onClick={() => {
                              setSelectedPlayer(member);
                              setShowDeleteModal(true);
                            }}
                            className="flex-shrink-0 p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Remove player"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Jersey #:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {member.jerseyNumber || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Position:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {member.position || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {isOwner ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            👑 Owner
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Member
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 mx-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Remove Player?
            </h3>
            <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 mb-5 sm:mb-6 px-2">
              Are you sure you want to remove <strong className="text-gray-900 dark:text-white">{selectedPlayer.name}</strong> from the team? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlayer(null);
                }}
                className="w-full sm:flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg sm:rounded-xl transition text-sm sm:text-base"
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

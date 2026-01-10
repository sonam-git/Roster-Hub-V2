import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../../utils/queries";
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your team: {organization.name}
              </p>
            </div>
            
            {/* Invite Code Card - Prominent Display */}
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-2xl p-6 border-2 border-emerald-400/50 transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50">
              <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wider">
                🔑 Team Invite Code
              </p>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                {organization.inviteCode ? (
                  <>
                    <code className="text-3xl font-black text-white tracking-widest font-mono">
                      {organization.inviteCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(organization.inviteCode);
                        setShowSuccessMessage("✅ Invite code copied to clipboard!");
                      }}
                      className="bg-white hover:bg-gray-100 text-emerald-600 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl flex items-center gap-2"
                      title="Copy invite code"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="text-white text-sm">Loading code...</span>
                  </div>
                )}
              </div>
              <p className="text-white/80 text-xs mt-3 text-center">
                Share this code with players to join your team
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email Invites
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalMembers}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-4">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Regular Members</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.regularMembers}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Jersey #</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.withJerseyNumber}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Position</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.withPosition}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📋 Team Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{organization.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Owner</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.owner?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Slug</p>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{organization.slug}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Players
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Members</option>
                <option value="owner">Owner</option>
                <option value="member">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              👥 Team Roster ({filteredMembers.length})
            </h2>
          </div>
          
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No players found matching your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={member.profilePic}
                                  alt={member.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Remove Player?
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove <strong>{selectedPlayer.name}</strong> from the team? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlayer(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
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

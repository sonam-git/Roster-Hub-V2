import React, { useState } from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { FaChevronDown, FaBuilding, FaCheck } from 'react-icons/fa';

const OrganizationSelector = () => {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    switchingOrg,
  } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);

  if (!currentOrganization || organizations.length <= 1) {
    return null; // Don't show if only one organization
  }

  const handleSwitch = async (orgId) => {
    if (orgId === currentOrganization._id) {
      setIsOpen(false);
      return;
    }

    try {
      await switchOrganization(orgId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch organization:', error);
      alert('Failed to switch organization. Please try again.');
    }
  };

  return (
    <div className="relative">
      {/* Current Organization Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switchingOrg}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        <FaBuilding className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-32 truncate">
          {currentOrganization.name}
        </span>
        <FaChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Switch Organization
              </div>

              {organizations.map((org) => (
                <button
                  key={org._id}
                  onClick={() => handleSwitch(org._id)}
                  disabled={switchingOrg}
                  className={`w-full flex items-start space-x-3 px-3 py-3 rounded-md transition-colors ${
                    org._id === currentOrganization._id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } disabled:opacity-50`}
                >
                  {/* Logo or Icon */}
                  <div className="flex-shrink-0">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {org.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Organization Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {org.name}
                      </p>
                      {org._id === currentOrganization._id && (
                        <FaCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                    </div>

                    {org.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {org.description}
                      </p>
                    )}

                    {/* Plan Badge */}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        org.subscription.plan === 'enterprise'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : org.subscription.plan === 'pro'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {org.subscription.plan.charAt(0).toUpperCase() + org.subscription.plan.slice(1)}
                      </span>

                      {/* Usage Info */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {org.usage.memberCount}/{org.limits.maxMembers} members
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Create New Organization Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <a
                href="/organizations/new"
                className="flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <FaBuilding className="h-4 w-4" />
                <span>Create New Organization</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {switchingOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              Switching organization...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSelector;

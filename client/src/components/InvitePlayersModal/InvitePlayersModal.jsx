import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SEND_TEAM_INVITE } from "../../utils/mutations";

const InvitePlayersModal = ({ isOpen, onClose, organization }) => {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [sendTeamInvite] = useMutation(SEND_TEAM_INVITE);

  // Add email to list
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address");
      return;
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      setErrorMessage("This email is already in the list");
      return;
    }
    
    setEmails([...emails, trimmedEmail]);
    setEmailInput("");
    setErrorMessage("");
  };

  // Remove email from list
  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // Send invites
  const handleSendInvites = async () => {
    if (emails.length === 0) {
      setErrorMessage("Please add at least one email address");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data } = await sendTeamInvite({
        variables: {
          emails,
          organizationId: organization._id,
        },
      });

      setSuccessMessage(data.sendTeamInvite.message || `Invites sent successfully to ${emails.length} email(s)!`);
      setEmails([]);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error sending invites:", error);
      setErrorMessage(error.message || "Failed to send invites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📧 Invite Players</h2>
              <p className="text-sm text-white/90">
                Send email invites to join "{organization.name}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <span className="font-semibold">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Add Player Email Addresses
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="player@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddEmail}
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Press Enter or click Add to include email in invite list
            </p>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email List ({emails.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {email}
                    </span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite Code Section */}
          <div className="bg-blue-50 dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              📋 Alternative: Share Invite Code
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Players can also join by entering this code during signup:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-bold bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                {organization.inviteCode}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(organization.inviteCode);
                  alert("Invite code copied to clipboard!");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendInvites}
              disabled={isLoading || emails.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                `📧 Send ${emails.length} Invite${emails.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePlayersModal;

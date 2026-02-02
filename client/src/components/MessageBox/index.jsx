import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../../utils/mutations";
import Modal from "../Modal";
import MessageSentModal from "../MessageSentModal";
import { QUERY_ME } from "../../utils/queries";
import { HiPaperAirplane, HiX, HiUser, HiReply, HiExclamationCircle } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { useOrganization } from "../../contexts/OrganizationContext";

const MessageBox = ({ recipient, selectedMessage, onCloseModal, isDarkMode, skipSuccessModal = false, skipNavigation = false }) => {
  const { currentOrganization } = useOrganization();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Reset messageSent when component mounts (always reset on mount)
  useEffect(() => {
    setMessageSent(false);
    setMessage("");
    setError(false);
  }, []); // Empty dependency array to run only on mount

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      setError(true);
      return;
    }

    if (!currentOrganization) {
      console.error('No organization selected');
      setError(true);
      return;
    }

    try {
      await sendMessage({
        variables: {
          recipientId: recipient._id,
          text: message,
          organizationId: currentOrganization._id,
        },
        refetchQueries: [{ query: QUERY_ME }],
      });
      
  
      
      // If skipSuccessModal is true, close immediately without showing success modal
      if (skipSuccessModal) {
        setMessage("");
        setError(false);
        onCloseModal(true); // Pass true to indicate message was sent
      } else {
        // Show success modal
        console.log('🎉 MessageBox: Setting messageSent to TRUE - should show success modal');
        setMessageSent(true);
        setMessage("");
        setError(false);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setError(true);
    }
  };

  const handleCloseModal = (wasCancelled = false) => {
    // Pass whether a message was sent when closing (not if cancelled)
    onCloseModal(wasCancelled ? false : messageSent);
  };

  const handleMessageSentModalClose = () => {
    setMessage("");
    setError(false);
    setMessageSent(false); // Reset for next time
    // When the success modal is closed, a message was definitely sent
    onCloseModal(true);
  };

  const handleCancel = () => {
    setMessage("");
    setError(false);
    setMessageSent(false);
    handleCloseModal(true); // Pass true to indicate cancellation
  };

  console.log('🟢 MessageBox RENDER - messageSent:', messageSent, 'skipSuccessModal:', skipSuccessModal, 'skipNavigation:', skipNavigation);

  return (
    recipient && (
      <>
        {!messageSent ? (
          <Modal showModal={true} onClose={handleCloseModal}>
            <div className={`rounded-lg shadow-lg border max-w-md w-full mx-4 overflow-hidden ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              {/* Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={recipient.profilePic || ProfileAvatar}
                      alt={recipient.name}
                      className={`w-10 h-10 rounded-full object-cover border-2 ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 ${
                      isDarkMode ? "border-gray-800" : "border-white"
                    }`}></div>
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedMessage ? (
                        <span className="flex items-center gap-1.5">
                          <HiReply className="w-4 h-4 text-blue-500" />
                          Reply to {recipient.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <HiUser className="w-4 h-4 text-blue-500" />
                          Message {recipient.name}
                        </span>
                      )}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedMessage ? 'Replying to a message' : 'New conversation'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCancel}
                  className={`p-1.5 rounded-md transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {selectedMessage && (
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {selectedMessage.sender?.name || "Sender"}
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {selectedMessage.text}
                        </p>
                        <p className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {selectedMessage.createdAt || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedMessage && (
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Start a new conversation with {recipient.name}
                  </p>
                )}

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Your message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (error && e.target.value.trim() !== "") {
                        setError(false);
                      }
                    }}
                    placeholder="Type your message..."
                    rows={4}
                    className={`w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      error 
                        ? isDarkMode
                          ? "border-red-500 bg-red-900/20 text-white placeholder-gray-400"
                          : "border-red-500 bg-red-50 text-gray-900 placeholder-gray-500"
                        : isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>

                {error && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800 text-red-400' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Please write your message first.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-4 py-3 border-t flex justify-end gap-3 ${
                isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}>
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <HiPaperAirplane className="w-4 h-4 transform rotate-90" />
                  Send
                </button>
              </div>
            </div>
          </Modal>
        ) : (
          <MessageSentModal 
            onClose={handleMessageSentModalClose} 
            recipientName={recipient.name}
            isDarkMode={isDarkMode}
            skipNavigation={skipNavigation}
          />
        )}
      </>
    )
  );
};

export default MessageBox;

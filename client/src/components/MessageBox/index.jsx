import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SEND_MESSAGE } from "../../utils/mutations";
import Modal from "../Modal";
import MessageSentModal from "../MessageSentModal";
import { QUERY_ME } from "../../utils/queries";
import { HiPaperAirplane, HiX, HiUser, HiReply, HiExclamationCircle } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";

const MessageBox = ({ recipient, selectedMessage, onCloseModal, isDarkMode }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const { data } = useQuery(QUERY_ME);

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      setError(true);
      return;
    }

    try {
      await sendMessage({
        variables: {
          recipientId: recipient._id,
          text: message,
        },
        refetchQueries: [{ query: QUERY_ME }],
      });

      setMessage("");
      setMessageSent(true);
      setShowModal(true);
      setError(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCloseModal = (wasCancelled = false) => {
    setShowModal(false);
    // Pass whether a message was sent when closing (not if cancelled)
    onCloseModal(wasCancelled ? false : messageSent);
  };

  const handleMessageSentModalClose = () => {
    setShowModal(false);
    setMessage("");
    setError(false);
    // When the success modal is closed, a message was definitely sent
    onCloseModal(true);
    setMessageSent(false); // Reset for next time
  };

  const handleCancel = () => {
    setMessage("");
    setError(false);
    setMessageSent(false);
    handleCloseModal(true); // Pass true to indicate cancellation
  };

  const isSender = selectedMessage?.sender?._id === data?.me?._id;

  return (
    recipient && (
      <>
        {!messageSent && (
          <Modal showModal={true} onClose={handleCloseModal}>
            <div className={`rounded-2xl shadow-2xl p-8 border max-w-2xl w-full mx-4 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 text-gray-900 border-gray-200"
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={recipient.profilePic || ProfileAvatar}
                      alt={recipient.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedMessage ? (
                        <span className="flex items-center gap-2">
                          <HiReply className="w-5 h-5 text-blue-500" />
                          Reply to {recipient.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <HiUser className="w-5 h-5 text-blue-500" />
                          Message {recipient.name}
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedMessage ? 'Replying to a message' : 'Starting a new conversation'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCancel}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {selectedMessage ? (
                <div
                  className={`p-3 rounded-md mb-4 max-h-56 overflow-y-auto message-scroll-container scrollbar-thin ${
                    isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"
                  }`}
                >
                  <div className="mb-3">
                    <p className="font-semibold mb-1">
                      {selectedMessage.sender?.name || "Sender"}
                    </p>
                    <p
                      className={`p-2 rounded-md text-sm ${
                        isSender ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
                      }`}
                    >
                      {selectedMessage.text}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      {selectedMessage.createdAt || ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mb-4 text-sm italic">
                  You’re starting a new message to {recipient.name}.
                </p>
              )}

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
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                  error 
                    ? isDarkMode
                      ? "border-red-500 focus:border-red-400 focus:ring-red-400/20 bg-gray-700 text-white placeholder-gray-400"
                      : "border-red-500 focus:border-red-400 focus:ring-red-400/20 bg-white text-gray-900 placeholder-gray-500"
                    : isDarkMode
                      ? "border-gray-600 focus:border-blue-400 focus:ring-blue-400/20 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-400/20 bg-white text-gray-900 placeholder-gray-500"
                }`}
              />

              {error && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
                }`}>
                  <HiExclamationCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">Please write your message first.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
                >
                  <HiPaperAirplane className="w-4 h-4 transform rotate-90" />
                  Send Message
                </button>
              </div>
            </div>
          </Modal>
        )}
        {showModal && <MessageSentModal onClose={handleMessageSentModalClose} />}
      </>
    )
  );
};

export default MessageBox;

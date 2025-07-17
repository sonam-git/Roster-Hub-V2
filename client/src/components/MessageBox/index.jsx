import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SEND_MESSAGE } from "../../utils/mutations";
import Modal from "../Modal";
import MessageSentModal from "../MessageSentModal";
import { QUERY_ME } from "../../utils/queries";

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

  const handleCloseModal = () => {
    setShowModal(false);
    onCloseModal();
  };

  const isSender = selectedMessage?.sender?._id === data?.me?._id;

  return (
    recipient && (
      <>
        {!messageSent && (
          <Modal showModal={true} onClose={handleCloseModal}>
            <div
              className={`rounded-lg shadow-lg p-6 border ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <h3
                className={`text-lg md:text-xl font-bold mb-4 p-3 rounded-md ${
                  isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                }`}
              >
                {selectedMessage
                  ? `Reply to ${recipient.name[0].toUpperCase() + recipient.name.slice(1)}`
                  : `Message ${recipient.name[0].toUpperCase() + recipient.name.slice(1)}`}
              </h3>

              {selectedMessage ? (
                <div
                  className={`p-3 rounded-md mb-4 max-h-56 overflow-y-auto ${
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
                rows={3}
                className={`w-full p-2 rounded-md border focus:outline-none mb-1 ${
                  isDarkMode
                    ? `bg-gray-700 text-white placeholder-gray-400 ${
                        error ? "border-red-500" : "border-gray-600"
                      }`
                    : `bg-white text-black placeholder-gray-500 ${
                        error ? "border-red-500" : "border-gray-300"
                      }`
                }`}
              />

              {error && (
                <p className="text-sm text-red-500 mb-4">
                  Write your message first.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-black"
                  }`}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
        {showModal && <MessageSentModal onClose={handleCloseModal} />}
      </>
    )
  );
};

export default MessageBox;

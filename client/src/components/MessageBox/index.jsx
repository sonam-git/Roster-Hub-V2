import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SEND_MESSAGE } from "../../utils/mutations";
import Modal from "../Modal";
import { QUERY_ME } from "../../utils/queries";

const MessageBox = ({ recipient, selectedMessage, onCloseModal, isDarkMode }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
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
      setError(false);
      onCloseModal(); // Just close the modal after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCloseModal = () => {
    onCloseModal();
  };

  const isSender = selectedMessage?.sender?._id === data?.me?._id;

  return (
    recipient && (
      <>
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
                      isSender
                        ? isDarkMode
                          ? "bg-blue-700 text-white"
                          : "bg-blue-100 text-blue-900"
                        : isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {selectedMessage.text}
                  </p>
                </div>
              </div>
            ) : null}

            <textarea
              className={`w-full p-2 rounded-md border mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black border-gray-300"
              }`}
              rows={3}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(false);
              }}
            />
            {error && (
              <p className="text-red-500 text-sm mb-2">Please enter a message.</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className={`px-4 py-2 rounded-md ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
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
      </>
    )
  );
};

export default MessageBox;

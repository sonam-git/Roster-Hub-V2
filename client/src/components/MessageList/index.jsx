import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { REMOVE_MESSAGE, SEND_MESSAGE } from "../../utils/mutations";
import { MailIcon, PlusIcon } from "@heroicons/react/solid";
import ChatBox from "../MessageBox";
import UserListModal from "../UserListModal";
import MessageCard from "../MessageCard";
import { getDateFromObjectId } from "../messageUtils";

const MessageList = ({ isLoggedInUser = false, isDarkMode }) => {
  const { data: userData } = useQuery(QUERY_ME);
  const { data: profileData } = useQuery(QUERY_PROFILES);
  const [removeMessage] = useMutation(REMOVE_MESSAGE);
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const loggedInUser = userData?.me || {};
  const profiles = profileData?.profiles || [];
  const allMessages = [
    ...(loggedInUser.receivedMessages || []),
    ...(loggedInUser.sentMessages || []),
  ]
    .map((msg) => ({
      ...msg,
      timestamp: getDateFromObjectId(msg._id).getTime(),
      partner: msg.sender._id === loggedInUser._id ? msg.recipient : msg.sender,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const grouped = {};
  allMessages.forEach((msg) => {
    const key = msg.partner._id;
    if (!grouped[key]) grouped[key] = { user: msg.partner, messages: [] };
    grouped[key].messages.push(msg);
  });

  const conversations = Object.values(grouped);
  const [inputValues, setInputValues] = useState({});
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [page, setPage] = useState(0);

  const handleSendMessage = async (recipientId) => {
    const text = inputValues[recipientId];
    if (!text?.trim()) return;

    try {
      await sendMessage({
        variables: { recipientId, text },
        refetchQueries: [{ query: QUERY_ME }],
      });
      setInputValues((prev) => ({ ...prev, [recipientId]: "" }));
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const PER_PAGE = 9;
  const pageConvs = conversations.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <>
      <div className="text-center py-8">
        <h1 className="text-xl font-bold dark:text-white mb-2">Message Box</h1>
        <div className="flex justify-center items-center space-x-2">
          <MailIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          <span className="font-bold dark:text-white">
            {loggedInUser.receivedMessages?.length || 0}
          </span>
          {isLoggedInUser && (
            <button
              onClick={() => setShowUserListModal(true)}
              className={`ml-4 flex items-center px-3 py-1 rounded-md ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              } hover:bg-indigo-500 hover:text-white transition`}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              New
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {pageConvs.map((conv) => (
          <MessageCard
          isDarkMode={isDarkMode}
            key={conv.user._id}
            conv={conv}
            loggedInUser={loggedInUser}
            isLoggedInUser={isLoggedInUser}
            inputValue={inputValues[conv.user._id] || ""}
            onInputChange={(userId, value) =>
              setInputValues((prev) => ({ ...prev, [userId]: value }))
            }
            onSend={handleSendMessage}
            onDelete={(id) => removeMessage({ variables: { messageId: id } })}
            onReply={(user, msg) => {
              setSelectedRecipient(user);
              setSelectedMessage(msg);
              setShowChatModal(true);
            }}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={(page + 1) * PER_PAGE >= conversations.length}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <UserListModal
        show={showUserListModal}
        onClose={() => setShowUserListModal(false)}
        profiles={profiles}
        onSelectUser={(user) => {
          setSelectedRecipient(user);
          setShowUserListModal(false);
          setShowChatModal(true);
        }}
        isDarkMode={isDarkMode}
      />

      {showChatModal && selectedRecipient && (
        <ChatBox
          recipient={selectedRecipient}
          selectedMessage={selectedMessage}
          onCloseModal={() => {
            setShowChatModal(false);
            setSelectedRecipient(null);
            setSelectedMessage(null);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default MessageList;

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { REMOVE_MESSAGE, SEND_MESSAGE ,DELETE_CONVERSATION,} from "../../utils/mutations";
import { MailIcon, PlusIcon } from "@heroicons/react/solid";
import MessageBox from "../MessageBox";
import UserListModal from "../UserListModal";
import MessageCard from "../MessageCard";
import DeleteMessageModal from "../DeleteMessageModal";
import { getDateFromObjectId } from "../../utils/MessageUtils";

const MessageList = ({ isLoggedInUser = false, isDarkMode }) => {
  const { data: userData } = useQuery(QUERY_ME);
  const { data: profileData } = useQuery(QUERY_PROFILES);
  const [removeMessage] = useMutation(REMOVE_MESSAGE);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
    refetchQueries: [{ query: QUERY_ME }],
    onError: (error) => {
      console.error("Error deleting conversation:", error);
    },
  });

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);


const handleSendMessage = async (recipientId) => {
    const text = inputValues?.[recipientId] ?? "";
    if (!text.trim()) return;

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

  const handleDeleteMessage = (msgId) => {
    setDeleteMessageId(msgId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMessage = async () => {
    if (deleteMessageId) {
      await removeMessage({ variables: { messageId: deleteMessageId }, refetchQueries: [{ query: QUERY_ME }] });
    }
    setShowDeleteModal(false);
    setDeleteMessageId(null);
  };

  const cancelDeleteMessage = () => {
    setShowDeleteModal(false);
    setDeleteMessageId(null);
  };

  const handleDeleteConversation = async (userId) => {
    if (!userId) return;
    try {
      await deleteConversation({ variables: { userId } });
    } catch (err) {
      console.error("Error deleting conversation", err);
    }
  };

  const PER_PAGE = 9;
  const pageConvs = conversations.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <>
      <div className="text-center py-8">
        <h1 className="text-xl font-bold dark:text-white mb-2">Message Box</h1>
        <div className="flex justify-center items-center space-x-2">
          <MailIcon className="h-6 w-6 text-white dark:text-gray-300" />
          <span className="font-bold dark:text-white">
            {loggedInUser.receivedMessages?.length || 0}
          </span>
          {isLoggedInUser && (
            <button
              onClick={() => setShowUserListModal(true)}
              className={`ml-4 flex items-center px-3 py-1 rounded-md ${
                isDarkMode ? "bg-gray-700 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-gray-100"
              }  hover:text-white transition`}
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
            onInputChange={(userId, value) => {
              setInputValues((prev) => ({ ...prev, [userId]: value }));
            }}
            onSend={handleSendMessage}
            onDelete={handleDeleteMessage}
            onDeleteConversation={() => handleDeleteConversation(conv.user._id)}
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
          className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
        >
          Prev
        </button>
        <button
          disabled={(page + 1) * PER_PAGE >= conversations.length}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:text-white"
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
        <MessageBox
          recipient={selectedRecipient}
          selectedMessage={selectedMessage}
          onCloseModal={() => {
            setShowChatModal(false);
            setSelectedRecipient(null);
            setSelectedMessage(null);
          }}
          isDarkMode={isDarkMode}
          inputValue={inputValues[selectedRecipient?._id] || ""}
          setInputValue={(val) => setInputValues((prev) => ({ ...prev, [selectedRecipient._id]: val }))}
          onSendMessage={() => handleSendMessage(selectedRecipient._id)}
        />
      )}

      <DeleteMessageModal
        show={showDeleteModal}
        onConfirm={confirmDeleteMessage}
        onCancel={cancelDeleteMessage}
      />
    </>
  );
};

export default MessageList;
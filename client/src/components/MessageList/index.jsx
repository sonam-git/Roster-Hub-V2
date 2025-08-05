import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME, QUERY_PROFILES } from "../../utils/queries";
import { REMOVE_MESSAGE, SEND_MESSAGE ,DELETE_CONVERSATION,} from "../../utils/mutations";
import { HiMail, HiPlus, HiChatAlt2 } from "react-icons/hi";
import { FaUsers, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  const PER_PAGE = 6; // Reduced for better visual balance
  const pageConvs = conversations.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`max-w-md mx-auto p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <HiChatAlt2 className={`mx-auto mb-4 text-6xl ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Conversations Yet
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start chatting with your team members!
          </p>
          {isLoggedInUser && (
            <button
              onClick={() => setShowUserListModal(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <HiPlus className="inline-block w-5 h-5 mr-2" />
              Start New Conversation
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
            : 'bg-gradient-to-r from-white to-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <HiMail className={`w-6 h-6 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="text-left">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Message Center
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {loggedInUser.receivedMessages?.length || 0} total messages
              </p>
            </div>
          </div>
          
          {isLoggedInUser && (
            <button
              onClick={() => setShowUserListModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              }`}
            >
              <HiPlus className="w-5 h-5" />
              <span className="hidden sm:block">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

      {/* Modern Pagination */}
      {Math.ceil(conversations.length / PER_PAGE) > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              page === 0
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
          >
            <FaChevronLeft className="text-sm" />
            Previous
          </button>

          <div className={`px-4 py-2 rounded-xl font-bold ${
            isDarkMode 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {page + 1} of {Math.ceil(conversations.length / PER_PAGE)}
          </div>

          <button
            disabled={(page + 1) * PER_PAGE >= conversations.length}
            onClick={() => setPage((p) => p + 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              (page + 1) * PER_PAGE >= conversations.length
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
          >
            Next
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      )}

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
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default MessageList;
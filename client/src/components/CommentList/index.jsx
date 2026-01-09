import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/solid";
import { REMOVE_COMMENT, UPDATE_COMMENT } from "../../utils/mutations";
import CommentLike from "../CommentLike";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function CommentList({
  postId,
  comments,
  currentUserId,
}) {
  const { currentOrganization } = useOrganization();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [text, setText] = useState("");

  const [removeComment] = useMutation(REMOVE_COMMENT);
  const [updateComment] = useMutation(UPDATE_COMMENT);

  const handleDelete = async (commentId) => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await removeComment({
        variables: { 
          postId, 
          commentId,
          organizationId: currentOrganization._id
        },
      });
      // Post.jsx subscription will remove it from UI
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleSave = async (commentId) => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await updateComment({
        variables: { 
          commentId, 
          commentText: text,
          organizationId: currentOrganization._id
        },
      });
      setEditingCommentId(null);
      // Post.jsx subscription will update it in UI
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  
  return (
    <div className="space-y-3 w-full">
      {comments.length > 0 ? (
        comments.map((c) => (
          <div key={c._id} className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-3 px-2 sm:px-4 xl:px-8 rounded-2xl shadow border-2 border-blue-200 dark:border-gray-700 transition-all w-full">
            {editingCommentId === c._id ? (
              <>
                <textarea className="w-full p-2 mt-2 border rounded dark:text-black text-xs sm:text-sm" value={text} onChange={(e) => setText(e.target.value)} />
                <div className="mt-2 flex space-x-2">
                  <button onClick={() => handleSave(c._id)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-800 disabled:opacity-50 text-xs sm:text-sm">Save</button>
                  <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-800 disabled:opacity-50 text-xs sm:text-sm">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <Link to={`/profiles/${c.userId}`} className="font-semibold hover:no-underline dark:hover:text-yellow-300 dark:text-white text-xs sm:text-sm">{c.commentAuthor}</Link>
                <p className="mt-1 text-xs font-thin dark:text-white break-words whitespace-normal">{c.commentText}</p>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-gray-500 dark:text-gray-400">{new Date(parseInt(c.createdAt)).toLocaleString()}</span>
                  <CommentLike comment={c} currentUserId={currentUserId} />
                  {currentUserId === c.userId && (
                    <div className="flex space-x-2">
                      <button title="Edit Comment" className="flex items-center px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => { setEditingCommentId(c._id); setText(c.commentText); }}>
                        <PencilAltIcon className="h-5 w-5 text-blue-500 cursor-pointer" />
                      </button>
                      <button title="Delete Comment" className="flex items-center px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(c._id)}>
                        <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center italic dark:text-white">No comments yet</p>
      )}
    </div>
  );
}

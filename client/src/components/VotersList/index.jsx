// src/components/VotersList.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const VotersList = ({ yesVoters = [], noVoters = [] }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const bgColor     = isDarkMode ? "bg-gray-700"   : "bg-gray-300";
  const textColor   = isDarkMode ? "text-gray-200" : "text-gray-800";
  const borderColor = isDarkMode ? "border-gray-600" : "border-gray-400";

  return (
    <div className={`p-4 rounded-lg shadow-md ${bgColor} ${textColor}`}>
      <div className="overflow-x-auto">
        <table className={`w-full table-auto border-collapse border ${borderColor}`}>
          <thead>
            <tr>
              <th className={`text-left px-3 py-2 border-b ${borderColor}`}>
                Available ({yesVoters.length})
              </th>
              <th className={`text-left px-3 py-2 border-b ${borderColor}`}>
                Unavailable ({noVoters.length})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`align-top px-3 py-2 border-r ${borderColor}`}>
                {yesVoters.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {yesVoters.map(user => (
                      <li key={user.id || user._id}>{user.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-xs">No one has voted “Yes” yet.</p>
                )}
              </td>
              <td className={`align-top px-3 py-2 border-l ${borderColor}`}>
                {noVoters.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {noVoters.map(user => (
                      <li key={user.id || user._id}>{user.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-xs">No one has voted “No” yet.</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VotersList;

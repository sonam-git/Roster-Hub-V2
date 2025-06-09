import React, { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const PlayersList = ({ yesVoters, noVoters }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const bgColor = isDarkMode ? "bg-gray-700" : "bg-white";
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";

  return (
    <div className={`p-4 rounded-lg shadow-md space-y-6 ${bgColor} ${textColor}`}>
      {/* Available */}
      <div>
        <h4 className="text-xl font-semibold mb-2">
          Available Players ({yesVoters.length})
        </h4>
        {yesVoters.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {yesVoters.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="italic">No one has voted “Yes” yet.</p>
        )}
      </div>

      {/* Unavailable */}
      <div>
        <h4 className="text-xl font-semibold mb-2">
          Unavailable Players ({noVoters.length})
        </h4>
        {noVoters.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {noVoters.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="italic">No one has voted “No” yet.</p>
        )}
      </div>
    </div>
  );
};

export default PlayersList;

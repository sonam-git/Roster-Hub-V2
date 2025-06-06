import React, { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const PlayersList = ({ yesVoters, noVoters }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const textColor = isDarkMode ? "text-gray-200" : "text-gray-800";

  return (
    <div className="space-y-6">
      <div>
        <h4 className={`text-lg font-bold mb-2 ${textColor}`}>Available Players (Yes):</h4>
        {yesVoters.length > 0 ? (
          <ul className="list-disc list-inside">
            {yesVoters.map((name) => (
              <li key={name} className={textColor}>
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`italic ${textColor}`}>No one has voted “Yes” yet.</p>
        )}
      </div>
      <div>
        <h4 className={`text-lg font-bold mb-2 ${textColor}`}>Unavailable Players (No):</h4>
        {noVoters.length > 0 ? (
          <ul className="list-disc list-inside">
            {noVoters.map((name) => (
              <li key={name} className={textColor}>
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`italic ${textColor}`}>No one has voted “No” yet.</p>
        )}
      </div>
    </div>
  );
};

export default PlayersList;

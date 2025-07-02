import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol, faPersonRunning, faCalendarAlt, faPlus, faInbox, faStar, faHome, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";

const BUTTONS = [
  { key: "home", label: "Home", icon: faHome, path: "/" },
  { key: "gameschedule", label: "Game Schedule", icon: faCalendarAlt, path: "/games-shortcut" },
  { key: "creategame", label: "Create Game", icon: faPlus, path: "/game-schedule#create" },
  { key: "inbox", label: "Inbox", icon: faInbox, path: "/message" },
  { key: "skilllist", label: "Skills", icon: faStar, path: "/skills-shortcut" },
  { key: "about", label: "About", icon: faInfoCircle, path: "/about" },
];

export default function TopHeader({ className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useQuery(QUERY_ME);
  const username = data?.me?.name || "Player";
  return (
    <div className={`w-full flex flex-col sm:flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 py-2 shadow-md sticky top-0 z-30 px-4 ${typeof className !== 'undefined' ? className : ''}`}>
      {/* Left: Username and soccer icon */}
      <div className="hidden sm:flex items-center space-x-2 mb-2 sm:mb-0 w-full sm:w-auto justify-center">
        <FontAwesomeIcon icon={faPersonRunning} className="ml-2 text-green-500 text-2xl" />
        <FontAwesomeIcon icon={faFutbol} className="text-blue-600 text-xl animate-bounce" />
        <span className="font-extrabold text-2xl italic tracking-wide text-gray-800 dark:text-white drop-shadow-md flex items-center gap-2" style={{ fontFamily: 'cursive, sans-serif' }}>
          {username}
        </span>
      </div>
      {/* Center: Menu buttons */}
      <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center flex-1 w-full sm:w-auto gap-y-2">
        {BUTTONS.map(btn => (
          <button
            key={btn.key}
            className={`dark:text-gray-900 mx-2 px-4 py-1 rounded-full font-semibold transition-colors text-sm flex items-center gap-2 mb-2 sm:mb-0 ${location.pathname === btn.path.split('#')[0] ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"}`}
            onClick={() => {
              if (btn.key === "creategame") {
                navigate("/game-schedule", { state: { scrollTo: "gameform" } });
              } else {
                navigate(btn.path);
              }
            }}
          >
            <FontAwesomeIcon icon={btn.icon} className="mr-1" />
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

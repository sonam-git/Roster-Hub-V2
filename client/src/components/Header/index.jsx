// src/components/Header.jsx

import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_ME, QUERY_GAMES } from "../../utils/queries";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import Auth from "../../utils/auth";
import { ThemeContext } from "../ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

import controlImage from "../../assets/images/iconizer-arrow-left.png";
import lightLogo from "../../assets/images/roster-hub-logo.png";
import darkLogo from "../../assets/images/dark-logo.png";
import chartFillImage from "../../assets/images/iconizer-home.png";
import chatImage from "../../assets/images/iconizer-message.png";
import skillImage from "../../assets/images/iconizer-skill.png";
import userImage from "../../assets/images/iconizer-account.png";
import rosterImage from "../../assets/images/iconizer-roster.png";
import logoutImage from "../../assets/images/iconizer-logout.png";
import loginImage from "../../assets/images/iconizer-login.png";
import signupImage from "../../assets/images/iconizer-signup.png";
import calenderImage from "../../assets/images/iconizer-calender.png";

const Header = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // 1) live message count
  const { data: meData } = useQuery(QUERY_ME, {
    pollInterval: 5000,
  });
  const messageCount = meData?.me?.receivedMessages?.length || 0;

  // 2) fetch all games to compute badges
const { data: allGamesData } = useQuery(QUERY_GAMES, {
  fetchPolicy: "network-only",
});
const allGames = allGamesData?.games || [];

// count pending and confirmed
const pendingCount   = allGames.filter(g => g.status === "PENDING").length;
const confirmedCount = allGames.filter(g => g.status === "CONFIRMED").length;

// total of those two
const gameBadgeCount = pendingCount + confirmedCount;

  // handle logout
  const handleLogout = () => {
    navigate("/", {
      replace: true,
      state: { message: "Thank you for using Roster Hub!" },
    });
    Auth.logout();
  };

  const Menus = Auth.loggedIn()
    ? [
        { title: "Home", src: chartFillImage, path: "/" },
        { title: "My Profile", src: userImage, path: "/me" },
        { title: "Roster", src: rosterImage, path: "/roster" },
        { title: "Skill - List", src: skillImage, path: "/skill" },
        {
          title: "Message",
          src: chatImage,
          path: "/message",
          badge: messageCount,
        },
        {
          title: "Game - Schedule",
          src: calenderImage,
          path: "/game-schedule",
          badge: gameBadgeCount,
        },
        { title: "ScoreBoard", src: skillImage, path: "/scoreboard" },
        { title: "Logout", src: logoutImage, action: handleLogout },
      ]
    : [
        { title: "Login", src: loginImage, path: "/login" },
        { title: "Signup", src: signupImage, path: "/signup" },
      ];

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <div
        className={`fixed lg:static top-0 left-0 h-full p-5 pt-2 transition-all duration-300 z-50 ${
          open ? "w-55" : "hidden lg:block lg:w-28"
        } ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} lg:bg-transparent`}
      >
        <img
          src={controlImage}
          className={`hidden lg:block absolute cursor-pointer right-3 mt-2 w-6 md:w-8 lg:w-10 border-dark-blue border-2 rounded-full bg-white transform transition-transform duration-300 ${
            open ? "" : "rotate-180"
          }`}
          onClick={toggleMenu}
          alt="toggle menu"
        />

        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to={"/"}
              className="flex items-center w-full no-underline"
              style={{ textDecoration: "none" }}
            >
              <img
                src={isDarkMode ? darkLogo : lightLogo}
                className={`dark:text-white cursor-pointer duration-500 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 pt-5 ${
                  open && "rotate-[360deg]"
                }`}
                alt="logo"
              />
              <h1
                className={`dark:text-white origin-left mt-5 font-bold text-sm lg:text-3xl duration-200 ${
                  !open && "scale-0"
                }`}
              >
                RosterHub
              </h1>
            </Link>
          </div>
        </div>

        <ul className="pt-6 mt-8">
          <li
            className={`flex rounded-md p-2 cursor-pointer items-center gap-x-4 mt-2 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
            }`}
            onClick={toggleDarkMode}
          >
            <button className="flex items-center w-full no-underline">
              <div className="flex items-center">
                <span className="text-white p-1.5 md:p-2 lg:p-2.5 rounded-full bg-gray-700 dark:bg-gray-500">
                  {isDarkMode ? "☀️" : "🌙"}
                </span>
                <span
                  className={`${
                    !open && "hidden"
                  } origin-left duration-200 text-sm md:text-base lg:text-lg font-serif ml-2 md:ml-4 lg:ml-6 hover:text-blue-400`}
                >
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </div>
            </button>
          </li>

          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex rounded-md p-2 cursor-pointer items-center gap-x-4 mt-2
      ${
        location.pathname === Menu.path
          ? "bg-gray-800 text-white dark:bg-gray-600"
          : " text-black  dark:text-white"
      }
    `}
                onClick={() => {
    // run action if it exists (e.g. logout)
    if (Menu.action) Menu.action();
    // always close the mobile menu
    setOpen(false);
  }}
            >
              {Menu.path ? (
                <Link
                  to={Menu.path}
                  className="flex items-center w-full no-underline"
                  style={{ textDecoration: "none" }}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center">
                    <img
                      src={Menu.src}
                      alt={Menu.title}
                      className="w-8 md:w-8 lg:w-10 mr-2 p-1  dark:hover:text-red hover:bg-gray-800 rounded-full transition-all duration-300"
                    />
                    <span
                      className={`${
                        !open && "hidden"
                      } origin-left duration-200 md:text-base lg:text-lg flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 dark:text-white text-lg font-bold`}
                    >
                      {Menu.title}
                      {Menu.badge > 0 && (
                        <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                          {Menu.badge}
                        </span>
                      )}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center w-full no-underline">
                  <div className="flex items-center">
                    <img
                      src={Menu.src}
                      alt={Menu.title}
                      className="w-6 md:w-8 lg:w-10 mr-2 p-1 hover:bg-gray-800 rounded-full transition-all duration-300"
                    />
                    <span
                      className={`${
                        !open && "hidden"
                      } origin-left duration-200 text-sm md:text-base lg:text-lg px-3 py-1 rounded 
    ${
      Menu.title === "Logout"
        ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        : "text-blue-500 hover:text-red-500"
    }`}
                    >
                      {Menu.title}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <button
          className={`fixed justify-center top-4 left-6 lg:hidden p-2 rounded-md border border-black ${
            isDarkMode
              ? "bg-gray-200 text-black"
              : " text-black rounded-md border border-black"
          } z-50`}
          onClick={toggleMenu}
        >
          <FontAwesomeIcon
            icon={open ? faTimes : faBars}
            className="text-2xl"
          />
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default Header;

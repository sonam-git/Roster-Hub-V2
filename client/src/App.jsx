// src/App.jsx
import React, { useContext, useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
  useQuery,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Roster from "./pages/Roster";
import Message from "./pages/Message";
import Skill from "./pages/Skill";
import Game from "./pages/Game";
import Score from "./pages/Score";
import ForgotPassword from "./pages/ForgetPassword";
import PasswordReset from "./pages/PasswordReset";
import { ThemeProvider, ThemeContext } from "./components/ThemeContext";
import ChatPopup from "./components/ChatPopup";
import { QUERY_ME } from "./utils/queries";
import Auth from "./utils/auth";
import MainHeader from "./components/MainHeader";
import TopHeader from "./components/TopHeader";
import CustomComingGames from "./components/CustomComingGames";
import AllSkillsList from "./components/AllSkillsList";
import About from "./pages/About";
import fieldImage from "./assets/images/field.webp";

// Define HTTP and WebSocket URIs based on environment
const httpUri =
  import.meta.env.MODE === "production"
    ? "https://roster-hub-v2-240f2b371524.herokuapp.com/graphql"
    : "http://localhost:3001/graphql";

const wsUri =
  import.meta.env.MODE === "production"
    ? "wss://roster-hub-v2-240f2b371524.herokuapp.com/graphql"
    : "ws://localhost:3001/graphql";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = createHttpLink({ uri: httpUri });

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => ({
      token: localStorage.getItem("id_token") || "",
    }),
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// ─── App Content ───
function AppContent({ sidebarOpen, setSidebarOpen }) {
  const { isDarkMode } = useContext(ThemeContext);
  const { data } = useQuery(QUERY_ME);
  const currentUser = data?.me;
  const location = useLocation();

  // Define routes that should have the sport/soccer background
  const sportsStyleRoutes = ['/login', '/signup', '/'];

  // Check if current route should have sports styling
  const shouldUseSportsBackground = sportsStyleRoutes.includes(location.pathname);

  const getSportsBackground = () => {
    const isLargeScreen = window.innerWidth >= 1024;
    
    if (isDarkMode) {
      return {
        className: `relative overflow-hidden min-h-screen
                   ${isLargeScreen 
                     ? 'lg:before:absolute lg:before:inset-0 lg:before:z-[-1] lg:before:opacity-25 lg:after:absolute lg:after:inset-0 lg:after:bg-gradient-to-br lg:after:from-blue-900/70 lg:after:via-blue-800/50 lg:after:to-slate-900/60 lg:after:z-[-1]'
                     : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700'
                   }`,
        style: isLargeScreen ? {
          backgroundImage: `url(${fieldImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}
      };
    } else {
      return {
        className: `relative overflow-hidden min-h-screen
                   ${isLargeScreen 
                     ? 'lg:before:absolute lg:before:inset-0 lg:before:z-[-1] lg:before:opacity-20 lg:after:absolute lg:after:inset-0 lg:after:bg-gradient-to-br lg:after:from-blue-500/40 lg:after:via-white/70 lg:after:to-white/90 lg:after:z-[-1]'
                     : 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600'
                   }`,
        style: isLargeScreen ? {
          backgroundImage: `url(${fieldImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}
      };
    }
  };

  const getDefaultBackground = () => {
    return {
      className: isDarkMode ? "bg-gray-900" : "bg-gray-50",
      style: {}
    };
  };

  const backgroundConfig = shouldUseSportsBackground ? getSportsBackground() : getDefaultBackground();

  return (
    <>
      <div
        className={`flex transition-colors duration-300 ${backgroundConfig.className}`}
        style={backgroundConfig.style}
      >
        <Header open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 pt-2 md:pt-2">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/games-shortcut"
              element={<CustomComingGames isDarkMode={isDarkMode} />}
            />
            <Route
              path="/skills-shortcut"
              element={<AllSkillsList isDarkMode={isDarkMode} />}
            />
            <Route path="/roster" element={<Roster />} />
            <Route
              path="/message"
              element={<Message isDarkMode={isDarkMode} />}
            />
            <Route path="/skill" element={<Skill isDarkMode={isDarkMode} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/profiles/:profileId" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<PasswordReset />} />
            <Route path="/game-schedule" element={<Game />} />
            <Route
              path="/game-schedule/:gameId"
              element={<Game isDarkMode={isDarkMode} />}
            />
            <Route path="/scoreboard" element={<Score />} />
            <Route path="/about" element={<About />} />
          </Routes>
          {Auth.loggedIn() && currentUser && (
            <ChatPopup currentUser={currentUser} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

// ─── Main App ───
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <MainHeader open={sidebarOpen} setOpen={setSidebarOpen} />
            <TopHeader onToggleMenu={() => setSidebarOpen((v) => !v)} open={sidebarOpen} />
            <AppContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

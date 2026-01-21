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
import GameCreate from "./pages/GameCreate";
import GameSearch from "./pages/GameSearch";
import GameUpdatePage from "./pages/GameUpdatePage";
import Score from "./pages/Score";
import ForgotPassword from "./pages/ForgetPassword";
import PasswordReset from "./pages/PasswordReset";
import AdminPanel from "./pages/AdminPanel";
import { ThemeProvider, ThemeContext } from "./components/ThemeContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
// import { OrganizationProvider } from "./contexts/OrganizationContext-simple"; // TEMPORARY: Using simplified version
import ChatPopup from "./components/ChatPopup";
import { QUERY_ME } from "./utils/queries";
import Auth from "./utils/auth";
import MainHeader from "./components/MainHeader";
import TopHeader from "./components/TopHeader";
import CustomComingGames from "./components/CustomComingGames";
import AllSkillsList from "./components/AllSkillsList";
import About from "./pages/About";
import ErrorBoundary from "./components/ErrorBoundary";
import HelpCenter from "./pages/HelpCenter";
import FAQ from "./pages/FAQ";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";

// Define HTTP and WebSocket URIs based on environment
const httpUri =
  import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD
    ? "https://rosterhub-production.up.railway.app/graphql"
    : "http://localhost:3001/graphql");

const wsUri =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.PROD
    ? "wss://rosterhub-production.up.railway.app/graphql"
    : "ws://localhost:3001/graphql");

// Debug logging
console.log('🔧 Environment Debug:', {
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  httpUri,
  wsUri,
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

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
  const { data } = useQuery(QUERY_ME, {
    skip: !Auth.loggedIn(), // Only run query if user is logged in
  });
  const currentUser = data?.me;
  const location = useLocation();

  // Define routes that should have the sport/soccer background
  const sportsStyleRoutes = ['/login', '/signup', '/'];

  // Check if current route should have sports styling
  const shouldUseSportsBackground = sportsStyleRoutes.includes(location.pathname);

  const getSportsBackground = () => {
    return {
      className: isDarkMode ? "relative overflow-hidden min-h-screen bg-gray-900" : "relative overflow-hidden min-h-screen bg-white",
      style: {}
    };
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
        className={`flex min-h-screen transition-colors duration-300 overflow-x-hidden ${backgroundConfig.className}`}
        style={backgroundConfig.style}
      >
        <Header open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 transition-all duration-300 pt-40 lg:pt-0 relative z-[2] flex flex-col overflow-x-hidden`}>
          <main role="main" className="flex-1 overflow-x-hidden">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/upcoming-games"
              element={<CustomComingGames isDarkMode={isDarkMode} />}
            />
            <Route
              path="/recent-skills"
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
            <Route path="/game-create" element={<GameCreate />} />
            <Route path="/game-search" element={<GameSearch />} />
            <Route
              path="/game-schedule/:gameId"
              element={<Game isDarkMode={isDarkMode} />}
            />
            <Route path="/scoreboard" element={<Score />} />
            <Route path="/about" element={<About />} />
            <Route path="/game-update/:gameId" element={<GameUpdatePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* Footer Pages */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
          </Routes>
          </main>
          {Auth.loggedIn() && currentUser && (
            <ChatPopup currentUser={currentUser} isDarkMode={isDarkMode} />
          )}
          <Footer />
        </div>
      </div>
    </>
  );
}

// ─── Main App ───
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ApolloProvider client={client}>
        <ErrorBoundary fallbackMessage="Failed to load the application. Please refresh the page.">
          <OrganizationProvider>
            <ThemeProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <MainHeader 
                  open={sidebarOpen} 
                  setOpen={setSidebarOpen} 
                />
                {/* TopHeader - always visible, positioned with fixed */}
                <TopHeader 
                  onToggleMenu={() => setSidebarOpen((v) => !v)} 
                  open={sidebarOpen} 
                />
                <AppContent 
                  sidebarOpen={sidebarOpen} 
                  setSidebarOpen={setSidebarOpen} 
                />
              </Router>
            </ThemeProvider>
          </OrganizationProvider>
        </ErrorBoundary>
      </ApolloProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
// src/App.jsx
import React, { useContext } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
  useQuery,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
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



// ─── Apollo Setup ───
const httpUri = "http://localhost:3001/graphql";
const wsUri   = "ws://localhost:3001/graphql";

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
      authorization: `Bearer ${localStorage.getItem("id_token") || ""}`,
    }),
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" &&
      def.operation === "subscription"
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
function AppContent() {
  const { isDarkMode } = useContext(ThemeContext);
  const { data } = useQuery(QUERY_ME);
  const currentUser = data?.me;

  return (
    <>
      <div
        className={`flex min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-300 text-black"
        }`}
      >
        <Header />
        <div className="flex-1 mt-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route
              path="/message"
              element={<Message isDarkMode={isDarkMode} />}
            />
            <Route
              path="/skill"
              element={<Skill isDarkMode={isDarkMode} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/profiles/:profileId" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:token"
              element={<PasswordReset />}
            />
            <Route path="/game-schedule" element={<Game />} />
            <Route
              path="/game-schedule/:gameId"
              element={<Game isDarkMode={isDarkMode} />}
            />
            <Route path="/scoreboard" element={<Score />} />
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
            <MainHeader />
            <AppContent />
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

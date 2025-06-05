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
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Roster from "./pages/Roster";
import Message from "./pages/Message";
import Skill from "./pages/Skill";
import ForgotPassword from "./pages/ForgetPassword";
import PasswordReset from "./pages/PasswordReset";
import { ThemeProvider, ThemeContext } from "./components/ThemeContext";
import ChatPopup from "./components/ChatPopup";
import { QUERY_ME } from "./utils/queries";
import Auth from "./utils/auth";
import MainHeader from "./components/MainHeader";

// --- Apollo Setup ---

// Define HTTP and WebSocket URIs based on environment
const httpUri = "http://localhost:3001/graphql";

const wsUri = "ws://localhost:3001/graphql";

// Auth middleware for HTTP requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// HTTP Link
const httpLink = createHttpLink({ uri: httpUri });

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    connectionParams: () => ({
      authorization: `Bearer ${localStorage.getItem("id_token") || ""}`,
    }),
  })
);

// Split Link to route queries/mutations vs subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// --- App Content with Routing ---

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
            <Route path="/message" element={<Message isDarkMode={isDarkMode} />} />
            <Route path="/skill" element={<Skill isDarkMode={isDarkMode}  />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/profiles/:profileId" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<PasswordReset />} />
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

// --- Main App ---

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <Router>
          <MainHeader/>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
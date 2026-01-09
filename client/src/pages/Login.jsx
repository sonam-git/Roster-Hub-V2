// src/pages/Login.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import { LOGIN_USER, LOGIN_WITH_GOOGLE, ADD_PROFILE } from "../utils/mutations";
import Auth from "../utils/auth";
import sketchImage from "../assets/images/sketch-removebg.png"; 

const Login = () => {
  const [loginMode, setLoginMode] = useState("login"); // "login" or "join"
  const [formState, setFormState] = useState({ 
    name: "",
    email: "", 
    password: "",
    inviteCode: ""
  });
  const [login] = useMutation(LOGIN_USER);
  const [addProfile] = useMutation(ADD_PROFILE);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-dismiss error after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000); // Increased to 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (loginMode === "login") {
        // Existing user login
        const { data } = await login({
          variables: { 
            email: formState.email, 
            password: formState.password 
          },
        });
        Auth.login(data.login.token);
      } else {
        // New player joining team
        const { data } = await addProfile({
          variables: {
            name: formState.name,
            email: formState.email,
            password: formState.password,
            inviteCode: formState.inviteCode.trim().toUpperCase(),
          },
        });
        Auth.login(data.addProfile.token);
      }
      setFormState({ name: "", email: "", password: "", inviteCode: "" });
    } catch (err) {
      console.error(err);
      
      // Create a more user-friendly error object
      let friendlyError = { ...err };
      
      if (err.message && err.message.includes("E11000") && err.message.includes("email")) {
        friendlyError.message = "This email is already registered. Please use the login mode to sign in, or use a different email address.";
      } else if (err.message && err.message.includes("duplicate key")) {
        friendlyError.message = "This email is already in use. Please switch to 'Sign In' mode or use a different email.";
      } else if (err.message && err.message.includes("already a member")) {
        friendlyError.message = "You are already a member of this team. Please use 'Sign In' mode to login.";
      } else if (err.message && err.message.includes("Invalid invitation code")) {
        friendlyError.message = "Invalid team code. Please check the code and try again.";
      } else if (err.message && err.message.includes("member limit")) {
        friendlyError.message = "This team has reached its member limit. Please contact the team administrator.";
      } else if (err.message && err.message.includes("password")) {
        friendlyError.message = "Incorrect email or password. Please try again.";
      }
      
      setError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await loginWithGoogle({
        variables: { idToken: credentialResponse.credential },
      });
      Auth.login(data.loginWithGoogle.token);
    } catch (err) {
      console.error("Google login failed", err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign In was unsuccessful.");
    setError(new Error("Google Sign In failed"));
  };

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Full-page Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-20"
          style={{
            backgroundImage: `url(${sketchImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
          }}
        ></div>
        
        {/* Lighter gradient overlays for better text readability while keeping image visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/85 via-blue-50/75 to-indigo-100/85 dark:from-gray-950/85 dark:via-slate-900/75 dark:to-indigo-950/85"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-white/15 dark:from-black/25 dark:via-transparent dark:to-black/15"></div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Enhanced Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Enhanced Floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400/60 to-cyan-400/60 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-green-400/60 to-emerald-400/60 rotate-45 animate-ping shadow-lg"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full animate-bounce shadow-lg"></div>
        <div className="absolute top-60 right-60 w-5 h-5 bg-gradient-to-r from-indigo-400/60 to-purple-400/60 rounded-full animate-bounce delay-300 shadow-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto lg:px-8 py-8 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-6xl">
          {/* Left side: Logo and branding */}
          <div className="hidden lg:flex flex-col items-center text-center space-y-6">
            {/* Welcome message with modern styling */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-oswald font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight leading-none drop-shadow-2xl">
                WELCOME TO <span className="text-green-500 dark:text-green-400">ROSTERHUB</span>
              </h1>
              <div className="max-w-lg mx-auto p-4 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10">
                <p className="text-lg text-gray-800 dark:text-gray-100 font-oswald font-semibold tracking-wide drop-shadow-lg">
                  WHERE PLAYERS <span className="text-green-500 dark:text-green-400 animate-pulse">CONNECT</span> & <span className="text-blue-500 dark:text-blue-400 animate-pulse delay-300">UNDERSTAND</span> BEFORE THE GAME!
                </p>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
            </div>

            {/* Enhanced Features card */}
            <div className="backdrop-blur-xl bg-white/30 dark:bg-black/20 rounded-2xl p-6 border border-white/40 dark:border-white/15 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 drop-shadow-md">
                🚀 Ready to Get Started?
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400/80 to-emerald-500/80 dark:from-green-500/70 dark:to-emerald-600/70 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="drop-shadow-sm">Connect with your team</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400/80 to-indigo-500/80 dark:from-blue-500/70 dark:to-indigo-600/70 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="drop-shadow-sm">Track performance metrics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400/80 to-pink-500/80 dark:from-purple-500/70 dark:to-pink-600/70 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="drop-shadow-sm">Manage game schedules</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side: Login Form */}
          <div className="w-full lg:w-auto">
            <div className="backdrop-blur-xl bg-white/40 dark:bg-black/20 rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-white/20 w-full max-w-md mx-auto hover:shadow-3xl transition-all duration-500">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-oswald font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-2xl tracking-wide">
                  {loginMode === "login" ? "WELCOME BACK! 👋" : "JOIN YOUR TEAM! 🎯"}
                </h2>
                <div className="max-w-sm mx-auto p-3 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10">
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-oswald font-semibold tracking-wide drop-shadow-lg">
                    {loginMode === "login" 
                      ? "SIGN IN TO YOUR ACCOUNT TO CONTINUE" 
                      : "ENTER YOUR TEAM CODE TO GET STARTED"
                    }
                  </p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="mb-6">
                <div className="bg-gray-100/80 dark:bg-gray-700/50 backdrop-blur-md rounded-xl p-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode("login");
                      setFormState({ name: "", email: "", password: "", inviteCode: "" });
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      loginMode === "login"
                        ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    🔑 Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode("join");
                      setFormState({ name: "", email: "", password: "", inviteCode: "" });
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      loginMode === "join"
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    👥 Join Team
                  </button>
                </div>
              </div>

                {/* Error Alert */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-100/90 dark:bg-red-900/40 backdrop-blur-md border border-red-300/60 dark:border-red-700/60 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-xl text-sm flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span className="drop-shadow-sm">{error.message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Name (only for join mode) */}
                {loginMode === "join" && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="Enter your name"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                    minLength={loginMode === "join" ? 6 : undefined}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder={loginMode === "join" ? "Create password (min 6 characters)" : "Enter your password"}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Team Code (only for join mode) */}
                {loginMode === "join" && (
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Team Invite Code
                    </label>
                    <input
                      id="inviteCode"
                      name="inviteCode"
                      type="text"
                      value={formState.inviteCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 uppercase"
                      placeholder="Enter 8-digit team code"
                      maxLength={12}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      🔑 Get this code from your team administrator
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`group relative w-full px-8 py-4 ${
                      loginMode === "login"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    } text-white font-oswald font-bold tracking-wide rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-base border ${
                      loginMode === "login" ? "border-green-400/50" : "border-blue-400/50"
                    } overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {loginMode === "login" ? "SIGNING IN..." : "JOINING TEAM..."}
                        </>
                      ) : (
                        <>
                          {loginMode === "login" ? "🚀 SIGN IN" : "👥 JOIN TEAM"}
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3 text-sm">
                  <Link
                    to="/signup"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-center py-2 transition-colors hover:underline"
                  >
                    🆕 Create New Team
                  </Link>
                  {loginMode === "login" && (
                    <Link
                      to="/forgot-password"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-center py-2 transition-colors hover:underline"
                    >
                      🔑 Forgot Password?
                    </Link>
                  )}
                </div>
              </form>

              {/* Divider - only show for login mode */}
              {loginMode === "login" && (
                <>
                  <div className="my-6 w-full">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200/50 dark:border-gray-600/50"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-600 dark:text-gray-300 font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Login */}
                  <div className="flex justify-center w-full">
                    <div className="bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl p-2 border border-gray-200/50 dark:border-gray-600/50">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Success Message */}
              {Auth.loggedIn() && (
                <div className="mt-4 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-md border border-green-300/50 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl text-center font-semibold">
                  🎉 Success! You are now logged in.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

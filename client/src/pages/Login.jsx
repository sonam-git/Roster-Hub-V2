// src/pages/Login.jsx

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import { LOGIN_USER, LOGIN_WITH_GOOGLE, ADD_PROFILE } from "../utils/mutations";
import Auth from "../utils/auth";
import { ThemeContext } from "../components/ThemeContext"; 

const Login = () => {
  const [searchParams] = useSearchParams();
  const inviteCodeFromUrl = searchParams.get("inviteCode");
  
  const [loginMode, setLoginMode] = useState(inviteCodeFromUrl ? "join" : "login"); // "login" or "join"
  const [formState, setFormState] = useState({ 
    name: "",
    email: "", 
    password: "",
    inviteCode: inviteCodeFromUrl || ""
  });
  
  // If invite code is in URL, switch to join mode and fill the code
  useEffect(() => {
    if (inviteCodeFromUrl) {
      setLoginMode("join");
      setFormState(prev => ({ 
        ...prev, 
        inviteCode: inviteCodeFromUrl.trim().toUpperCase() 
      }));
    }
  }, [inviteCodeFromUrl]);
  const [login] = useMutation(LOGIN_USER);
  const [addProfile] = useMutation(ADD_PROFILE);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get theme context
  const { isDarkMode} = React.useContext(ThemeContext);

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
        // New player joining existing team with invite code
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
  }

  return (
    <main className="relative overflow-hidden min-h-screen ">
      {/* Theme Toggle Button - Fixed in top right */}
      {/* <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          // Sun icon for light mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button> */}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
          {/* Left side: Branding */}
          <div className="hidden lg:flex flex-col space-y-8">
            {/* Logo */}
            <div >
              <img
                src={isDarkMode ? "/RH-Logo.png" : "/RH-Logo-Light.png"}
                alt="RosterHub Logo"
                className="w-52 h-52 object-contain"
              />
            </div>
            
            {/* Title and tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Welcome to RosterHub
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Streamline your team management and player coordination with professional tools designed for success.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Connect with your team</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Real-time communication and updates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Track performance metrics</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Detailed analytics and insights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Manage game schedules</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Comprehensive scheduling tools</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Login Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {loginMode === "login" ? "Sign in" : "Join your team"}
                  </h2>
                  <Link
                    to="/"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Back to home"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </Link>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loginMode === "login" 
                    ? "Enter your credentials to access your account" 
                    : "Use your team invite code to get started"
                  }
                </p>
              </div>

              {/* Mode Selector */}
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode("login");
                      setFormState({ name: "", email: "", password: "", inviteCode: inviteCodeFromUrl || "" });
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                      loginMode === "login"
                        ? "bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode("join");
                      setFormState({ name: "", email: "", password: "", inviteCode: inviteCodeFromUrl || "" });
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                      loginMode === "join"
                        ? "bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Join Team
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span>{error.message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name (only for join mode) */}
                {loginMode === "join" && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your name"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={loginMode === "join" ? "Create password (min 6 characters)" : "Enter your password"}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Team Code (only for join mode) */}
                {loginMode === "join" && (
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Invite Code
                    </label>
                    <input
                      id="inviteCode"
                      name="inviteCode"
                      type="text"
                      value={formState.inviteCode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors uppercase"
                      placeholder="Enter 8-digit team code"
                      maxLength={12}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get this code from your team administrator
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loginMode === "login" ? "Signing in..." : "Creating account..."}
                      </span>
                    ) : (
                      loginMode === "login" ? "Sign in" : "Create account"
                    )}
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3 text-sm">
                  <Link
                    to="/signup"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center transition-colors hover:underline underline-offset-4"
                  >
                    Create new team
                  </Link>
                  {loginMode === "login" && (
                    <Link
                      to="/forgot-password"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-center transition-colors hover:underline underline-offset-4"
                    >
                      Forgot password?
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
                        <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Login */}
                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>
                </>
              )}

              {/* Success Message */}
              {Auth.loggedIn() && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-center text-sm font-medium">
                  Success! You are now logged in.
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

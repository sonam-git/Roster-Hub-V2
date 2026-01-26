import { useEffect, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_PROFILE } from "../utils/mutations";
import Auth from "../utils/auth";
import InvitePlayersModal from "../components/InvitePlayersModal";
import { ThemeContext } from "../components/ThemeContext";
import React from "react"; 

const Signup = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    teamName: "",
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [newOrganization, setNewOrganization] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [addProfile] = useMutation(ADD_PROFILE);
  const [isPending, startTransition] = useTransition();

  // Get theme context
  const { isDarkMode, } = React.useContext(ThemeContext);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const variables = {
          name: formState.name,
          email: formState.email,
          password: formState.password,
        };

        // Add organizationName for team creation
        if (formState.teamName.trim()) {
          variables.organizationName = formState.teamName.trim();
        }

        const { data } = await addProfile({
          variables,
        });

        // Store organization info before logging in
        if (data?.addProfile?.organization) {
          setNewOrganization(data.addProfile.organization);
          setShowSuccess(true);
        }

        // Wait a moment to show success message before redirect
        setTimeout(() => {
          Auth.login(data.addProfile.token);
        }, 2000);
      } catch (e) {
        console.error("Signup error:", e);
        console.error("Error details:", {
          message: e.message,
          graphQLErrors: e.graphQLErrors,
          networkError: e.networkError,
          extraInfo: e.extraInfo
        });
        
        // Handle duplicate email error specifically
        let friendlyMessage = "Team creation failed. Please try again.";
        
        if (e.message && e.message.includes("E11000") && e.message.includes("email")) {
          friendlyMessage = "This email is already registered. Please login with your existing account or use a different email.";
        } else if (e.message && e.message.includes("duplicate key")) {
          friendlyMessage = "This email is already in use. Please login with your existing account or use a different email.";
        } else if (e.message && e.message.includes("already registered")) {
          friendlyMessage = "This email is already registered. Please login with your existing account or use a different email.";
        } else if (e.graphQLErrors && e.graphQLErrors.length > 0) {
          friendlyMessage = e.graphQLErrors[0].message || friendlyMessage;
        } else if (e.message) {
          friendlyMessage = e.message;
        }
        
        setErrorMessage(friendlyMessage);
        setShowError(true);
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 5000); // Increased to 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <main className="relative overflow-hidden min-h-screen  ">

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
            <div>
              <img
                src={isDarkMode ? "/RH-Logo.png" : "/RH-Logo-Light.png"}
                alt="RosterHub Logo"
                className="w-52 h-52 object-contain"
              />
            </div>
            
            {/* Title and tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Create your team
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Start managing your team with professional tools designed for success.
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Build your championship team</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Organize and manage players effectively</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced analytics and insights</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Track performance metrics in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Comprehensive game management</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Schedule and track all your games</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Signup Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Create your team
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
                  Start managing your team today
                </p>
              </div>

              {/* Error Alert */}
              {showError && (
                <div className="mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium">{errorMessage}</p>
                        {errorMessage.includes("already registered") && (
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-1 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium mt-2 text-xs"
                          >
                            Go to login page
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message with Invite Code */}
              {showSuccess && newOrganization && (
                <div className="mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Team created successfully!</span>
                    </div>
                    <p className="text-sm mb-3">Your team "{newOrganization.name}" has been created.</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-green-200 dark:border-green-700 mb-3">
                      <p className="text-xs font-medium mb-1">Share this code with your team:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-semibold bg-green-50 dark:bg-green-950/50 px-3 py-1 rounded border border-green-300 dark:border-green-700">
                          {newOrganization.inviteCode}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(newOrganization.inviteCode);
                            alert("Invite code copied to clipboard!");
                          }}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    {/* Invite via Email Button */}
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Invite players via email
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name / Username */}
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
                    disabled={isPending}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                    disabled={isPending}
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
                    minLength={6}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Minimum 6 characters"
                    disabled={isPending}
                  />
                </div>

                {/* Team Name */}
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Name <span className="text-gray-500 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    value={formState.teamName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., My Team FC"
                    disabled={isPending}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to use "{formState.name}'s Team"
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating team...
                      </span>
                    ) : (
                      "Create team"
                    )}
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="text-center pt-4">
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors hover:underline underline-offset-4"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </form>

              {/* Terms notice */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Players Modal */}
      {newOrganization && (
        <InvitePlayersModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organization={newOrganization}
        />
      )}
    </main>
  );
};

export default Signup;

// src/pages/Login.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import { LOGIN_USER, LOGIN_WITH_GOOGLE } from "../utils/mutations";
import Auth from "../utils/auth";
import sketchImage from "../assets/images/sketch-removebg.png"; 

const Login = () => {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [login] = useMutation(LOGIN_USER);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-dismiss error after 3 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
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
      const { data } = await login({
        variables: { ...formState },
      });
      Auth.login(data.login.token);
      setFormState({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err);
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-6xl">
          {/* Left side: Logo and branding */}
          <div className="hidden lg:flex flex-col items-center text-center space-y-6">
            {/* Welcome message with modern styling */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight leading-none drop-shadow-2xl">
                Welcome to <span className="text-green-500 dark:text-green-400">RosterHub</span>
              </h1>
              <div className="max-w-lg mx-auto p-4 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10">
                <p className="text-lg text-gray-800 dark:text-gray-100 font-bold drop-shadow-lg">
                  Where Players <span className="text-green-500 dark:text-green-400 animate-pulse">Connect</span> & <span className="text-blue-500 dark:text-blue-400 animate-pulse delay-300">Understand</span> Before The Game!
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
                <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
                  Welcome Back! 👋
                </h2>
                <div className="max-w-sm mx-auto p-3 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10">
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-bold drop-shadow-lg">
                    Sign in to your account to continue
                  </p>
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-base border border-green-400/50 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          🚀 Sign In
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
                    🆕 New User? Sign up here
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-center py-2 transition-colors hover:underline"
                  >
                    🔑 Forgot Password?
                  </Link>
                </div>
              </form>

              {/* Divider */}
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

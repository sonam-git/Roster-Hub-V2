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
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950">
      {/* Sophisticated Background Pattern - matching Hero */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-emerald-500/2 to-purple-500/3"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-6xl">
          {/* Left side: Logo and branding */}
          <div className="hidden lg:flex flex-col items-center text-center space-y-6">
            {/* Logo/Image */}
            <div className="relative">
              <img
                src={sketchImage}
                alt="RosterHub Sketch"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            {/* Welcome message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Welcome to <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text">RosterHub</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Where Players Connect & Understand Before The Game!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Features list */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-gray-700/40">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🚀 Ready to Get Started?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Connect with your team
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Track performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Manage game schedules
                </li>
              </ul>
            </div>
          </div>

          {/* Right side: Login Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 dark:border-gray-700/40 w-full max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Welcome Back! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-100/80 dark:bg-red-900/30 backdrop-blur-md border border-red-300/50 dark:border-red-700/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span>{error.message}</span>
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
                    className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "⚡ Sign In"
                    )}
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

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ThemeContext } from "../components/ThemeContext";
import { SEND_RESET_PASSWORD_EMAIL } from "../utils/mutations";
import heroImage from "../assets/images/dark-logo.png";
import heroImageDark from "../assets/images/roster-hub-logo.png";

const ForgotPassword = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [sendEmail, { data, error }] = useMutation(SEND_RESET_PASSWORD_EMAIL);

  const handleChange = (event) => {
    const { value } = event.target;
    setEmail(value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendEmail({ variables: { email } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Fully Transparent Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 sm:opacity-30 dark:opacity-10 sm:dark:opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        {/* Floating Soccer Ball Animation - More subtle on small screens */}
        <div className="absolute top-10 left-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-30 sm:opacity-60 animate-ping"></div>
        <div className="absolute top-32 right-16 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-25 sm:opacity-50 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-20 sm:opacity-40 animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 sm:opacity-60 animate-ping"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 lg:gap-12">
        {/* Left side: Logo and branding */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center mb-8 lg:mb-0 p-6 lg:p-8">
          {/* Main Title with Sport Theme - Enhanced blur background */}
          <div className="relative mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/30 dark:border-white/20">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-green-700 dark:text-green-300 drop-shadow-2xl animate-pulse">
              🔐 Password Recovery
            </h1>
            <div className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-r from-green-600/20 to-blue-600/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Subtitle with Sport Icons */}
          <div className="flex items-center gap-2 mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/30 dark:border-white/20">
            <span className="text-2xl animate-bounce">🛡️</span>
            <p className="text-lg sm:text-xl lg:text-xl font-bold text-gray-800 dark:text-gray-100">
              Get back on the field!
            </p>
            <span className="text-2xl animate-bounce delay-150">⚽</span>
          </div>

          {/* Logo with Enhanced Animation */}
          <div className="relative mb-8 bg-white/10 dark:bg-black/15 backdrop-blur-sm rounded-full p-4 sm:p-6 border border-white/20 dark:border-white/10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full blur-2xl animate-pulse"></div>
              <img
                src={isDarkMode ? heroImage : heroImageDark}
                alt="Roster Hub Logo"
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 animate-bounce drop-shadow-2xl rounded-full border-4 border-white dark:border-gray-700 shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-white/25 dark:bg-gray-800/25 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-green-200/50 dark:border-green-700/30">
            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-center text-blue-700 dark:text-blue-300 mb-2">
              🔄 "Every champion needs a comeback story"
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center italic font-medium">
              Reset your password and rejoin your team
            </p>
          </div>
        </div>

        {/* Right side: Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="bg-gradient-to-br from-green-400/90 via-blue-400/90 to-yellow-300/90 dark:from-green-900/90 dark:via-blue-900/90 dark:to-yellow-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-lg border-2 border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center justify-center w-full mb-6">
              <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow">
                🔑 Reset Password
              </h4>
            </div>

            {data ? (
              <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/30 w-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Check Your Email!
                  </h3>
                  <p className="text-gray-700 dark:text-gray-200 text-sm">
                    {data.sendResetPasswordEmail.message}
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 bg-yellow-400 dark:bg-yellow-300 text-green-900 font-bold py-2 px-6 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition"
                    >
                      <span>👈 Back to Login</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 w-full">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 py-3 px-4 text-sm"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-yellow-400 dark:bg-yellow-300 text-green-900 font-black py-3 px-8 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition"
                  >
                    🚀 Send Reset Link
                  </button>

                  <Link
                    to="/login"
                    className="text-center text-blue-700 dark:text-blue-300 hover:underline font-medium text-sm py-2"
                  >
                    👈 Back to Login
                  </Link>
                </div>
              </form>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4 w-full animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm">{error.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;

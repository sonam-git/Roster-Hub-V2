import React, { useState} from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { SEND_RESET_PASSWORD_EMAIL } from "../utils/mutations";
import { ThemeContext } from "../components/ThemeContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sendEmail, { data, error }] = useMutation(SEND_RESET_PASSWORD_EMAIL);

  // Get theme context
  const { isDarkMode, toggleDarkMode } = React.useContext(ThemeContext);

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
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Theme Toggle Button - Fixed in top right */}
      <button
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
      </button>

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
                Recover Your Account
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Get back to managing your team with a secure password reset process.
              </p>
            </div>

            {/* Security features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Secure reset link</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sent directly to your registered email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Encrypted process</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your security is our priority</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Quick recovery</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get back to your team in minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Password Reset Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Reset password
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
                  Enter your email to receive a password reset link
                </p>
              </div>

              {/* Success Message */}
              {data ? (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Email sent successfully!</span>
                    </div>
                    <p className="text-sm">{data.sendResetPasswordEmail.message}</p>
                  </div>
                  
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center items-center gap-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors hover:underline underline-offset-4 "
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span >Back to Login</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email address"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                      We'll send you a secure link to reset your password
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Send reset link
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/login"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors hover:underline underline-offset-4"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mt-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                      <p className="font-medium">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;

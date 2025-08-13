import React, { useState} from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { SEND_RESET_PASSWORD_EMAIL } from "../utils/mutations";
import sketchImage from "../assets/images/sketch-removebg.png"; 

const ForgotPassword = () => {
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
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            {/* Welcome message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Recover Your <span className="text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 dark:from-orange-400 dark:via-red-400 dark:to-orange-500 bg-clip-text">Access</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Get back to connecting with your team!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
            </div>

            {/* Security info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-gray-700/40">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                � Secure Recovery
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Reset link sent to your email
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Secure encrypted process
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Get back to your team quickly
                </li>
              </ul>
            </div>
          </div>

          {/* Right side: Forgot Password Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 dark:border-gray-700/40 w-full max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Reset Password 🔑
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Enter your email to receive a reset link
                </p>
              </div>

              {/* Success Message */}
              {data ? (
                <div className="text-center space-y-6">
                  <div className="bg-green-100/80 dark:bg-green-900/30 backdrop-blur-md border border-green-300/50 dark:border-green-700/50 text-green-800 dark:text-green-200 px-6 py-4 rounded-xl shadow-lg">
                    <div className="text-4xl mb-3">📧</div>
                    <h3 className="text-lg font-bold mb-2">Check Your Email!</h3>
                    <p className="text-sm">{data.sendResetPasswordEmail.message}</p>
                  </div>
                  
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 hover:from-orange-700 hover:via-red-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span>👈 Back to Login</span>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      We'll send you a secure link to reset your password
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 hover:from-orange-700 hover:via-red-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      🚀 Send Reset Link
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="text-center pt-4">
                    <Link
                      to="/login"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors hover:underline"
                    >
                      👈 Back to Login
                    </Link>
                  </div>
                </form>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mt-6">
                  <div className="bg-red-100/80 dark:bg-red-900/30 backdrop-blur-md border border-red-300/50 dark:border-red-700/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span>{error.message}</span>
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

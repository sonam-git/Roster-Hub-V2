// src/pages/Login.jsx

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { GoogleLogin } from "@react-oauth/google";
import { LOGIN_USER, LOGIN_WITH_GOOGLE } from "../utils/mutations";
import Auth from "../utils/auth";
import { ThemeContext } from "../components/ThemeContext";
import heroImage from "../assets/images/dark-logo.png";
import heroImageDark from "../assets/images/roster-hub-logo.png";

const Login = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [login] = useMutation(LOGIN_USER);
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
  const [error, setError] = useState(null);

  // State to track form submission status
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
        {/* Left side: Logo and branding - Hidden on small screens */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center text-center mb-8 lg:mb-0 p-6 lg:p-8">
          {/* Main Title with Sport Theme - Enhanced blur background */}
          <div className="relative mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/30 dark:border-white/20">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-blue-700 dark:text-blue-300 drop-shadow-2xl animate-pulse">
              👤 Welcome Back!
            </h1>
            <div className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-r from-blue-600/20 to-green-600/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Subtitle with Sport Icons */}
          <div className="flex items-center gap-2 mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/30 dark:border-white/20">
            <span className="text-2xl animate-bounce">⚽</span>
            <p className="text-lg sm:text-xl lg:text-xl font-bold text-gray-800 dark:text-gray-100">
              Ready to dominate the field?
            </p>
            <span className="text-2xl animate-bounce delay-150">🏆</span>
          </div>

          {/* Logo with Enhanced Animation */}
          <div className="relative mb-8 bg-white/10 dark:bg-black/15 backdrop-blur-sm rounded-full p-4 sm:p-6 border border-white/20 dark:border-white/10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-green-400/30 rounded-full blur-2xl animate-pulse"></div>
              <img
                src={isDarkMode ? heroImage : heroImageDark}
                alt="Roster Hub Logo"
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 animate-bounce drop-shadow-2xl rounded-full border-4 border-white dark:border-gray-700 shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-white/25 dark:bg-gray-800/25 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-blue-200/50 dark:border-blue-700/30">
            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-center text-blue-700 dark:text-blue-300 mb-2">
              🚀 "Great players never stop playing"
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center italic font-medium">
              Login and continue your championship journey
            </p>
          </div>
        </div>

        {/* Right side: Login Form - Full width on small screens */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="bg-gradient-to-br from-blue-400/90 via-green-400/90 to-yellow-300/90 dark:from-blue-900/90 dark:via-green-900/90 dark:to-yellow-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-lg border-2 border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-center w-full mb-6">
              <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow">
                👤 Login
              </h4>
            </div>

            {/* Error Alert - Enhanced styling */}
            {error && (
              <div className="w-full mb-6">
                <div className="bg-red-400/20 dark:bg-red-900/30 backdrop-blur-md border border-red-400/50 dark:border-red-700/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 animate-pulse">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    />
                  </svg>
                  <span>{error.message}</span>
                </div>
              </div>
            )}
            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 sm:space-y-6 w-full"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold leading-6 text-gray-900 dark:text-white mb-2"
                >
                  📧 Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold leading-6 text-gray-900 dark:text-white mb-2"
                >
                  🔒 Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-black py-3 px-6 rounded-full shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 text-base tracking-wide transform hover:scale-105 active:scale-95 border-2 border-white/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "⚡ Login"
                  )}
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3 text-sm bg-white/15 dark:bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/25">
                <Link
                  to="/signup"
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold text-center py-2 transition-colors hover:underline"
                >
                  🆕 New User? Sign up here
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold text-center py-2 transition-colors hover:underline"
                >
                  🔑 Forgot Password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="my-4 w-full">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg text-gray-700 dark:text-gray-300 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center w-full">
              <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/30">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
            </div>

            {/* Success Message */}
            {Auth.loggedIn() && (
              <div className="mt-4 bg-green-400/20 dark:bg-green-900/30 backdrop-blur-md border border-green-400/50 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl text-center font-semibold">
                🎉 Success! You are now logged in.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

//  ############################# THIS CODE BELOW IS REACT 19  #############################
// import React, { useState, useContext } from "react";
// import { Link } from "react-router-dom";
// import { useMutation } from "@apollo/client";
// import { GoogleLogin } from "@react-oauth/google";
// import { LOGIN_USER, LOGIN_WITH_GOOGLE } from "../utils/mutations";
// import Auth from "../utils/auth";
// import { ThemeContext } from "../components/ThemeContext";
// import heroImage from "../assets/images/dark-logo.png";
// import heroImageDark from "../assets/images/roster-hub-logo.png";

// // React 19 alpha form hook to detect form submission state:
// import { useFormStatus } from "react-dom";

// const Login = () => {
//   const { isDarkMode } = useContext(ThemeContext);
//   const [formState, setFormState] = useState({ email: "", password: "" });
//   const [login] = useMutation(LOGIN_USER);
//   const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);
//   const [error, setError] = useState(null);

//   // only useFormStatus—the pending flag tells us when the form is submitting
//   const { pending: isSubmitting } = useFormStatus();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       const { data } = await login({
//         variables: { ...formState },
//       });
//       Auth.login(data.login.token);
//       setFormState({ email: "", password: "" });
//     } catch (err) {
//       console.error(err);
//       setError(err);
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     setError(null);

//     try {
//       const { data } = await loginWithGoogle({
//         variables: { idToken: credentialResponse.credential },
//       });
//       Auth.login(data.loginWithGoogle.token);
//     } catch (err) {
//       console.error("Google login failed", err);
//       setError(err);
//     }
//   };

//   const handleGoogleError = () => {
//     console.error("Google Sign In was unsuccessful.");
//     setError(new Error("Google Sign In failed"));
//   };

//   return (
//     <main className="container min-h-screen flex items-center justify-center px-4">
//       <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
//         {/* Hero Section */}
//         <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0">
//           <h1 className="text-5xl font-bold pb-2">Roster Hub</h1>
//           <p className="text-xl mb-4">Create your team's hub with us</p>
//           <img
//             src={isDarkMode ? heroImage : heroImageDark}
//             alt="Roster Hub Logo"
//             className="w-64 h-64 animate-bounce mt-4"
//           />
//           <h4
//             className="
//     text-md        /* mobile first: small text */
//     sm:text-lg     /* from 640px up: larger */
//     md:text-xl     /* from 768px up: even larger */
//     lg:text-2xl    /* from 1024px up: biggest */
//     text-center
//     font-extrabold
//     tracking-tight
//     text-gray-900
//     dark:text-white
//     mb-6
//     bg-gradient-to-r from-green-500 via-blue-500 to-red-500
//     bg-clip-text
//     text-transparent
//   "
//           >
//             Elevate Your Game, On and Off the Field
//           </h4>
//         </div>

//         {/* Login Form Section */}
//         <div className="md:w-1/2 flex flex-col-1 items-center">
//           <div className="bg-gray-200 shadow-xl rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-md">
//             <h4 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-6">
//               Login
//             </h4>

//             {/* standard <form> so useFormStatus can track it */}
//             <form onSubmit={handleFormSubmit} className="space-y-6">
//               {/* Email */}
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
//                 >
//                   Email address
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formState.email}
//                   onChange={handleChange}
//                   required
//                   className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="you@example.com"
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
//                 >
//                   Password
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={formState.password}
//                   onChange={handleChange}
//                   required
//                   className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="••••••••"
//                 />
//               </div>

//               {/* Submit */}
//               <div className="flex justify-between items-center">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200 hover:bg-blue-800 disabled:opacity-50"
//                 >
//                   {isSubmitting ? "Logging in..." : "Submit"}
//                 </button>
//               </div>

//               {/* Links */}
//               <div className="flex justify-between mt-3 text-sm">
//                 <Link
//                   to="/signup"
//                   className="text-gray-600 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
//                 >
//                   New User?
//                 </Link>
//                 <Link
//                   to="/forgot-password"
//                   className="text-gray-600 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
//                 >
//                   Forgot Password?
//                 </Link>
//               </div>
//             </form>

//             {/* Divider */}
//             <div className="my-4 border-t border-gray-300"></div>

//             {/* Google Login */}
//             <div className="flex justify-center">
//               <GoogleLogin
//                 onSuccess={handleGoogleSuccess}
//                 onError={handleGoogleError}
//               />
//             </div>

//             {/* Success Message */}
//             {Auth.loggedIn() && (
//               <p className="mt-4 text-center text-green-600">
//                 Success! You are now logged in.
//               </p>
//             )}
//           </div>

//           {/* Error Alert */}
//           {error && (
//             <div
//               className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
//               role="alert"
//             >
//               <span className="block sm:inline">{error.message}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// };

// export default Login;

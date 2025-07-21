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
    <main className="flex items-center justify-center px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        {/* Hero Section */}
        <div className="hidden md:flex md:w-1/2 flex-col items-center text-center md:mb-0 p-6">
          <h1 className="text-5xl font-extrabold pb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 drop-shadow-lg">
            Roster Hub
          </h1>
          <p className="text-xl mb-3 font-medium text-gray-700 dark:text-gray-200">
            Create your team's hub with us
          </p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-56 h-56 md:w-64 md:h-64 animate-bounce mt-4 drop-shadow-xl rounded-full border-4 border-white dark:border-gray-800"
          />
          <h4
            className="text-md sm:text-md md:text-xl lg:text-2xl text-center font-bold tracking-tight mt-6 mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-green-500 via-blue-500 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 bg-clip-text text-transparent drop-shadow"
          >
            Elevate Your Game, On and Off the Field
          </h4>
        </div>

        {/* Login Form Section */}
        <div className="md:w-1/2 flex flex-col-1 items-center">
          <div className="bg-gradient-to-br from-green-400 via-blue-400 to-yellow-300 dark:from-green-900 dark:via-blue-900 dark:to-yellow-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full overflow-x-auto mb-6 border border-green-200 dark:border-green-800">
            <h4 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight drop-shadow">
              Login
            </h4>
            {/* Error Alert - show under Login title */}
            {error && (
              <div className="w-full flex justify-center mb-4">
                <div className="bg-gradient-to-r from-red-200 via-red-100 to-red-300 dark:from-red-900 dark:via-red-800 dark:to-red-700 border-l-4 border-red-500 text-red-900 dark:text-red-200 px-4 py-3 rounded-lg shadow font-semibold text-sm flex items-center gap-2 animate-shake">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-300 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                  <span>{error.message}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-6 w-full max-w-md">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-black placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                  required
                  className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-black placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
              {/* Submit */}
              <div className="flex justify-between items-center mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-400 dark:bg-yellow-300 text-green-900 dark:text-green-900 font-extrabold py-2 px-6 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
              {/* Links */}
              <div className="flex justify-between mt-3 text-sm">
                <Link
                  to="/signup"
                  className="text-blue-700  dark:text-blue-300  hover:underline-offset-4 "
                >
                  New User?
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-blue-700  hover:underline-offset-4  dark:text-blue-300"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
            {/* Divider */}
            <div className="my-4 border-t border-gray-300 dark:border-gray-700 w-full"></div>
            {/* Google Login */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>

            {/* Success Message */}
            {Auth.loggedIn() && (
              <p className="mt-4 text-center text-green-600">
                Success! You are now logged in.
              </p>
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

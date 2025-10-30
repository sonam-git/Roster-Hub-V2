import { useEffect, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_PROFILE } from "../utils/mutations";
import Auth from "../utils/auth";
import sketchImage from "../assets/images/sketch-removebg.png"; 

const Signup = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [addProfile, { data }] = useMutation(ADD_PROFILE);
  const [isPending, startTransition] = useTransition();

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
        const { data } = await addProfile({
          variables: { ...formState },
        });
        Auth.login(data.addProfile.token);
      } catch (e) {
        setErrorMessage(e.message || "Signup failed. Please try again.");
        setShowError(true);
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/85 via-green-50/75 to-blue-100/85 dark:from-gray-950/85 dark:via-slate-900/75 dark:to-green-950/85"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-white/15 dark:from-black/25 dark:via-transparent dark:to-black/15"></div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Enhanced Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Enhanced Floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-green-400/60 to-emerald-400/60 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-blue-400/60 to-cyan-400/60 rotate-45 animate-ping shadow-lg"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-emerald-400/60 to-green-400/60 rounded-full animate-bounce shadow-lg"></div>
        <div className="absolute top-60 right-60 w-5 h-5 bg-gradient-to-r from-green-400/60 to-blue-400/60 rounded-full animate-bounce delay-300 shadow-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto lg:px-8 py-8  flex items-center justify-center">
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
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            {/* Welcome message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-oswald font-black text-gray-900 dark:text-white tracking-tight leading-none">
                JOIN <span className="text-transparent bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-500 bg-clip-text">ROSTERHUB</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-oswald font-medium tracking-wide">
                WHERE PLAYERS CONNECT & UNDERSTAND BEFORE THE GAME!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto rounded-full"></div>
            </div>

            {/* Benefits list */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-gray-700/40">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🎯 Why Join RosterHub?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Build your championship team
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Advanced analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Real-time team communication
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Comprehensive game management
                </li>
              </ul>
            </div>
          </div>

          {/* Right side: Signup Form */}
          <div className="w-full lg:w-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 dark:border-gray-700/40 w-full max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-oswald font-black text-gray-900 dark:text-white mb-2 tracking-wide">
                  CREATE ACCOUNT 🚀
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-oswald font-medium tracking-wider">
                  JOIN THOUSANDS OF TEAMS ALREADY USING ROSTERHUB
                </p>
              </div>

              {/* Error Alert */}
              {showError && (
                <div className="mb-6">
                  <div className="bg-red-100/80 dark:bg-red-900/30 backdrop-blur-md border border-red-300/50 dark:border-red-700/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Enter your full name"
                    disabled={isPending}
                  />
                </div>

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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Enter your email"
                    disabled={isPending}
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Create a password"
                    disabled={isPending}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-800 text-white font-oswald font-bold tracking-wide py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        CREATING ACCOUNT...
                      </span>
                    ) : (
                      "🚀 CREATE ACCOUNT"
                    )}
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="text-center pt-4">
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors hover:underline"
                  >
                    Already have an account? Sign in here
                  </Link>
                </div>
              </form>

              {/* Terms notice */}
              <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
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

              {/* Success Message */}
              {data && (
                <div className="mt-4 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-md border border-green-300/50 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl text-center font-semibold">
                  🎉 Account created successfully! Welcome to RosterHub!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;

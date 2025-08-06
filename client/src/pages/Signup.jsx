import { useEffect, useState, useTransition, useContext } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ThemeContext } from "../components/ThemeContext";
import { ADD_PROFILE } from "../utils/mutations";
import Auth from "../utils/auth";
import heroImage from "../assets/images/dark-logo.png";
import heroImageDark from "../assets/images/roster-hub-logo.png";

const Signup = () => {
  const { isDarkMode } = useContext(ThemeContext);
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
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-green-100 dark:text-green-300 drop-shadow-2xl animate-pulse">
              🚀 Join the Team!
            </h1>
            <div className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-r from-green-600/20 to-yellow-600/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Subtitle with Sport Icons */}
          <div className="flex items-center gap-2 mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/30 dark:border-white/20">
            <span className="text-2xl animate-bounce">🌟</span>
            <p className="text-lg sm:text-xl lg:text-xl font-bold text-gray-800 dark:text-gray-100">
              Start your championship story
            </p>
            <span className="text-2xl animate-bounce delay-150">⚽</span>
          </div>

          {/* Logo with Enhanced Animation */}
          <div className="relative mb-8 bg-white/10 dark:bg-black/15 backdrop-blur-sm rounded-full p-4 sm:p-6 border border-white/20 dark:border-white/10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-yellow-400/30 rounded-full blur-2xl animate-pulse"></div>
              <img
                src={isDarkMode ? heroImage : heroImageDark}
                alt="Roster Hub Logo"
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 animate-bounce drop-shadow-2xl rounded-full border-4 border-white dark:border-gray-700 shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-white/25 dark:bg-gray-800/25 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-green-200/50 dark:border-green-700/30">
            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-center text-gray-500 dark:text-green-300 mb-2">
              🏆 "Every legend started with a first step"
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center italic font-medium">
              Create your account and join the winning team
            </p>
          </div>
        </div>

        {/* Right side: Signup Form - Full width on small screens */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="bg-gradient-to-br from-green-400/90 via-yellow-400/90 to-orange-300/90 dark:from-green-900/90 dark:via-yellow-900/90 dark:to-orange-700/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-lg border-2 border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center justify-center w-full mb-6">
              <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow">
                🌟 Sign Up
              </h4>
            </div>

            {/* Error Alert - Enhanced styling */}
            {showError && (
              <div className="w-full mb-6">
                <div className="bg-red-400/20 dark:bg-red-900/30 backdrop-blur-md border border-red-400/50 dark:border-red-700/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 animate-pulse">
                  <span className="text-lg">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {data ? (
              <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/30 w-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to the Team!
                  </h3>
                  <p className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                    Your account has been created successfully!
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-yellow-400 dark:bg-yellow-300 text-green-900 font-bold py-2 px-6 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition"
                  >
                    <span>🏠 Go to Homepage</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleFormSubmit}
                className="space-y-4 sm:space-y-6 w-full"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold leading-6 text-gray-900 dark:text-white mb-2"
                  >
                    👤 Username
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    placeholder="Your awesome username"
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
                  />
                </div>
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
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
                  />
                </div>
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
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all duration-300"
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-green-400 to-gray-100 hover:from-green-300 hover:to-gray-400 text-gray-900 font-black py-3 px-6 rounded-full shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 text-base tracking-wide transform hover:scale-105 active:scale-95 border-2 border-white/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "🚀 Create Account"
                    )}
                  </button>
                </div>

                {/* Navigation Link */}
                <div className="flex justify-center mt-4 text-sm bg-white/15 dark:bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/25">
                  <Link
                    to="/login"
                    className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold text-center py-2 transition-colors hover:underline"
                  >
                    👤 Already have an account? Sign in here
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;

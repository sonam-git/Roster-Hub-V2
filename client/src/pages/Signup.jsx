import { useEffect, useState, useContext, useTransition } from "react";
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
    <main className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-4 lg:py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-4 sm:gap-6 lg:gap-8">
        {/* Hero Section - Hidden on small screens, shown on large */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center text-center mb-6 lg:mb-0 p-4 lg:p-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold pb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-100 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 drop-shadow-lg">
            Roster Hub
          </h1>
          <p className="text-lg sm:text-xl mb-3 font-medium text-gray-700 dark:text-gray-200">
            Create your team's hub with us
          </p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 animate-bounce mt-4 drop-shadow-xl rounded-full border-4 border-white dark:border-gray-800"
          />
        <h4
              className="text-xs sm:text-sm md:text-base lg:text-xl text-center italic tracking-tight mt-4 sm:mt-6 mb-4 sm:mb-6 text-gray-800 dark:text-white drop-shadow"
            >
            Elevate Your Game, On and Off the Field
          </h4>
        </div>
        {/* Signup Form Section - Optimized for small screens */}
        <div className="w-full lg:w-1/2 flex flex-col items-center px-3 sm:px-4">
          <div className="bg-gradient-to-br from-green-400 via-blue-400 to-yellow-300 dark:from-green-900 dark:via-blue-900 dark:to-yellow-700 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col items-center w-full max-w-sm sm:max-w-md lg:max-w-lg mb-4 sm:mb-6 border border-green-200 dark:border-green-800">
            <h4 className="text-center text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 tracking-tight drop-shadow">
              Sign Up
            </h4>
            {showError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full max-w-md mx-auto animate-fade-in"
                role="alert"
              >
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            {data ? (
              <p className="text-center text-gray-900 dark:text-white">
                Success! You may now head{" "}
                <Link to="/">back to the homepage</Link>.
              </p>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6 w-full">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-semibold leading-5 sm:leading-6 text-gray-900 dark:text-white mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    placeholder="Your username"
                    className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-black placeholder-gray-400 dark:placeholder-gray-500 transition text-sm sm:text-base py-2.5 sm:py-3"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-semibold leading-5 sm:leading-6 text-gray-900 dark:text-white mb-1"
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
                    placeholder="Your email"
                    className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-black placeholder-gray-400 dark:placeholder-gray-500 transition text-sm sm:text-base py-2.5 sm:py-3"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-semibold leading-5 sm:leading-6 text-gray-900 dark:text-white mb-1"
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
                    placeholder="Password"
                    className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-black placeholder-gray-400 dark:placeholder-gray-500 transition text-sm sm:text-base py-2.5 sm:py-3"
                  />
                </div>
                {/* Primary Submit Button - Full width on mobile, left-aligned on desktop */}
                <div className="mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto bg-yellow-400 dark:bg-yellow-300 text-green-900 dark:text-green-900 font-extrabold py-3 sm:py-2.5 px-8 sm:px-6 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition disabled:opacity-50 text-sm sm:text-base min-h-[48px] touch-manipulation"
                  >
                    {isPending ? "Submitting..." : "Sign Up"}
                  </button>
                </div>
                
                {/* Secondary Action Link */}
                <div className="flex justify-center mt-4 sm:mt-3 text-xs sm:text-sm">
                  <Link
                    to="/login"
                    className="text-blue-700 hover:underline hover:underline-offset-4 dark:text-blue-300 text-center py-3 sm:py-2 min-h-[44px] flex items-center justify-center font-medium transition-colors hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Already have an account? Sign in here
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

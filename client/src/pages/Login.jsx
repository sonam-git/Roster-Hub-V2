import React, { useState, useContext, useTransition } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import Auth from "../utils/auth";
import { ThemeContext } from "../components/ThemeContext";
import heroImage from "../assets/images/dark-logo.png";
import heroImageDark from "../assets/images/roster-hub-logo.png";

const Login = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [login, { error, data }] = useMutation(LOGIN_USER);
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
        const { data } = await login({
          variables: { ...formState },
        });
        Auth.login(data.login.token);
      } catch (e) {
        console.error(e);
      }
      setFormState({ email: "", password: "" });
    });
  };

  return (
    <main className="container min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0">
          <h1 className="text-5xl font-bold pb-2">Roster Hub</h1>
          <p className="text-xl mb-4">Create your team's hub with us</p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-64 h-64 animate-bounce mt-4"
          />
        </div>
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="bg-gray-200 shadow-xl rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-md">
            <h4 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Login
            </h4>
            {data ? (
              <p className="text-center text-gray-900 dark:text-white">
                Success! You may now head <Link to="/me">back to the homepage</Link>.
              </p>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Your email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="******"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200 hover:bg-blue-800 cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Logging in..." : "Submit"}
                  </button>
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <Link
                    to="/signup"
                    className="text-gray-600 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                  >
                    New User?
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="text-gray-600 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            )}
          </div>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error.message}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;

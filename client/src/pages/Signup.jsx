import React, { useState, useContext, useTransition } from "react";
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

  const [addProfile, { error, data }] = useMutation(ADD_PROFILE);
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
        console.error(e);
      }
    });
  };

  return (
    <main className="container min-h-screen flex items-center justify-center px-4">
      <div className="  flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        <div className="md:w-1/2 flex flex-col items-center text-center md:mb-0">
          <h1 className="text-5xl font-bold pb-2">Roster Hub</h1>
          <p className="text-xl mb-4">Create your team's hub with us</p>
          <img
            src={isDarkMode ? heroImage : heroImageDark}
            alt="Roster Hub Logo"
            className="w-64 h-64 animate-bounce mt-4"
          />
          <h4
            className="
    text-md        /* mobile first: small text */
    sm:text-lg     /* from 640px up: larger */
    md:text-xl     /* from 768px up: even larger */
    lg:text-2xl    /* from 1024px up: biggest */
    text-center 
    font-extrabold 
    tracking-tight 
    text-gray-900 
    dark:text-white 
    mb-6 
    bg-gradient-to-r from-green-500 via-blue-500 to-red-500 
    bg-clip-text 
    text-transparent
  "
          >
            Elevate Your Game, On and Off the Field
          </h4>
        </div>
        <div className="md:w-1/2 flex flex-col-1 items-center">
          <div className="bg-gray-200 shadow-xl rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-md">
            <h4 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sign Up
            </h4>
            {data ? (
              <p className="text-center text-gray-900 dark:text-white">
                Success! You may now head{" "}
                <Link to="/">back to the homepage</Link>.
              </p>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
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
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
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
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200 hover:bg-blue-800 cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? "Submitting..." : "Submit"}
                  </button>
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                  >
                    Already have an account?
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

export default Signup;

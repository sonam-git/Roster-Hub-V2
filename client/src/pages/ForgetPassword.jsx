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
              Forgot Password
            </h4>
            {data ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-600 shadow-lg rounded-md">
                <p className="text-center p-5 dark:bg-gray-600 dark:text-white">
                  {data.sendResetPasswordEmail.message}
                </p>
              </div>
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
                    className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Your email"
                    required
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200 hover:bg-blue-800"
                    style={{ cursor: "pointer" }}
                    type="submit"
                  >
                    Submit
                  </button>
                  <Link
                    to="/login"
                    className="bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-gray-100 no-underline"
                    style={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    Cancel
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

export default ForgotPassword;

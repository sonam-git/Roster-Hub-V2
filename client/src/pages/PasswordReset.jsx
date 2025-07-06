import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { RESET_PASSWORD } from "../utils/mutations";

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState("");
  const [resetPassword, { error }] = useMutation(RESET_PASSWORD);
  const { token } = useParams();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (event) => {
    const { value } = event.target;
    setNewPassword(value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await resetPassword({
        variables: { token: token, newPassword: newPassword },
      });
      if (
        data &&
        data.resetPassword &&
        data.resetPassword.message === "Password has been successfully reset."
      ) {
        // Reset password successful, show success message and navigate to login page
        setShowSuccessMessage(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000); // Navigate to login page after 3 seconds
      }
    } catch (e) {
      console.error("Error resetting password:", e);
    }
  };

  return (
    <main className="flex items-center justify-center px-4 py-12 font-sans bg-gradient-to-b from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-blue-950 dark:to-green-950 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl">
        <div className="hidden md:flex md:w-1/2 flex-col items-center text-center md:mb-0 p-6">
          <h1 className="text-5xl font-extrabold pb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-yellow-400 dark:from-green-300 dark:via-blue-400 dark:to-yellow-200 drop-shadow-lg">
            Roster Hub
          </h1>
          <p className="text-xl mb-3 font-medium text-gray-700 dark:text-gray-200">
            Create your team's hub with us
          </p>
          {/* You can add a logo here if desired */}
        </div>
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="bg-gradient-to-br from-green-400 via-blue-400 to-yellow-300 dark:from-green-900 dark:via-blue-900 dark:to-yellow-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full overflow-x-auto mb-6 border border-green-200 dark:border-green-800">
            <h4 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight drop-shadow">
              Reset Password
            </h4>
            <form onSubmit={handleFormSubmit} className="space-y-6 w-full max-w-md">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white mb-1"
                >
                  New Password
                </label>
                <input
                  className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="New password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={handleChange}
                />
              </div>
              <button
                className="bg-yellow-400 dark:bg-yellow-300 text-green-900 dark:text-green-900 font-extrabold py-2 px-6 rounded-full shadow hover:bg-yellow-300 dark:hover:bg-yellow-200 transition disabled:opacity-50 mt-4"
                style={{ cursor: "pointer" }}
                type="submit"
              >
                Submit
              </button>
            </form>
            {showSuccessMessage && (
              <div className="mt-2 p-4 bg-white dark:bg-gray-600 shadow-lg rounded-md">
                <p className="text-center p-4 text-green-600 dark:text-white dark:bg-gray-600">
                  Password has been successfully reset.
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2 w-full max-w-md" role="alert">
                <span className="block sm:inline">{error.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PasswordReset;

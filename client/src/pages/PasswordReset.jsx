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
    <main className="flex justify-center mb-4 px-2">
      <div className="w-full max-w-md mt-5">
        <div className=" bg-gray-200 shadow-xl rounded px-8 pt-6 pb-8 mb-4  dark:bg-gray-800">
          <h4 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reset Password
          </h4>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                New Password
              </label>
              <input
                className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="New password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={handleChange}
              />
            </div>
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-200 hover:bg-blue-600"
              style={{ cursor: "pointer" }}
              type="submit"
            >
              Submit
            </button>
          </form>
          {showSuccessMessage && (
            <div className="  mt-2 p-4 bg-white dark:bg-gray-600 shadow-lg rounded-md">
              <p className="text-center p-4 text-green-600 dark:text-white dark:bg-gray-600">
                Password has been successfully reset.
              </p>
            </div>
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
    </main>
  );
};

export default PasswordReset;

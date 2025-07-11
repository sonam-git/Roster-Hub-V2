import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_ME } from '../../utils/queries';
import { ADD_INFO } from '../../utils/mutations';
import Auth from '../../utils/auth';
import { FaUserEdit } from "react-icons/fa";

const UserInfoForm = ({ profileId, isDarkMode }) => {
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addInfo, { error }] = useMutation(ADD_INFO);

  // Fetch the user's information to determine if it exists
  const { loading: queryLoading, data: queryData } = useQuery(QUERY_ME);

  useEffect(() => {
    if (!queryLoading && queryData) {
      // If user data exists and information is already added, update button text
      if (queryData.me && queryData.me.jerseyNumber && queryData.me.position && queryData.me.phoneNumber) {
        setButtonText("Update Info");
      } else {
        setButtonText("Add Info");
      }
    }
  }, [queryLoading, queryData]);

  const [buttonText, setButtonText] = useState("Add Info"); // Default button text

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      // Add or update information
      await addInfo({
        variables: {
          profileId,
          jerseyNumber: parseInt(jerseyNumber),
          position,
          phoneNumber,
        },
      });

      setJerseyNumber('');
      setPosition('');
      setPhoneNumber('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`max-w-md mx-auto rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}> 
      {Auth.loggedIn() ? (
        <>
          <form
            className={`flex flex-col gap-6 justify-center items-center w-full`}
            onSubmit={handleFormSubmit}
          >
            <div className={`w-full`}>
              <label htmlFor="jersey-number" className="block text-base font-bold leading-6 mb-2 text-blue-700 dark:text-blue-200 tracking-tight">Jersey Number</label>
              <input
                placeholder="Enter Your Jersey Number"
                value={jerseyNumber}
                className="block w-full rounded-lg border-0 px-4 py-3 mb-4 text-gray-900 shadow-lg ring-1 ring-inset ring-blue-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base"
                onChange={(event) => setJerseyNumber(event.target.value)}
                required
              />
              <label htmlFor="position" className="block text-base font-bold leading-6 mb-2 text-blue-700 dark:text-blue-200 tracking-tight">Position</label>
              <input
                placeholder="Enter Your Position"
                value={position}
                className="block w-full rounded-lg border-0 px-4 py-3 mb-4 text-gray-900 shadow-lg ring-1 ring-inset ring-blue-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base"
                onChange={(event) => setPosition(event.target.value)}
                required
              />
              <label htmlFor="phone-number" className="block text-base font-bold leading-6 mb-2 text-blue-700 dark:text-blue-200 tracking-tight">Phone Number</label>
              <input
                placeholder="Enter Your Phone Number"
                value={phoneNumber}
                className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-lg ring-1 ring-inset ring-blue-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base"
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
              <button
                className="block w-full md:w-1/2 rounded-lg bg-indigo-600 px-4 py-3 mt-6 text-center text-base font-bold text-white shadow-lg hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                type="submit"
              >
                {buttonText}
                <FaUserEdit className="inline ml-3" />
              </button>
            </div>
            <div>
              {error && (
                <div className="col-12 my-3 bg-red-500 text-white p-3 rounded-lg shadow-lg">
                  {error.message}
                </div>
              )}
            </div>
          </form>
        </>
      ) : (
        <p className="text-center lg:text-left">
          You need to be logged in to add information. Please{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>{' '}
          or{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Signup.
          </Link>
        </p>
      )}
    </div>
  );
  
};

export default UserInfoForm;

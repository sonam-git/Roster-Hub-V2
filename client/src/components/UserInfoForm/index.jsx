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
    <div className={`max-w-md mx-auto ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}>
      {Auth.loggedIn() ? (
        <>
          <form
            className={`flex flex-col lg:flex-row justify-center items-center lg:justify-between lg:items-center`}
            onSubmit={handleFormSubmit}
          >
            <div className={`w-full ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'} lg:mr-4 mb-4 lg:mb-0`}>
              <label htmlFor="jersey-number" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Jersey Number
              </label>
              <input
                placeholder="Enter Your Jersey Number"
                value={jerseyNumber}
                className="block w-full rounded-md border-0 px-3.5 py-2 mb-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(event) => setJerseyNumber(event.target.value)}
                required
              />
              <label htmlFor="position" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Position
              </label>
              <input
                placeholder="Enter Your Position"
                value={position}
                className="block w-full rounded-md border-0 px-3.5 py-2 mb-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(event) => setPosition(event.target.value)}
                required
              />
              <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Phone Number
              </label>
              <input
                placeholder="Enter Your Phone Number"
                value={phoneNumber}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
              <button
                className="block w-full md:w-1/2 rounded-md bg-indigo-600 px-3.5 py-2.5 mt-5 text-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="submit"
              >
                {buttonText}
                <FaUserEdit className="inline ml-3" />
              </button>
            </div>
            <div>
              {error && (
                <div className="col-12 my-3 bg-red-500 text-white p-3">
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

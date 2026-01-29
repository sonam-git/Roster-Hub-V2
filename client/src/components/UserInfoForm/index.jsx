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
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto"> 
      {Auth.loggedIn() ? (
        <>
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label htmlFor="jersey-number" className={`block text-sm font-medium mb-1.5
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Jersey Number
                </label>
                <input
                  id="jersey-number"
                  type="number"
                  placeholder="Enter Your Jersey Number"
                  value={jerseyNumber}
                  className={`w-full rounded-md border px-3 py-2 text-sm
                    ${isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } 
                    focus:ring-2 focus:outline-none
                    transition-colors`}
                  onChange={(event) => setJerseyNumber(event.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="position" className={`block text-sm font-medium mb-1.5
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position
                </label>
                <input
                  id="position"
                  type="text"
                  placeholder="Enter Your Position"
                  value={position}
                  className={`w-full rounded-md border px-3 py-2 text-sm
                    ${isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } 
                    focus:ring-2 focus:outline-none
                    transition-colors`}
                  onChange={(event) => setPosition(event.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone-number" className={`block text-sm font-medium mb-1.5
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  value={phoneNumber}
                  className={`w-full rounded-md border px-3 py-2 text-sm
                    ${isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } 
                    focus:ring-2 focus:outline-none
                    transition-colors`}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white 
                transition-colors
                ${isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
            >
              <span className="flex items-center justify-center gap-2">
                {buttonText}
                <FaUserEdit className="text-sm" />
              </span>
            </button>
            <p className={`text-xs sm:text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              For single update of each field, please go to the{' '}
              <Link 
                to="/" 
                className={`font-semibold transition-colors hover:underline inline-flex items-center gap-1
                  ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                home page
                <span className="text-sm">→</span>
              </Link>
              {' '}(top right corner), where you can update your info directly.
            </p>
            {error && (
              <div className={`p-3 rounded-md border flex items-start gap-2
                ${isDarkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-200' 
                  : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error.message}</p>
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <FaUserEdit className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You need to be logged in to add information. Please{' '}
            <Link to="/login" className={`font-semibold transition-colors hover:underline
              ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              Login
            </Link>{' '}
            or{' '}
            <Link to="/signup" className={`font-semibold transition-colors hover:underline
              ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              Signup
            </Link>
          </p>
        </div>
      )}
    </div>
  );
  
};

export default UserInfoForm;

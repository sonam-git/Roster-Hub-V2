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
    <div className={`w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto rounded-3xl shadow-2xl backdrop-blur-lg 
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-purple-900/90 border border-gray-600/30 shadow-purple-500/20' 
        : 'bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-100/90 border border-blue-200/50 shadow-blue-500/20'
      } p-6 sm:p-8 md:p-10 lg:p-12 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] card-float`}> 
      {Auth.loggedIn() ? (
        <>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-6 
              ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} 
              shadow-xl animate-pulse`}>
              <FaUserEdit className="text-white text-lg sm:text-xl" />
            </div>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 gradient-text
              ${isDarkMode ? 'from-blue-300 to-purple-300' : 'from-blue-600 to-indigo-600'}`}>
              Player Information
            </h2>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete your profile with essential game details
            </p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group md:col-span-1">
                <label htmlFor="jersey-number" className={`block text-sm sm:text-base font-semibold mb-2 transition-colors
                  ${isDarkMode ? 'text-blue-300 group-focus-within:text-blue-200' : 'text-blue-700 group-focus-within:text-blue-800'}`}>
                  Jersey Number
                </label>
                <input
                  id="jersey-number"
                  type="number"
                  placeholder="Enter Your Jersey Number"
                  value={jerseyNumber}
                  className={`w-full rounded-2xl border-0 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base font-medium
                    ${isDarkMode 
                      ? 'bg-gray-800/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-indigo-500/60' 
                      : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-blue-200/60 focus:ring-indigo-500/60'
                    } 
                    shadow-xl ring-2 ring-inset backdrop-blur-sm
                    focus:ring-4 focus:ring-inset focus:shadow-2xl
                    transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                  onChange={(event) => setJerseyNumber(event.target.value)}
                  required
                />
              </div>

              <div className="group md:col-span-1">
                <label htmlFor="position" className={`block text-sm sm:text-base font-semibold mb-2 transition-colors
                  ${isDarkMode ? 'text-blue-300 group-focus-within:text-blue-200' : 'text-blue-700 group-focus-within:text-blue-800'}`}>
                  Position
                </label>
                <input
                  id="position"
                  type="text"
                  placeholder="Enter Your Position"
                  value={position}
                  className={`w-full rounded-2xl border-0 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base font-medium
                    ${isDarkMode 
                      ? 'bg-gray-800/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-indigo-500/60' 
                      : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-blue-200/60 focus:ring-indigo-500/60'
                    } 
                    shadow-xl ring-2 ring-inset backdrop-blur-sm
                    focus:ring-4 focus:ring-inset focus:shadow-2xl
                    transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                  onChange={(event) => setPosition(event.target.value)}
                  required
                />
              </div>

              <div className="group md:col-span-2">
                <label htmlFor="phone-number" className={`block text-sm sm:text-base font-semibold mb-2 transition-colors
                  ${isDarkMode ? 'text-blue-300 group-focus-within:text-blue-200' : 'text-blue-700 group-focus-within:text-blue-800'}`}>
                  Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  value={phoneNumber}
                  className={`w-full rounded-2xl border-0 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base font-medium
                    ${isDarkMode 
                      ? 'bg-gray-800/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-indigo-500/60' 
                      : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-blue-200/60 focus:ring-indigo-500/60'
                    } 
                    shadow-xl ring-2 ring-inset backdrop-blur-sm
                    focus:ring-4 focus:ring-inset focus:shadow-2xl
                    transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full rounded-2xl px-6 py-4 sm:px-8 sm:py-5 text-base sm:text-lg font-bold text-white 
                shadow-2xl transition-all duration-300 transform
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-purple-500/30' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-blue-500/30'
                }
                hover:scale-[1.02] hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-indigo-300/50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none button-glow
                relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                {buttonText}
                <FaUserEdit className="text-base sm:text-lg" />
              </span>
            </button>

            {error && (
              <div className={`p-4 rounded-xl border-l-4 shadow-lg animate-in slide-in-from-left-2 duration-300 flex items-center
                ${isDarkMode 
                  ? 'bg-red-900/50 border-red-500 text-red-200' 
                  : 'bg-red-50 border-red-500 text-red-700'
                }`}>
                <svg className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error.message}</p>
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 
            ${isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-gray-200 to-gray-300'}`}>
            <FaUserEdit className={`text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
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

import React from 'react';
import { useQuery } from '@apollo/client';
import ProfileList from '../components/ProfileList';
import { QUERY_PROFILES } from '../utils/queries';
import Auth from '../utils/auth'; 
import { ThemeContext } from '../components/ThemeContext';

const Roster = () => {
  const { loading, data } = useQuery(QUERY_PROFILES);
  const profiles = data?.profiles || [];
    const year = new Date().getFullYear();

const { isDarkMode } = React.useContext(ThemeContext);
  // Check if the user is logged in
  const isLoggedIn = Auth.loggedIn();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 lg:mt-5 max-w-7xl"> 
      <div className="flex-row justify-center">
        <div className="col-12 ">
          {/* Conditional rendering based on authentication status */}
          {isLoggedIn && (
            <ProfileList profiles={profiles} title={`The ${year} roster`} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </main>
  );
};

export default Roster;

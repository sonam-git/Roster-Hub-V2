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
    <main className="mx-auto w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl"> 
      <div className="flex-row justify-center">
        <div className="col-12 ">
          {/* Conditional rendering based on authentication status */}
          {isLoggedIn && (
            <ProfileList profiles={profiles} title={`The ${year} Roster`} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </main>
  );
};

export default Roster;

import React, { useContext } from 'react';
import { useQuery } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import { ThemeContext } from '../ThemeContext';

const RecentSkillsList = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, data } = useQuery(GET_SKILLS);


  if (loading) {
    return <div>Loading...</div>;
  }

  // Ensure that data.skills is defined and is an array
  if (!data || !Array.isArray(data.skills)) {
    return <div>No skills available</div>;
  }

  const sortedSkills = data.skills.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const topSkills = sortedSkills.slice(0, 5);

  return (
    <>
      <div className={` top-0 mb-2 shadow-md p-2 rounded-md z-10 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
        <h3 className="text-center font-bold mb-2 text-sm md:text-xl lg:text-2xl xl:text-2xl text-gray-800 dark:text-gray-200">Latest Skills</h3>
      </div>

      <div className="w-full overflow-y-auto" style={{ height: '420px' }}>
        <ul>
          {topSkills.map((skill) => (
            <li key={skill._id} className="mb-2">
              <div className={`card shadow-2xl  rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}>
                <div className="card-header text-light p-2">
                  <div className={`mb-2  p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                    <span>{skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}</span>
                  </div>
                  <div className="flex justify-between text-gray-200">
                    <div>
                      <span className="mr-1 text-xs">
                        By: {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)} on {skill.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default RecentSkillsList;

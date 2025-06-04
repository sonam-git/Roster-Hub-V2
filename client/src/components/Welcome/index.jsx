import React, { useContext } from 'react';
import SoccerBall from "../../assets/images/soccer-ball-transparent.png";
import FieldImage from "../../assets/images/field.webp";
import { ThemeContext } from '../ThemeContext';

const Welcome = ({ username }) => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div 
      className={`flex flex-col items-center justify-center rounded-lg shadow-xl p-8 bg-center bg-cover ${isDarkMode ? 'bg-gray-800 text-white filter grayscale' : 'bg-gradient-to-br from-blue-700 to-white text-black filter brightness-85'}`}
      style={{ backgroundImage: `url(${FieldImage})` }}
    >
      <h1 className="text-center font-bold mb-2 text-sm md:text-xl lg:text-2xl xl:text-2xl">
        Welcome <span className="text-yellow-200 text-sm md:text-md lg:text-lg xl:text-2xl">{username}</span> 
      </h1>
      <p className={`text-sm md:text-md text-center ${isDarkMode ? 'text-white' : 'text-black'} mb-8`}>
        Meet Your Team
      </p>
      <div className={`animate-bounce rounded-full ${isDarkMode ? 'bg-gray-200 text-white' : ' text-black'}`}>
        <img
          src={SoccerBall}
          alt="Soccer Ball"
          className={`w-28 md:w-28`}
        />
      </div>
    </div>
  );
};

export default Welcome;

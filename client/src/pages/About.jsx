import React from "react";
import sjImage from "../assets/images/sj.jpg";

export default function About() {
  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32 py-8">
      <h1 className="text-3xl font-extrabold mb-4 text-green-700 dark:text-green-300 flex items-center gap-3">
        <span role="img" aria-label="soccer">⚽️</span> About Roster Hub
      </h1>
      <div className="mb-8 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-lg bg-white flex items-center justify-center mb-2">
            <img src={sjImage} alt="Sonam J Sherpa" className="object-cover w-full h-full" />
          </div>
          <span className="text-lg font-bold text-green-700 dark:text-green-300 mt-2">Sonam J Sherpa</span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2 text-blue-700 dark:text-blue-300">About the Developer</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200 text-lg">
            <strong>Sonam J Sherpa</strong> is not only a passionate full-stack developer, but also an amateur soccer player. He built Roster Hub especially for his team and teammates to communicate, organize, and discuss everything about their games, skills, and team spirit.
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-200 text-lg">
            This project is a blend of his love for soccer and technology, providing a modern, real-time platform for teams to thrive both on and off the field.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Contact: <a href="mailto:sonamjsherpa@gmail.com" className="underline text-blue-600 dark:text-blue-400">sonamjsherpa@gmail.com</a></p>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 ">
        <h3 className="text-xl font-bold mb-2 text-green-700 dark:text-green-300 flex items-center gap-2"><span role="img" aria-label="soccer">🏟️</span> Platform Features</h3>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-200 text-lg">
          <li>Real-time chat and notifications</li>
          <li>Game scheduling and availability tracking</li>
          <li>Skill endorsements and reactions</li>
          <li>Player profiles and ratings</li>
          <li>Dark mode and responsive design</li>
        </ul>
        <div className="flex justify-center mt-4">
          <span className="inline-block px-6 py-2 bg-green-600 text-white font-bold rounded-full shadow-lg text-lg tracking-wide animate-bounce  sm:text-center">Play as a Team, Win as a Family!</span>
        </div>
      </div>
    </div>
  );
}

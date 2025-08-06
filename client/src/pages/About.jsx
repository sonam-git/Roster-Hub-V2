import React from "react";
import sjImage from "../assets/images/sj.jpg";

export default function About() {
  return (
    <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-8 max-w-7xl font-sans" style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
      <h1 className="text-2xl sm:text-3xl md:text-3xl font-extrabold mb-4 text-green-700 dark:text-green-300 flex items-center gap-3" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
        <span role="img" aria-label="soccer">⚽️</span> About Roster Hub
      </h1>
      <div className="mb-8 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-lg bg-white flex items-center justify-center mb-2">
            <img src={sjImage} alt="Sonam J Sherpa" className="object-cover w-full h-full" />
          </div>
          <span className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300 mt-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Sonam J Sherpa</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-blue-700 dark:text-blue-300" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>About the Developer</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200 text-base sm:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            <strong>Sonam J Sherpa</strong> is not only a passionate full-stack developer, but also an amateur soccer player. He built Roster Hub especially for his team and teammates to communicate, organize, and discuss everything about their games, skills, and team spirit.
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-200 text-base sm:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            This project is a blend of his love for soccer and technology, providing a modern, real-time platform for teams to thrive both on and off the field.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Contact: <a href="mailto:sherpa.sjs@gmail.com" className="underline text-blue-600 dark:text-blue-400">sherpa.sjs@gmail.com</a></p>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 ">
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-700 dark:text-green-300 flex items-center gap-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}><span role="img" aria-label="soccer">🏟️</span> Platform Features</h3>
        <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-200 text-base sm:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          <li>Real-time chat and notifications</li>
          <li>Game scheduling and availability tracking : such yes voting poll</li>
          <li>Skill endorsements and reactions</li>
          <li>Player profiles and ratings</li>
          <li>Player can post their thoughts and comment or react on others thought.</li>
          <li>Dark mode and responsive design</li>
          <li>Get the result or match schedule of the professional league</li>
        </ul>
        <div className="flex justify-center mt-4">
          <span className="inline-block px-6 py-2 bg-green-600 text-white font-bold rounded-full shadow-lg text-base sm:text-lg tracking-wide animate-bounce  sm:text-center" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Play as a Team, Win as a Family!</span>
        </div>
      </div>
    </div>
  );
}

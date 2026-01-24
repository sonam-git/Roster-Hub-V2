import React, { useContext } from "react";
import { ThemeContext } from "../components/ThemeContext";
import sjImage from "../assets/images/sj.jpg";

export default function About() {
  const { isDarkMode } = useContext(ThemeContext);

  const features = [
    {
      title: "Real-time Communication",
      description: "Instant chat and notifications to keep your team connected and informed at all times"
    },
    {
      title: "Game Management",
      description: "Schedule games and track player availability with integrated voting and polling system"
    },
    {
      title: "Skill Endorsements",
      description: "Rate teammates and showcase individual strengths with comprehensive skill tracking"
    },
    {
      title: "Player Profiles",
      description: "Comprehensive player profiles with detailed ratings, statistics, and performance metrics"
    },
    {
      title: "Social Platform",
      description: "Share updates, comment, and engage with team discussions in a dedicated social environment"
    },
    {
      title: "Modern Design",
      description: "Professional interface with dark mode support and fully responsive design for all devices"
    },
    {
      title: "League Integration",
      description: "Access professional league results, match schedules, and real-time sports data"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-20 lg:pt-24 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        
        {/* Page Header */}
        <div className="flex-1 w-full lg:w-auto text-center mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            About RosterHub
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            A comprehensive platform designed to unite teams, enhance communication, and elevate team management.
          </p>
        </div>

        {/* Developer Section */}
        <div className={`mb-12 rounded-lg shadow-sm border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img src={sjImage} alt="Sonam J Sherpa" className="object-cover w-full h-full" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className={`text-2xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Sonam J Sherpa
                  </h2>
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Full-Stack Developer
                  </p>
                  
                  <div className="space-y-4">
                    <p className={`text-base leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      RosterHub was born from a passion for both technology and soccer. As an avid soccer player and 
                      experienced full-stack developer, I recognized the need for a comprehensive platform 
                      that could truly unite teams and streamline team management.
                    </p>
                    
                    <p className={`text-base leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      This platform is designed to enhance every aspect of team dynamics, from game planning 
                      to skill development, while fostering the camaraderie that makes team sports engaging 
                      and rewarding.
                    </p>
                  </div>
                </div>

                {/* Contact Section */}
                <div className={`pt-6 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Connect
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a 
                      href="mailto:sherpa.sjs@gmail.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>

                    <a 
                      href="https://github.com/sonam-git" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>

                    <a 
                      href="https://www.linkedin.com/in/sonam-j-sherpa/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>

                    <a 
                      href="https://sjsherpa.vercel.app/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Platform Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                  }`}></div>
                  <div className="flex-1">
                    <h3 className={`text-base font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className={`rounded-lg shadow-sm border p-6 sm:p-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Built With
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React', description: 'Frontend Framework' },
              { name: 'Node.js', description: 'Backend Runtime' },
              { name: 'GraphQL', description: 'API Layer' },
              { name: 'MongoDB', description: 'Database' },
              { name: 'Apollo', description: 'State Management' },
              { name: 'Tailwind CSS', description: 'Styling' },
              { name: 'Socket.io', description: 'Real-time Chat' },
              { name: 'JWT', description: 'Authentication' }
            ].map((tech, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border text-center ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {tech.name}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

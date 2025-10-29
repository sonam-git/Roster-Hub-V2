import React, { useContext } from "react";
import { ThemeContext } from "../components/ThemeContext";
import sjImage from "../assets/images/sj.jpg";

export default function About() {
  const { isDarkMode } = useContext(ThemeContext);

  const features = [
    {
      icon: "💬",
      title: "Real-time Communication",
      description: "Instant chat and notifications to keep your team connected"
    },
    {
      icon: "📅",
      title: "Game Management",
      description: "Schedule games and track player availability with voting polls"
    },
    {
      icon: "⭐",
      title: "Skill Endorsements",
      description: "Rate teammates and showcase individual strengths"
    },
    {
      icon: "👤",
      title: "Player Profiles",
      description: "Comprehensive profiles with ratings and statistics"
    },
    {
      icon: "💭",
      title: "Social Platform",
      description: "Share thoughts, comment, and react to team discussions"
    },
    {
      icon: "🌙",
      title: "Modern Design",
      description: "Dark mode support with fully responsive design"
    },
    {
      icon: "🏆",
      title: "League Integration",
      description: "Access professional league results and match schedules"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-primary ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 ${
              isDarkMode ? 'shadow-green-500/25' : 'shadow-green-500/20'
            }`}>
              <span className="text-2xl">⚽</span>
            </div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-anton font-bold tracking-wider ${
              isDarkMode 
                ? "bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" 
                : "bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            }`}>
              ABOUT ROSTER HUB
            </h1>
          </div>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Where passion meets technology. A comprehensive platform designed to unite teams, 
            enhance communication, and elevate the beautiful game.
          </p>
        </div>

        {/* Developer Section */}
        <div className={`mb-16 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 backdrop-blur-sm border border-gray-600/30' 
            : 'bg-gradient-to-r from-white/80 via-blue-50/80 to-green-50/80 backdrop-blur-sm border border-gray-200/50'
        }`}>
          <div className="p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              
              {/* Profile Image and Info */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="relative mb-6">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-green-500 to-blue-500 shadow-2xl bg-white">
                    <img src={sjImage} alt="Sonam J Sherpa" className="object-cover w-full h-full" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-green-600' : 'bg-green-500'
                  } shadow-lg`}>
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className={`text-2xl sm:text-3xl font-oswald font-bold tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    SONAM J SHERPA
                  </h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <span className="text-sm">🚀</span>
                    <span className="font-semibold font-oswald tracking-wide">FULL-STACK DEVELOPER & SOCCER ENTHUSIAST</span>
                  </div>
                </div>
              </div>

              {/* About Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-oswald font-bold mb-6 tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    THE STORY BEHIND ROSTER HUB
                  </h2>
                  
                  <div className="space-y-4">
                    <p className={`text-lg leading-relaxed font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Born from a passion for both technology and soccer, <strong className="font-oswald tracking-wide">ROSTER HUB</strong> represents 
                      the perfect fusion of digital innovation and team sports. As an avid soccer player and 
                      experienced full-stack developer, I recognized the need for a comprehensive platform 
                      that could truly unite teams.
                    </p>
                    
                    <p className={`text-lg leading-relaxed font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      This isn't just another sports app—it's a carefully crafted ecosystem designed to 
                      enhance every aspect of team dynamics, from game planning to skill development, 
                      all while fostering the camaraderie that makes soccer the world's most beautiful game.
                    </p>
                  </div>
                </div>

                {/* Enhanced Contact Section */}
                <div className={`p-6 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gray-700/30 border border-gray-600/30' 
                    : 'bg-white/60 border border-gray-200/30'
                } backdrop-blur-sm`}>
                  <h4 className={`text-lg font-oswald font-bold mb-4 tracking-wide ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    LET'S CONNECT
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a 
                      href="mailto:sherpa.sjs@gmail.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isDarkMode 
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">📧</span>
                      <div>
                        <div className="font-oswald font-semibold text-sm tracking-wide">EMAIL</div>
                        <div className="text-xs opacity-90">sherpa.sjs@gmail.com</div>
                      </div>
                    </a>

                    <a 
                      href="https://github.com/sonam-git" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isDarkMode 
                          ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">🐱</span>
                      <div>
                        <div className="font-oswald font-semibold text-sm tracking-wide">GITHUB</div>
                        <div className="text-xs opacity-90">sonam-git</div>
                      </div>
                    </a>

                    <a 
                      href="https://www.linkedin.com/in/sonam-j-sherpa/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isDarkMode 
                          ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">�</span>
                      <div>
                        <div className="font-oswald font-semibold text-sm tracking-wide">LINKEDIN</div>
                        <div className="text-xs opacity-90">sonam-j-sherpa</div>
                      </div>
                    </a>

                    <a 
                      href="https://sjsherpa.vercel.app/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 group ${
                        isDarkMode 
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                      <div>
                        <div className="font-oswald font-semibold text-sm tracking-wide">WEBSITE</div>
                        <div className="text-xs opacity-90">sjsherpa.vercel.app</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className={`text-3xl sm:text-4xl font-oswald font-bold mb-4 tracking-wide ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              PLATFORM FEATURES
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm' 
                    : 'bg-white/70 hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/50 backdrop-blur-sm shadow-lg'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200/50'
                }`}>
                  {feature.icon}
                </div>
                <h4 className={`text-xl font-oswald font-bold mb-3 tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {feature.title.toUpperCase()}
                </h4>
                <p className={`leading-relaxed font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center p-12 rounded-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 border border-green-500/30' 
            : 'bg-gradient-to-r from-green-100/80 via-blue-100/80 to-purple-100/80 border border-green-200/50'
        } backdrop-blur-sm shadow-2xl`}>
          <div className="mb-6">
            <span className="text-6xl mb-4 block">🏆</span>
            <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Ready to Elevate Your Team?
            </h3>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of teams already using Roster Hub to transform their game experience.
            </p>
          </div>
          
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 animate-pulse ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-2xl' 
              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl'
          }`}>
            <span>⚽</span>
            <span>Play as a Team, Win as a Family!</span>
            <span>🏆</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/Hero.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaTrophy, 
  FaChartLine 
} from "react-icons/fa";
import heroImage from "../../assets/images/sketch-removebg.png";


const Hero = () => {
  
  const navigate = useNavigate();

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Full-page Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-25"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
          }}
        ></div>
        
        {/* Lighter gradient overlays for better text readability while keeping image visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-indigo-100/80 dark:from-gray-950/80 dark:via-slate-900/70 dark:to-indigo-950/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 dark:from-black/20 dark:via-transparent dark:to-black/10"></div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Enhanced Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Enhanced Floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-green-400/60 to-emerald-400/60 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-blue-400/60 to-cyan-400/60 rotate-45 animate-ping shadow-lg"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full animate-bounce shadow-lg"></div>
        <div className="absolute top-60 right-60 w-5 h-5 bg-gradient-to-r from-indigo-400/60 to-purple-400/60 rounded-full animate-bounce delay-300 shadow-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-screen flex flex-col">
        {/* Enhanced Top Section: Title and Slogan */}
        <div className={`text-center mb-4 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Modern Glassmorphism container for title */}
          <div className="inline-block p-6 rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-oswald font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-2xl">
              ROSTER<span className="text-green-500 dark:text-green-400">HUB</span>
            </h1>
            <div className="max-w-2xl mx-auto p-3 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10">
              <p className="text-xs sm:text-sm lg:text-base text-gray-800 dark:text-gray-100 font-oswald font-semibold tracking-wide drop-shadow-lg">
                WHERE PLAYERS <span className="text-green-500 dark:text-green-400 animate-pulse">CONNECT</span> & <span className="text-blue-500 dark:text-blue-400 animate-pulse delay-300">UNDERSTAND</span> BEFORE THE GAME!
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-24 transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={() => navigate("/signup")}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-oswald font-bold tracking-wide rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-base min-w-[180px] border border-green-400/50 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              ✨ JOIN AS NEW USER
            </span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="group relative px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-green-600 dark:text-green-400 border-2 border-green-500/70 dark:border-green-400/70 font-oswald font-bold tracking-wide rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-base min-w-[180px] hover:bg-green-50/95 dark:hover:bg-gray-700/95 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              🚀 LOGIN
            </span>
          </button>
        </div>

        {/* Enhanced Feature Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 transition-all duration-1000 delay-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Team Management */}
          <div className="group relative text-center backdrop-blur-xl bg-white/30 dark:bg-black/20 rounded-2xl p-4 border border-white/40 dark:border-white/15 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/40 dark:hover:bg-black/30 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400/80 to-emerald-500/80 dark:from-green-500/70 dark:to-emerald-600/70 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                <FaUsers className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-oswald font-bold tracking-wide text-gray-900 dark:text-white mb-2 drop-shadow-md group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                TEAM MANAGEMENT
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
                Create detailed player profiles, track skills, and manage your team roster with ease.
              </p>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="group relative text-center backdrop-blur-xl bg-white/30 dark:bg-black/20 rounded-2xl p-4 border border-white/40 dark:border-white/15 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/40 dark:hover:bg-black/30 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400/80 to-indigo-500/80 dark:from-blue-500/70 dark:to-indigo-600/70 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                <FaChartLine className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-oswald font-bold tracking-wide text-gray-900 dark:text-white mb-2 drop-shadow-md group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                PERFORMANCE ANALYTICS
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
                Track player progress with advanced metrics, ratings, and detailed performance reports.
              </p>
            </div>
          </div>

          {/* Game Scheduling */}
          <div className="group relative text-center backdrop-blur-xl bg-white/30 dark:bg-black/20 rounded-2xl p-4 border border-white/40 dark:border-white/15 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/40 dark:hover:bg-black/30 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400/80 to-pink-500/80 dark:from-purple-500/70 dark:to-pink-600/70 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                <FaTrophy className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-oswald font-bold tracking-wide text-gray-900 dark:text-white mb-2 drop-shadow-md group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                GAME SCHEDULING
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
                Schedule matches, track scores, and celebrate victories with comprehensive game management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
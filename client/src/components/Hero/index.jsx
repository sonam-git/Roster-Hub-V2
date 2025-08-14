// src/components/Hero.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
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
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-green-500/40 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
        {/* Top Center: Title and Slogan */}
        <div className={`text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Glassmorphism container for title */}
          <div className="mb-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight drop-shadow-lg mx-4 sm:mx-0">
              Roster<span className="text-green-600 dark:text-green-400">Hub</span>
            </h1>
            <p className="text-xs sm:text-lg lg:text-xl text-gray-800 dark:text-gray-100 font-medium drop-shadow-md italic">
              Where Players Connect & Understand Before The Game!
            </p>
          </div>
        </div>

        {/* Center: Transparent Background Image */}
        <div className={`flex-1 flex items-center justify-center transition-all duration-1000 delay-300 transform mb-6 sm:mb-0 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative backdrop-blur-sm bg-white/20 dark:bg-black/10 rounded-full p-4 border border-white/30 dark:border-white/10 shadow-xl">
            <img
              src={heroImage}
              alt="RosterHub"
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-green-500/20 dark:bg-green-400/15 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Buttons under the image */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-green-600/90 hover:bg-green-700/90 backdrop-blur-sm text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm min-w-[160px] border border-green-500/30"
          >
            Join as New User
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm text-green-600 dark:text-green-400 border-2 border-green-600/70 dark:border-green-400/70 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm min-w-[160px] hover:bg-green-50/95 dark:hover:bg-gray-700/90"
          >
            Login
          </button>
        </div>

        {/* Feature row at the bottom */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 transition-all duration-1000 delay-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Team Management */}
          <div className="text-center group backdrop-blur-md bg-white/25 dark:bg-black/15 rounded-xl p-4 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/35 dark:hover:bg-black/25">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100/90 dark:bg-green-900/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FaUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 drop-shadow-md">
              Team Management
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
              Create detailed player profiles, track skills, and manage your team roster with ease.
            </p>
          </div>

          {/* Performance Analytics */}
          <div className="text-center group backdrop-blur-md bg-white/25 dark:bg-black/15 rounded-xl p-4 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/35 dark:hover:bg-black/25">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100/90 dark:bg-green-900/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FaChartLine className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 drop-shadow-md">
              Performance Analytics
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
              Track player progress with advanced metrics, ratings, and detailed performance reports.
            </p>
          </div>

          {/* Game Scheduling */}
          <div className="text-center group backdrop-blur-md bg-white/25 dark:bg-black/15 rounded-xl p-4 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/35 dark:hover:bg-black/25">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100/90 dark:bg-green-900/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FaTrophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 drop-shadow-md">
              Game Scheduling
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
              Schedule matches, track scores, and celebrate victories with comprehensive game management.
            </p>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-green-500/40 rounded-full animate-bounce"></div>
      </div>
    </main>
  );
};

export default Hero;

// src/components/Hero.jsx
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";
import heroImage from "../../assets/images/dark-logo.png";
import heroImageDark from "../../assets/images/roster-hub-logo.png";
import sketchImage from "../../assets/images/sketch-removebg.png";

const Hero = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [showRight, setShowRight] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Helper: is small screen - using window resize for better reactivity
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 1024
  );

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mount, start timer for mobile
  useEffect(() => {
    if (isMobile && !showRight) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Start new timer
      timerRef.current = setTimeout(() => setShowRight(true), 5000);
    } else if (!isMobile) {
      // On large screens, show both columns
      setShowRight(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { 
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isMobile, showRight]);

  // Progress bar animation for mobile timer
  useEffect(() => {
    let progressInterval;
    
    if (isMobile && !showRight) {
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += 2; // 2% every 100ms = 5 seconds total
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
    } else {
      setProgress(0);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isMobile, showRight]);

  return (
    <main className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Fully Transparent Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-25 sm:opacity-35 dark:opacity-15 sm:dark:opacity-25" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Enhanced Floating Soccer Ball Animation - More interactive */}
        <div className="absolute top-10 left-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-40 sm:opacity-70 animate-ping hover:opacity-90 hover:scale-150 transition-all duration-300 cursor-pointer"></div>
        <div className="absolute top-32 right-16 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-35 sm:opacity-60 animate-bounce hover:opacity-90 hover:scale-150 transition-all duration-300 cursor-pointer"></div>
        <div className="absolute bottom-20 left-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-30 sm:opacity-50 animate-pulse hover:opacity-90 hover:scale-150 transition-all duration-300 cursor-pointer"></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-40 sm:opacity-70 animate-ping hover:opacity-90 hover:scale-150 transition-all duration-300 cursor-pointer"></div>
        
        {/* Additional floating particles for more dynamic feel */}
        <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-gradient-to-r from-green-300 to-blue-300 opacity-30 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-gradient-to-r from-yellow-300 to-red-300 opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 opacity-25 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 lg:gap-12">
        {/* Left side: Modern branding - Show with same UI on all screens */}
        <div 
          className={`
            ${isMobile && showRight ? "hidden" : "block"}
            lg:block
            w-full lg:w-1/2 flex flex-col items-center text-center mb-8 lg:mb-0 p-6 lg:p-8
            transition-all duration-500 ease-in-out
            ${isMobile && showRight ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
          `}
        >
            
            {/* Enhanced Main Title with Premium Effects */}
            <div className="relative mb-8 group">
              <div className="bg-gradient-to-br from-white/30 via-white/20 to-white/15 dark:from-black/40 dark:via-black/30 dark:to-black/20 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-white/50 dark:border-white/30 shadow-2xl transform transition-all duration-700 hover:scale-105 overflow-hidden">
                <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-blue-400/40 to-purple-400/40 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                    <img
                      src={isDarkMode ? heroImage : heroImageDark}
                      alt="Roster Hub Logo"
                      className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 animate-left-right drop-shadow-2xl rounded-full border-3 border-white/60 dark:border-gray-600/60 shadow-2xl transform group-hover:scale-110 transition-all duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-2xl group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-500 leading-tight">
                      ROSTER HUB
                    </h1>
                  </div>
                </div>
                <div className="text-center space-y-2 sm:space-y-3">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 dark:text-gray-200 italic group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-500">
                    Your Ultimate Team Management Platform
                  </p>
                  <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
                    <span className="animate-bounce text-base sm:text-lg md:text-xl lg:text-2xl">⚽</span>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 font-semibold">
                      Where Champions Are Made
                    </p>
                    <span className="animate-bounce delay-300 text-base sm:text-lg md:text-xl lg:text-2xl">🏆</span>
                  </div>
                </div>
                {/* Enhanced Multi-layered Glow Effects */}
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600/30 via-blue-600/30 to-purple-600/30 blur-3xl -z-10 animate-pulse group-hover:opacity-90 transition-opacity duration-700"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 blur-2xl -z-10 animate-pulse delay-500 group-hover:opacity-80 transition-opacity duration-700"></div>
                {/* Enhanced Particle Effects */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-70"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute top-8 left-8 w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce opacity-75"></div>
                <div className="absolute bottom-4 right-8 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping delay-700 opacity-80"></div>
              </div>
            </div>

            {/* Enhanced Sketch Image with Transparent Background */}
            <div className="relative mb-8 group">
              <div className="relative">
                <img
                  src={sketchImage}
                  alt="Team Strategy Sketch"
                  className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 object-contain rounded-2xl transform transition-all duration-700 group-hover:scale-105 drop-shadow-2xl filter group-hover:brightness-110"
                />
                {/* Floating Elements Around Image */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-70"></div>
                <div className="absolute top-1/4 -left-3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute bottom-1/3 -right-3 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce delay-500 opacity-75"></div>
              </div>
            </div>

          {/* Modern CTA Buttons - Enhanced Design */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl mb-6">
              <button
                onClick={() => navigate("/signup")}
                className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-emerald-400/50 transition-all duration-500 text-lg tracking-wide transform hover:scale-105 active:scale-95 border-2 border-white/40 backdrop-blur-sm overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl group-hover:animate-bounce transition-transform duration-300">✨</span>
                  <span className="font-black">New User</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
              </button>
              
              <button
                onClick={() => navigate("/login")}
                className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-slate-600/80 via-gray-700/80 to-slate-800/80 hover:from-slate-500 hover:via-gray-600 hover:to-slate-700 backdrop-blur-xl text-white font-bold rounded-2xl border-2 border-white/50 hover:border-white/70 transition-all duration-500 text-lg tracking-wide transform hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl group-hover:animate-bounce transition-transform duration-300">�</span>
                  <span className="font-black">Welcome Back</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">💫</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
              </button>
            </div>
          </div>

        {/* Right side: Modern Features and Action Panel */}
        <div
          className={`
            ${isMobile && !showRight ? "hidden" : "block"}
            lg:block
            w-full lg:w-1/2 flex flex-col items-center
            transition-all duration-500 ease-in-out
            ${isMobile && !showRight ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
            ${isMobile ? "px-2" : "px-4"}
          `}
        >
          <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 dark:from-black/25 dark:via-black/15 dark:to-black/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-2 sm:p-4 lg:p-6 flex flex-col items-center w-full max-w-4xl border-2 border-white/25 dark:border-white/15 overflow-hidden">
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 via-blue-500/5 to-yellow-500/5 animate-pulse"></div>
            </div>
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="relative mb-4">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                  <span className="bg-gray-800 dark:bg-gray-100 bg-clip-text text-transparent">
                    Join the League!
                  </span>
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl animate-bounce">⭐</span>
                  <p className="text-lg text-gray-800/90 dark:text-white/90 font-semibold">
                    Build Your Championship Team
                  </p>
                  <span className="text-2xl animate-bounce delay-150">⚽</span>
                </div>
              </div>
            </div>

            {/* Enhanced Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
              <div className="relative group bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-5 border border-green-300/30 hover:border-green-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/20 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl animate-bounce group-hover:scale-110 transition-transform duration-300">👥</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-green-600 dark:group-hover:text-green-200 transition-colors">Team Profiles</h3>
                </div>
                <p className="text-gray-700/90 dark:text-white/80 group-hover:text-gray-800 dark:group-hover:text-white/90 text-sm leading-relaxed transition-colors">Create dynamic player profiles with photos, stats, positions and skill ratings</p>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              </div>

              <div className="relative group bg-gradient-to-br from-blue-400/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-5 border border-blue-300/30 hover:border-blue-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-400/20 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl animate-bounce delay-100 group-hover:scale-110 transition-transform duration-300">⭐</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">Skill System</h3>
                </div>
                <p className="text-gray-700/90 dark:text-white/80 group-hover:text-gray-800 dark:group-hover:text-white/90 text-sm leading-relaxed transition-colors">Rate teammates, give endorsements and track skill progression over time</p>
              </div>

              <div className="relative group bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-5 border border-purple-300/30 hover:border-purple-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/20 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl animate-bounce delay-200 group-hover:scale-110 transition-transform duration-300">💬</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-200 transition-colors">Live Chat</h3>
                </div>
                <p className="text-gray-700/90 dark:text-white/80 group-hover:text-gray-800 dark:group-hover:text-white/90 text-sm leading-relaxed transition-colors">Real-time team communication with messaging and comment systems</p>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              </div>

              <div className="relative group bg-gradient-to-br from-orange-400/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-5 border border-orange-300/30 hover:border-orange-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-400/20 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl animate-bounce delay-300 group-hover:scale-110 transition-transform duration-300">📅</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-200 transition-colors">Game Management</h3>
                </div>
                <p className="text-gray-700/90 dark:text-white/80 group-hover:text-gray-800 dark:group-hover:text-white/90 text-sm leading-relaxed transition-colors">Schedule matches, create polls, and track team performance analytics</p>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              </div>

              <div className="relative group bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-lg rounded-2xl p-5 border border-yellow-300/30 hover:border-yellow-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20 sm:col-span-2 overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl animate-bounce delay-400 group-hover:scale-110 transition-transform duration-300">🏟️</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-yellow-600 dark:group-hover:text-yellow-200 transition-colors">Pro League Tracking</h3>
                </div>
                <p className="text-gray-700/90 dark:text-white/80 group-hover:text-gray-800 dark:group-hover:text-white/90 text-sm leading-relaxed transition-colors">Follow your favorite professional teams with live scores, schedules and league standings</p>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              </div>
            </div>
            {/* Enhanced Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-blue-600/10 to-yellow-600/10 rounded-3xl animate-pulse backdrop-blur-sm -z-10"></div>
          </div>
        </div>
      </div>

      {/* Progress indicator for mobile timer - only show on mobile when left column is visible */}
      {isMobile && !showRight && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 ">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-800/90 dark:text-white/90 text-xs font-medium">
                <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-100 ease-out dark:gradient-to-r dark:from-green-100 dark:to-blue-100 "
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span>⚡ Features loading...</span>
              </div>
              <button
                onClick={() => {
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                  }
                  setShowRight(true);
                }}
                className="text-gray-700/90 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-xs font-semibold px-2 py-1 rounded-full hover:bg-white/10 transition-all duration-200"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Hero;

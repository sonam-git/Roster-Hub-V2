// src/components/Hero.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sketchImage from "../../assets/images/sketch-removebg.png";

const Hero = () => {
  const navigate = useNavigate();

  // Modern animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    setTimeout(() => setStatsVisible(true), 800);
  }, []);

  // Sample data for LeagueSight-style stats
  const teamStats = [
    { label: "Active Teams", value: "2,847", change: "+12.3%" },
    { label: "Games Played", value: "18,923", change: "+8.7%" },
    { label: "Player Ratings", value: "156K", change: "+24.1%" },
    { label: "Match Analytics", value: "94.2%", change: "+5.8%" }
  ];

  const featuredPlayers = [
    { name: "Marcus Chen", position: "Midfielder", rating: 94.5, team: "Thunder FC" },
    { name: "Sofia Rodriguez", position: "Striker", rating: 92.8, team: "Lightning SC" },
    { name: "James Wilson", position: "Defender", rating: 91.3, team: "Storm United" }
  ];

  return (
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden ">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M0 0h60v1H0V0zm0 30h60v1H0v-1z'/%3E%3Cpath d='M0 0v60h1V0H0zm30 0v60h1V0h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-emerald-500/2 to-purple-500/3"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-400/50 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        {/* Header Section */}
        <div className={`text-center mb-10 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col items-center justify-center gap-6 mb-8 ">
            <div className="relative">
              <img
                src={sketchImage}
                alt="RosterHub Sketch"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Roster<span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text">Hub</span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 font-semibold italic leading-tight">
                Where Players Connect & Understand Before The Game!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
            The ultimate team management platform where strategy meets performance. 
            <span className="text-blue-600 dark:text-blue-400 font-semibold"> Connect with your team</span>, 
            <span className="text-purple-600 dark:text-purple-400 font-semibold"> analyze every play</span>, and 
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> dominate the field</span>.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Stats Dashboard */}
          <div className={`space-y-6 transition-all duration-1000 delay-300 transform ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Team Statistics */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-gray-700/40 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Platform Analytics</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {teamStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/30 dark:border-gray-600/30 hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {stat.label}
                    </div>
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Players */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 dark:border-gray-700/40 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <span className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-pulse"></span>
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Top Rated Players</span>
              </h3>
              <div className="space-y-4">
                {featuredPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/30 dark:border-gray-600/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {player.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {player.position} • {player.team}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {player.rating}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Rating
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Features & CTA */}
          <div className={`space-y-6 transition-all duration-1000 delay-500 transform ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Key Features */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30 dark:border-gray-700/40 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">Everything You Need</span>
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 p-3 rounded-xl transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      Team Management
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Create detailed player profiles with photos, stats, and skill ratings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 p-3 rounded-xl transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      Performance Analytics
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Track player progress with advanced metrics and visual reports
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 p-3 rounded-xl transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg">💬</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      Team Communication
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Real-time chat, messaging, and collaborative team planning
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 p-3 rounded-xl transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                      Match Management
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Schedule games, track scores, and analyze match performance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call-to-Action */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-3 text-center tracking-tight">
                  Ready to Build Your Championship Team?
                </h3>
                <p className="text-blue-100 text-center mb-6 font-medium">
                  Join thousands of teams already using RosterHub to achieve greatness
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate("/signup")}
                    className="flex-1 bg-white text-blue-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg"
                  >
                    🚀 Get Started Free
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex-1 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-lg"
                  >
                    ⚡ Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;

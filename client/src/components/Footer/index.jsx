
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaEnvelope, FaTwitter, FaShieldAlt, FaFileContract, FaCookie } from "react-icons/fa";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";
import lightLogo from "../../assets/images/RH-Logo-Light.png";
import darkLogo from "../../assets/images/RH-Logo.png";

const Footer = ({ className = "" }) => {
  const year = new Date().getFullYear();
  const { isDarkMode } = useContext(ThemeContext);
  const isLoggedIn = Auth.loggedIn();

  return (
    <footer 
      className={`w-full bg-gray-800 relative mt-auto border-t border-gray-700/50 ${className}`}
      style={{boxShadow: '0 -4px 24px rgba(0,0,0,0.15)'}}
    >
      {/* Main Footer Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8 sm:py-12">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLoggedIn ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 lg:gap-12`}>
          
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative">
                <img
                  src={isDarkMode ? darkLogo : lightLogo}
                  className="w-12 h-12 rounded-xl shadow-lg border-2 border-blue-400/30 bg-gradient-to-br from-blue-100/60 to-purple-100/40 dark:from-blue-900/40 dark:to-purple-900/30 transition-transform duration-300 group-hover:scale-110"
                  alt="RosterHub Logo"
                  style={{ objectFit: 'contain' }}
                />
                <span className="absolute inset-0 rounded-xl border-2 border-blue-400/40 dark:border-purple-400/40 opacity-30 animate-pulse pointer-events-none"></span>
              </div>
              <div>
                <h3 className="font-oswald font-bold text-xl tracking-wide text-white group-hover:text-blue-400 transition-colors">
                  ROSTERHUB
                </h3>
                <p className="text-xs text-gray-400 font-oswald tracking-wider">TEAM MANAGEMENT</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              The ultimate platform for managing sports teams, tracking games, and building winning lineups.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/sonamjsherpa/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 hover:bg-blue-300 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-300"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://github.com/sonam-git"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-gray-100"
                title="GitHub"
                aria-label="GitHub Profile"
              >
                <FaGithub className="text-xl" />
              </a>
              <a
                href="mailto:sherpa.sjs@gmail.com"
                className="p-2 bg-gray-200 hover:bg-yellow-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-yellow-100"
                title="Email"
                aria-label="Email Contact"
              >
                <FaEnvelope className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links - Only show for logged in users */}
          {isLoggedIn && (
            <div>
              <h4 className="font-oswald font-bold text-base sm:text-lg mb-4 text-white tracking-wide">
                QUICK LINKS
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    to="/" 
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  >
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  >
                    ℹ️ About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/upcoming-games" 
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  >
                    📅 Upcoming Games
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/recent-skills" 
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  >
                    ⭐ Skills & Ratings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/message" 
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  >
                    💬 Messages
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Resources */}
          <div>
            <h4 className="font-oswald font-bold text-base sm:text-lg mb-4 text-white tracking-wide">
              RESOURCES
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  to="/help" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                >
                  ❓ Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                >
                  🤔 FAQs
                </Link>
              </li>
              <li>
                <a 
                  href="#support" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 hover:no-underline"
                  onClick={(e) => e.preventDefault()}
                >
                  🛟 Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Newsletter */}
          <div>
            <h4 className="font-oswald font-bold text-base sm:text-lg mb-4 text-white tracking-wide">
              LEGAL
            </h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 hover:no-underline"
                >
                  <FaShieldAlt className="text-xs" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 hover:no-underline"
                >
                  <FaFileContract className="text-xs" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies" 
                  className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 hover:no-underline"
                >
                  <FaCookie className="text-xs" /> Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mb-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="text-gray-400 text-center sm:text-left">
              <p>
                &copy; {year} <span className="font-semibold text-white">RosterHub</span>. All rights reserved.
              </p>
            </div>
            <div className="text-gray-400 text-center sm:text-right">
              <p>
                Developed by {"  "}
                <a 
                  href="https://www.linkedin.com/in/sonamjsherpa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-blue-400 transition-colors underline-offset-4 "
                >
                  Sonam J Sherpa
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-50"></div>
    </footer>
  );
};

export default Footer;

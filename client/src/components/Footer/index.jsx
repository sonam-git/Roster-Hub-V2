import { useLocation, useNavigate } from "react-router-dom";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

const Footer = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const year = new Date().getFullYear();

  return (
    <footer className={`w-full bg-gray-800 text-white py-6 relative z-[400] ${className}`} style={{boxShadow: '0 -2px 16px rgba(0,0,0,0.08)', position: 'sticky', bottom: 0}}>
      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="rounded bg-white text-gray-800 px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          )}
          <span className="text-sm">&copy; {year} - Roster Hub</span>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <a
            href="https://www.linkedin.com/in/sonamjsherpa/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
            title="LinkedIn"
          >
            <FaLinkedin className="text-2xl" />
          </a>
          <a
            href="mailto:sherpa.sjs@gmail.com"
            className="hover:text-yellow-400 transition"
            title="Email"
          >
            <FaEnvelope className="text-2xl" />
          </a>
          <a
            href="https://github.com/sonam-git"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
            title="GitHub"
          >
            <FaGithub className="text-2xl" />
          </a>
        </div>
        <div className="text-xs text-gray-400 mt-2 md:mt-0 text-center md:text-right">
          Developed by{" "}
          <span className="font-semibold text-white">Sonam J Sherpa</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const year = new Date().getFullYear();

  return (
    <footer className={`w-full bg-gray-800 text-white py-4 ${className}`}>
      <div className="container mx-auto text-center px-4">
        {!isHome ? (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded bg-white text-gray-800 px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition"
            >
              ← Home
            </button>
            <p className="text-sm">&copy; {year} - Roster Hub</p>
          </div>
        ) : (
          <p className="text-sm">&copy; {year} - Roster Hub developed by Sonam J Sherpa</p>
        )}
      </div>
    </footer>
  );
};

export default Footer;

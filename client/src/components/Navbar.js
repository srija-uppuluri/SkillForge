import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg
        ${isActive(to) 
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">SkillForge</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/skills', 'Browse Skills')}
            {user && (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/my-skills', 'My Skills')}
                {navLink('/requests', 'Requests')}
                {navLink('/transactions', 'Transactions')}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 px-4 py-1.5 rounded-full border border-primary-100 dark:border-primary-800">
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{user.balance_credits} credits</span>
                </div>
                <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium text-sm hover:shadow-lg transition-shadow">
                  {user.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + menu */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800" aria-label="Toggle dark mode">
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in-down">
            <Link to="/skills" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>Browse Skills</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/my-skills" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>My Skills</Link>
                <Link to="/requests" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>Requests</Link>
                <Link to="/transactions" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>Transactions</Link>
                <div className="border-t dark:border-gray-800 my-2" />
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2.5 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

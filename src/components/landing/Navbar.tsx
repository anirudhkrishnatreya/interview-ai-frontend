import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();

  const dashboardLink = user?.role === 'super_admin' ? '/super-admin' :
    user?.role === 'company_admin' ? '/company-admin' :
      '/candidate';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 ">
              <img src="/logo.png" alt="EasyHiring Logo" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">EasyHiring</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it works</a>
            <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to={dashboardLink}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Dashboard
                </motion.button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Sign up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

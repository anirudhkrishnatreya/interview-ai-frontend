import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { user, tokens } = data;

      login(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName,
          plan: user.plan,
        },
        tokens.accessToken,
        tokens.refreshToken,
      );

      const routes: Record<string, string> = {
        super_admin: '/super-admin',
        company_admin: '/company-admin',
        candidate: '/candidate',
      };
      const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo;
      navigate(redirectTo || routes[user.role] || '/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Column — Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
            <img src="/logo.png" alt="EasyHiring Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-bold text-2xl text-slate-900 tracking-tight">EasyHiring</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-slate-500">Sign in to your EasyHiring account to manage your workspace</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 bg-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors flex justify-center items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Start your 14-day free trial
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column — Benefits Panel */}
      <div className="hidden lg:flex relative flex-1 bg-indigo-900 overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-30" />

        <div className="relative flex flex-col justify-center h-full px-16 xl:px-20 text-white">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
              EasyHiring Platform
            </div>

            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Build your dream team<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">without the busywork.</span>
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed mb-10">
              Our AI-powered platform automates the entire screening process, bringing you the best candidates with zero bias and zero hassle.
            </p>
            
            <div className="space-y-5">
              {[
                { icon: '🎙️', title: 'AI Voice Interviews', desc: 'Automated interviews with real-time transcription and scoring' },
                { icon: '📊', title: 'Instant Analytics', desc: 'Data-driven insights on every candidate — no bias, just facts' },
                { icon: '🛡️', title: 'Proctoring Built-in', desc: 'Detect cheating and ensure interview integrity automatically' },
                { icon: '⚡', title: 'Setup in Minutes', desc: 'Create your first interview template in under 5 minutes' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="text-sm text-indigo-300 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-indigo-400 mb-4">Trusted by teams at</p>
              <div className="flex items-center gap-6 text-white/40 text-sm font-semibold">
                <span>Acme Corp</span>
                <span>·</span>
                <span>TechVentures</span>
                <span>·</span>
                <span>ScaleHQ</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

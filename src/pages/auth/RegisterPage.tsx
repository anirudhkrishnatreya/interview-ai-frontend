import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Building2, User, Mail, Lock, Globe, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-commerce',
  'Manufacturing', 'Consulting', 'Media & Entertainment', 'Real Estate', 'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1–10', '11–50', '51–200', '201–500', '501–1000', '1000+',
];

type Step = 1 | 2;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.companyName.trim()) { setError('Company name is required.'); return; }
    if (form.companyWebsite && !/\S+\.\S+/.test(form.companyWebsite)) {
      setError('Please enter a valid website (e.g. google.com)');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!form.agreeTerms) { setError('You must agree to the Terms of Service.'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register-company`, {
        companyName: form.companyName,
        companyWebsite: form.companyWebsite || undefined,
        industry: form.industry || undefined,
        companySize: form.companySize || undefined,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        password: form.password,
      });
      const { user, tokens } = data;
      login(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: form.companyName,
          plan: user.plan,
        },
        tokens.accessToken,
        tokens.refreshToken,
      );
      navigate('/company-admin');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
            <img src="/logo.png" alt="EasyHiring Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-bold text-2xl text-slate-900 tracking-tight">EasyHiring</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Start your free trial</h1>
            <p className="mt-2 text-slate-500">14 days free · No credit card required · Cancel anytime</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s ? 'bg-indigo-600 text-white' : step === s ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'}`}>
                    {step > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                  <span className="hidden sm:inline">{s === 1 ? 'Company' : 'Admin Account'}</span>
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 rounded transition-colors ${step > s ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* ── Step 1: Company Info ── */
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleNext}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" required value={form.companyName} onChange={set('companyName')}
                      placeholder="Acme Inc."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Website</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" value={form.companyWebsite} onChange={set('companyWebsite')}
                      placeholder="https://yourcompany.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                    <select value={form.industry} onChange={set('industry')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all appearance-none">
                      <option value="">Select…</option>
                      {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
                    <select value={form.companySize} onChange={set('companySize')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all appearance-none">
                      <option value="">Select…</option>
                      {COMPANY_SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit"
                  className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors flex justify-center items-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              </motion.form>

            ) : (
              /* ── Step 2: Admin Account ── */
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" required value={form.adminName} onChange={set('adminName')}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email" required value={form.adminEmail} onChange={set('adminEmail')}
                      placeholder="jane@yourcompany.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                      placeholder="Min. 8 characters"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password" required value={form.confirmPassword} onChange={set('confirmPassword')}
                      placeholder="Repeat your password"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 bg-white transition-all"
                    />
                    {form.confirmPassword && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${form.password === form.confirmPassword ? 'text-emerald-500' : 'text-red-400'}`}>
                        {form.password === form.confirmPassword ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input id="terms" type="checkbox" checked={form.agreeTerms} onChange={set('agreeTerms')}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                  <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Privacy Policy</a>
                  </label>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className={`flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors flex justify-center items-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}>
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                    ) : (
                      <><CheckCircle2 size={16} /> Create Account</>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right — Benefits panel */}
      <div className="hidden lg:flex relative flex-1 bg-indigo-900 overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-30" />

        <div className="relative flex flex-col justify-center h-full px-16 xl:px-20 text-white">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              14-day free trial — no card needed
            </div>

            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Hire smarter,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">not harder.</span>
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed mb-10">
              Join hundreds of companies using EasyHiring to run AI-powered voice interviews and build great teams faster.
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Use a unique email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-6 py-12">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        {/* Header Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-xl shadow-brand-500/20 mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="text-sm text-slate-400 mt-2">Get started with CareerCopilot AI</p>
        </div>

        {/* Card Form */}
        <div className="bg-[#111827]/60 border border-slate-800/60 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-sm text-slate-200 placeholder-slate-550 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-sm text-slate-200 placeholder-slate-550 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-sm text-slate-200 placeholder-slate-550 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-sm text-slate-200 placeholder-slate-550 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-red-950/20 border border-red-500/25 text-red-400 rounded-xl text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-850 pt-5">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine correct home based on user role
  const getHomePath = (role?: string) => (role === 'COMPANY' ? '/company' : '/dashboard');

  // Redirect if already logged in
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || getHomePath(user?.role);
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      // After login, read user from localStorage to get role
      const storedUser = localStorage.getItem('sb_user');
      const loggedUser = storedUser ? JSON.parse(storedUser) : null;
      const target =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        getHomePath(loggedUser?.role);
      navigate(target, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-purple-200 mb-8">Welcome back to SponsorBridge</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-100 text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-purple-100 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-purple-200 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-300 hover:text-white font-semibold transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

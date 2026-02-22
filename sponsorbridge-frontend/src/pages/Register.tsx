import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ORGANIZER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use Axios service with configured baseURL
      const response = await api.post('/auth/register', { 
        email, 
        name, 
        password, 
        role 
      });

      if (response.status === 201) {
        const data = response.data;
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data));
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <a href="/" className="flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </a>

        <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-purple-200 mb-8">Join SponsorBridge today</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-100 text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-300"
                placeholder="John Doe"
              />
            </div>

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
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-purple-100 text-sm font-semibold mb-2">I am a...</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-300"
              >
                <option value="ORGANIZER" className="bg-purple-900">Event Organizer</option>
                <option value="COMPANY" className="bg-purple-900">Company/Sponsor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-purple-200 text-sm text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-purple-300 hover:text-white font-semibold transition">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

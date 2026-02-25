import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;

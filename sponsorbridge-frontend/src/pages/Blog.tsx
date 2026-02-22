import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      title: '5 Tips for Landing Your First Major Sponsor',
      date: 'Feb 15, 2026',
      excerpt: 'Learn the strategies that have helped 100+ events secure sponsorships worth $500K+',
    },
    {
      title: 'The Future of Event Sponsorship in 2026',
      date: 'Feb 10, 2026',
      excerpt: 'Insights from industry leaders on how sponsorship trends are evolving.',
    },
    {
      title: 'Case Study: How State University Increased Sponsorship Revenue by 300%',
      date: 'Feb 1, 2026',
      excerpt: 'A detailed look at the strategies that worked for one of our most successful clients.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Blog & Resources</h1>
          <p className="text-slate-300 text-lg mb-12">Stay updated with sponsorship insights and best practices.</p>

          <div className="space-y-6">
            {blogPosts.map((post, idx) => (
              <article key={idx} className="border border-slate-700 rounded-lg p-6 hover:border-indigo-500/50 transition cursor-pointer">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{post.date}</p>
                    <p className="text-slate-300">{post.excerpt}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-300">
              Subscribe to our newsletter for weekly sponsorship tips and industry insights.
            </p>
            <div className="flex gap-2 mt-4">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
              />
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

import React, { useState } from 'react';
import { ArrowRight, Search, User, LogOut, Menu, X } from 'lucide-react';

const Home: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const sponsors = [
    { name: 'CRED', category: 'FinTech', budget: '₹50K - ₹5L', type: 'Monetary', region: 'Pan India' },
    { name: 'Red Bull', category: 'Beverage', budget: '₹50K - ₹5L', type: 'Goodies + Monetary', region: 'Global' },
    { name: 'Boat', category: 'Lifestyle', budget: '₹50K - ₹5L', type: 'Goodies', region: 'India' },
    { name: 'Razorpay', category: 'FinTech', budget: '₹50K - ₹5L', type: 'Monetary', region: 'India' },
    { name: 'LocalStart Café', category: 'Food & Beverage', budget: '₹50K - ₹5L', type: 'In-kind', region: 'Uttar Pradesh' },
  ];

  const organizers = [
    { name: 'TechVerse Community', type: 'Student Community', city: 'Noida', footfall: 800, events: 5 },
    { name: 'Galgotias Coding Club', type: 'College Club', city: 'Greater Noida', footfall: 500, events: 3 },
    { name: 'Lucknow Marathon Committee', type: 'Independent Body', city: 'Lucknow', footfall: 3000, events: 7 },
    { name: 'Delhi Startup Summit', type: 'Private Org', city: 'Delhi', footfall: 1500, events: 4 },
  ];

  const requests = [
    { event: 'TECHVERSE 2.0', type: 'Tech Hackathon', date: '2026-03-20', budget: 300000, status: 'Pending' },
    { event: 'CodeSprint 2026', type: 'Coding Competition', date: '2026-04-15', budget: 150000, status: 'Approved' },
    { event: 'Lucknow Marathon 2026', type: 'Sports', date: '2026-06-10', budget: 800000, status: 'Pending' },
    { event: 'Startup Nexus 2026', type: 'Startup Summit', date: '2026-05-05', budget: 600000, status: 'Rejected' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Navigation Bar */}
      <nav className="bg-purple-900/50 backdrop-blur-md border-b border-purple-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">SponsorBridge</div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-purple-200 hover:text-white transition">Home</a>
            <a href="#about" className="text-purple-200 hover:text-white transition">About Us</a>
            <a href="#contact" className="text-purple-200 hover:text-white transition">Contact Us</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600/40 border border-purple-400/30 rounded-lg text-white hover:bg-purple-600/60 transition">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-purple-900 border border-purple-400/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  <a href="#profile" className="block px-4 py-2 text-purple-200 hover:text-white hover:bg-purple-800/50">Edit Profile</a>
                  <a href="#settings" className="block px-4 py-2 text-purple-200 hover:text-white hover:bg-purple-800/50">Settings</a>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-purple-200 hover:text-white hover:bg-purple-800/50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a href="/login" className="px-4 py-2 text-purple-200 hover:text-white transition">Sign In</a>
                <a href="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Register</a>
              </>
            )}
            <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-white">
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden bg-purple-900/80 border-t border-purple-400/20 px-4 py-4 space-y-2">
            <a href="#home" className="block text-purple-200 hover:text-white py-2">Home</a>
            <a href="#about" className="block text-purple-200 hover:text-white py-2">About Us</a>
            <a href="#contact" className="block text-purple-200 hover:text-white py-2">Contact Us</a>
          </div>
        )}
      </nav>

      {/* Search Bar Section */}
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search for sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-purple-400/30 backdrop-blur-md border border-purple-300/50 text-white placeholder-purple-200 focus:outline-none focus:border-purple-200"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-4">Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Company Type</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-purple-700/60 border border-purple-400/50 text-white rounded-lg focus:outline-none focus:border-purple-300 hover:bg-purple-700/80 transition"
              >
                <option value="">All Types</option>
                <option value="FinTech">FinTech</option>
                <option value="Beverage">Beverage</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Food & Beverage">Food & Beverage</option>
              </select>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Sponsorship Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-purple-700/60 border border-purple-400/50 text-white rounded-lg focus:outline-none focus:border-purple-300 hover:bg-purple-700/80 transition"
              >
                <option value="">All Types</option>
                <option value="Monetary">Monetary</option>
                <option value="Goodies">Goodies</option>
                <option value="In-kind">In-kind</option>
              </select>
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">Budget Range</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-4 py-2 bg-purple-700/60 border border-purple-400/50 text-white rounded-lg focus:outline-none focus:border-purple-300 hover:bg-purple-700/80 transition"
              >
                <option value="">All Budgets</option>
                <option value="50K-1L">₹50K - ₹1L</option>
                <option value="1L-3L">₹1L - ₹3L</option>
                <option value="3L-5L">₹3L - ₹5L</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Card - Main Hero */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-3">Platform Overview</p>
              <h1 className="text-5xl font-bold text-white mb-2">
                TRENDING
                <br />
                <span className="text-purple-300 italic">Sponsors</span>
              </h1>
              <p className="text-purple-100 text-sm mb-6">Find Your Perfect Match</p>
              
              <div className="flex gap-3 mb-8">
                <a href="/login" className="px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition">
                  SIGN IN
                </a>
                <a href="/register" className="px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition">
                  CREATE ACCOUNT
                </a>
              </div>
            </div>
          </div>

          {/* Right Card - Info */}
          <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h3 className="text-white font-bold text-lg mb-3">WHAT IS A SPONSOR?</h3>
              <p className="text-purple-100 text-sm leading-relaxed mb-4">
                A sponsor is a company or organization that provides financial support, resources, or services to an event. They gain brand exposure and connect with their target audience.
              </p>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-purple-300 hover:text-white transition cursor-pointer">
                <span className="text-sm font-semibold">Learn more.</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">→</div>
              <div>
                <h3 className="text-white font-bold mb-2">HOW SPONSORSHIPS WORK</h3>
                <p className="text-purple-100 text-sm leading-relaxed mb-4">
                  Sponsorships are typically organized into categories or tiers, which represent different levels of support and visibility. They interact through mutual benefits.
                </p>
                <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-purple-300 hover:text-white transition cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm font-semibold">Continue reading...</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">★</div>
              <div>
                <h3 className="text-white font-bold mb-2">BENEFITS FOR ORGANIZERS</h3>
                <p className="text-purple-100 text-sm leading-relaxed mb-4">
                  Event organizers gain financial support, resources, and expertise from sponsors. This enables them to create better events and reach wider audiences.
                </p>
                <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-purple-300 hover:text-white transition cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm font-semibold">Learn more.</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Section - Sponsors */}
        <div className="mt-12" id="about">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-6 text-center">EXPLORE SPONSORS</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sponsors
              .filter(sponsor => {
                const matchesSearch = sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sponsor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sponsor.region.toLowerCase().includes(searchQuery.toLowerCase());
                
                const matchesCategory = !selectedCategory || sponsor.category === selectedCategory;
                
                const matchesType = !selectedType || sponsor.type.includes(selectedType);
                
                const matchesBudget = !selectedBudget || sponsor.budget === '₹50K - ₹5L';
                
                return matchesSearch && matchesCategory && matchesType && matchesBudget;
              })
              .map((sponsor, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 hover:border-purple-300/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{sponsor.name}</h3>
                    <p className="text-purple-300 text-sm">{sponsor.category}</p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm mb-4">Budget Range: {sponsor.budget}</p>
                <button className="w-full px-4 py-2 bg-purple-500/60 hover:bg-purple-500/80 text-white rounded-lg transition font-semibold text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
          {sponsors.filter(sponsor => 
            sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sponsor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sponsor.region.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && searchQuery && (
            <div className="text-center mt-8">
              <p className="text-purple-200">No sponsors found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Explore Section - Organizers */}
        <div className="mt-12">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-6 text-center">FEATURED ORGANIZERS</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organizers.map((organizer, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 hover:border-purple-300/50 transition">
                <h3 className="text-white font-bold text-lg mb-2">{organizer.name}</h3>
                <p className="text-purple-300 text-sm mb-3">{organizer.type}</p>
                <div className="space-y-2 text-purple-100 text-sm mb-4">
                  <p>→ City: {organizer.city}</p>
                  <p>★ Footfall: {organizer.footfall.toLocaleString()}</p>
                  <p>◐ Events: {organizer.events}</p>
                </div>
                <button className="w-full px-4 py-2 bg-purple-500/60 hover:bg-purple-500/80 text-white rounded-lg transition font-semibold text-sm">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Section - Sponsorship Requests */}
        <div className="mt-12">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-6 text-center">ACTIVE SPONSORSHIP REQUESTS</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 hover:border-purple-300/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{request.event}</h3>
                    <p className="text-purple-300 text-sm">{request.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-200' :
                    request.status === 'Approved' ? 'bg-green-500/30 text-green-200' :
                    'bg-red-500/30 text-red-200'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="space-y-2 text-purple-100 text-sm mb-4">
                  <p>Date: {new Date(request.date).toLocaleDateString()}</p>
                  <p>Budget: ₹{request.budget.toLocaleString()}</p>
                </div>
                <button className="w-full px-4 py-2 bg-purple-500/60 hover:bg-purple-500/80 text-white rounded-lg transition font-semibold text-sm">
                  View Request
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-16 bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
          <h2 className="text-3xl font-bold text-white mb-4">About SponsorBridge</h2>
          <p className="text-purple-100 leading-relaxed mb-4">
            SponsorBridge is a modern marketplace connecting event organizers with sponsoring companies. Our platform streamlines the sponsorship discovery and negotiation process, enabling meaningful partnerships that benefit both parties.
          </p>
          <p className="text-purple-100 leading-relaxed">
            Whether you're organizing a conference, festival, or community event, SponsorBridge helps you find the right sponsors quickly and efficiently. For companies, it's an opportunity to reach engaged audiences and build brand loyalty.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12" id="contact">
          <div className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30">
            <h2 className="text-3xl font-bold text-white mb-6">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold mb-2">Email</h3>
                <p className="text-purple-200">yadavakarshit26@gmail.com</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Phone</h3>
                <p className="text-purple-200">+91 7084251486</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Address</h3>
                <p className="text-purple-200">New Delhi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-purple-400/20 pt-8">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest">SponsorBridge • Connecting Events with Perfect Sponsors</p>
          <p className="text-purple-400 text-sm mt-4">&copy; 2026 SponsorBridge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

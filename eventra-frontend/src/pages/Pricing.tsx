import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Pricing Plans</h1>
          <p className="text-slate-300 text-lg mb-12">Choose the perfect plan for your event sponsorship needs.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$99', features: ['20 Event Listings', 'Basic Analytics', 'Email Support'] },
              { name: 'Professional', price: '$299', features: ['Unlimited Events', 'Advanced Analytics', 'Priority Support', 'API Access'], highlighted: true },
              { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated Manager', 'Custom Integrations', 'SLA Guarantee'] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-lg p-8 border transition ${plan.highlighted ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/50'}`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-indigo-400 mb-6">{plan.price}<span className="text-sm text-slate-400">/month</span></p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

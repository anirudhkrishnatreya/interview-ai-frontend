import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Starter',
    priceMonthly: 49,
    priceYearly: 39,
    description: 'Perfect for small teams and startups looking to streamline their initial hiring.',
    features: [
      'Up to 5 active jobs',
      '100 AI voice interviews / month',
      'Basic reporting & analytics',
      'Email support',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    priceMonthly: 149,
    priceYearly: 119,
    description: 'For growing companies that need advanced collaboration and unlimited scaling.',
    features: [
      'Unlimited active jobs',
      '500 AI voice interviews / month',
      'Advanced insights & scoring',
      'Custom branding',
      'Priority 24/7 support',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    priceMonthly: 499,
    priceYearly: 399,
    description: 'Dedicated support, custom integrations, and ultimate security for large organizations.',
    features: [
      'Unlimited everything',
      'Dedicated Customer Success Manager',
      'SSO & Advanced Security',
      'Custom API integrations',
      'White-glove onboarding',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-600 mb-8">
            Choose the perfect plan for your team's hiring needs. No hidden fees.
          </p>
          
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg">
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${!isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center ${isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly <span className="ml-1.5 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div 
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-8 border ${tier.highlighted ? 'border-indigo-600 shadow-2xl shadow-indigo-100 relative' : 'border-slate-200 shadow-sm'} flex flex-col`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm h-12">{tier.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">${isYearly ? tier.priceYearly : tier.priceMonthly}</span>
                  <span className="text-slate-500 ml-2">/mo</span>
                </div>
                {isYearly && <p className="text-sm text-slate-400 mt-1">billed annually</p>}
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-indigo-600 mr-3 shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/login" className="mt-auto">
                <button className={`w-full py-3 rounded-lg font-bold transition-all ${tier.highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'}`}>
                  {tier.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

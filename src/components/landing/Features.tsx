import React from 'react';
import { Bot, Users, LineChart, Shield, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'AI-Powered Screening',
    description: 'Automatically filter and rank candidates based on skills, experience, and custom criteria using advanced AI.',
    icon: Bot,
  },
  {
    name: 'Collaborative Hiring',
    description: 'Keep your entire team in sync with shared notes, evaluations, and real-time interview feedback.',
    icon: Users,
  },
  {
    name: 'Actionable Insights',
    description: 'Make data-driven decisions with comprehensive reporting on time-to-hire, diversity, and pipeline health.',
    icon: LineChart,
  },
  {
    name: 'Smart Scheduling',
    description: 'Eliminate back-and-forth emails. Let candidates book interviews based on your team’s real-time availability.',
    icon: Calendar,
  },
  {
    name: 'Enterprise Security',
    description: 'Your data is safe with us. We maintain the highest standards of security and compliance for your organization.',
    icon: Shield,
  },
  {
    name: 'Advanced Sourcing',
    description: 'Discover passive candidates with our intelligent search tools that scan multiple platforms at once.',
    icon: Search,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need to hire better</h2>
          <p className="text-lg text-slate-600">
            A comprehensive suite of tools designed to help modern teams scale their hiring process without sacrificing quality or candidate experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

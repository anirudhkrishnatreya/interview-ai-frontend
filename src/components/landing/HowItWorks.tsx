import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, BrainCircuit, BarChart3 } from 'lucide-react';

const steps = [
  {
    title: '1. Create a Position',
    description: 'Set up your job requirements, upload documents, and let our AI generate the perfect interview questions tailored to the role.',
    icon: UploadCloud,
  },
  {
    title: '2. AI Voice Interviews',
    description: 'Candidates take an automated, conversational AI voice interview that dynamically adapts to their responses in real-time.',
    icon: BrainCircuit,
  },
  {
    title: '3. Actionable Insights',
    description: 'Get instant, comprehensive reports scoring each candidate across technical skills, communication, and cultural fit.',
    icon: BarChart3,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">How EasyHiring works</h2>
          <p className="text-lg text-slate-600">
            A seamless three-step process that eliminates manual screening and brings the best talent straight to your dashboard.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-50 shadow-xl flex items-center justify-center mb-6 relative group">
                  <div className="absolute inset-0 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                  <step.icon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

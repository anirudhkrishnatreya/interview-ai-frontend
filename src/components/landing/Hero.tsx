import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium text-sm mb-8 border border-indigo-100"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            <span>The new standard for modern hiring</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight"
          >
            Streamline your hiring with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Intelligent Automation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Identify, assess, and hire top talent faster. Move from a chaotic inbox to a highly structured, data-driven recruitment pipeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <button className="px-8 py-4 w-full bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 group">
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="px-8 py-4 w-full sm:w-auto bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              Book a Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-slate-500 mb-16"
          >
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> No credit card required</div>
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> 14-day free trial</div>
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> Cancel anytime</div>
          </motion.div>

          {/* Dashboard Mockup Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-5xl rounded-xl border border-slate-200/50 bg-white/50 p-2 shadow-2xl shadow-indigo-200/20 backdrop-blur-xl"
          >
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
              <div className="overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}mockup.png`}
                  alt="EasyHiring Dashboard Mockup"
                  className="w-full h-auto object-cover opacity-90 -mt-[10%] md:-mt-[20%]"
                />
              </div>
            </div>
            {/* Abstract UI Elements floating */}
            <div className="absolute -left-8 -top-8 w-24 h-24 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
      </div>
    </section>
  );
}

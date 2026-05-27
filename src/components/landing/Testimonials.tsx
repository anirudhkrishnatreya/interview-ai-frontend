import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "EasyHiring cut our screening time by 75%. We are now able to interview 4x the amount of candidates without increasing our HR headcount.",
    author: "Sarah Jenkins",
    role: "VP of Talent, TechGrow",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    quote: "The actionable insights and AI scoring are incredibly accurate. It has completely removed the bias from our initial interview stages.",
    author: "Michael Chang",
    role: "Engineering Manager, DataSystems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    quote: "Candidates love the flexibility of the automated voice interviews. Our candidate NPS has skyrocketed since we switched.",
    author: "Elena Rodriguez",
    role: "Head of Operations, Nexa",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-indigo-900 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-800 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-800 blur-3xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Trusted by forward-thinking teams</h2>
          <p className="text-lg text-indigo-200">
            Don't just take our word for it. Here is what our customers have to say about the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-indigo-800/40 backdrop-blur-sm border border-indigo-700/50 p-8 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-indigo-50 text-lg leading-relaxed mb-8 italic">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center space-x-4">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" />
                <div>
                  <h4 className="font-bold text-white">{testimonial.author}</h4>
                  <p className="text-indigo-300 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does the AI voice interview work?",
    answer: "Our AI agent conducts conversational, real-time voice interviews. It asks questions tailored to the role, listens to the candidate's response, and dynamically asks follow-up questions based on their answers, just like a human interviewer would."
  },
  {
    question: "Can I customize the interview questions?",
    answer: "Absolutely. While our AI can automatically generate questions based on the job description, you have full control to review, edit, or add your own specific technical or cultural questions."
  },
  {
    question: "How are candidates scored?",
    answer: "After the interview, the AI analyzes the transcript and audio. It scores candidates based on technical accuracy, communication skills, confidence, and role alignment. You get a detailed dashboard with the scorecard and interview recording."
  },
  {
    question: "Does it integrate with my existing ATS?",
    answer: "Yes! We offer integrations with popular Applicant Tracking Systems like Greenhouse, Lever, and Workday on our Professional and Enterprise plans."
  },
  {
    question: "Is candidate data secure and private?",
    answer: "Security is our top priority. All audio and transcripts are encrypted in transit and at rest. We are SOC2 compliant and adhere to GDPR and CCPA regulations."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Frequently asked questions</h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-indigo-200 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-slate-900 text-left">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-indigo-600' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-0 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

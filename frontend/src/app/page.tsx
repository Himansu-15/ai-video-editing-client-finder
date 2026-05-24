'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';
import { Sparkles, ArrowRight, Search, Mail, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] overflow-hidden flex flex-col justify-between">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            VF
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">VideoFinder AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
            Sign In
          </Link>
          <Link
            href={isAuthenticated ? '/dashboard' : '/signup'}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20 md:py-28 my-auto space-y-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" /> For Freelance Video Editors
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl text-slate-100"
        >
          Find your next video editing client{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            automatically
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl"
        >
          The automated client finder that scans YouTube creators, personal brands, and agencies.
          Collect contact emails, evaluate posting activity, score leads with AI, and generate high-converting pitches in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mt-4"
        >
          <Link
            href={isAuthenticated ? '/dashboard' : '/signup'}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-3.5 text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-600/35 transition-all cursor-pointer"
          >
            {isAuthenticated ? 'Open Client Finder' : 'Start Finding Clients Free'}{' '}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full pt-16 max-w-5xl">
          {[
            { title: 'YouTube Scraper', desc: 'Scan creators by niche, subscriber thresholds, and activity.', icon: Search },
            { title: 'AI Quality Scoring', desc: 'Find clients with budget using upload frequency & retention indicators.', icon: Sparkles },
            { title: 'Cold Pitch Builder', desc: 'Generate personalized outreach email scripts with OpenAI GPT-4o.', icon: Mail },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-card p-6 rounded-xl border border-white/5 text-left space-y-3"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">{feat.title}</h3>
                <p className="text-slate-400 text-xs leading-normal">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 border-t border-white/5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} VideoFinder AI. Built for video editors. All rights reserved.
      </footer>
    </div>
  );
}

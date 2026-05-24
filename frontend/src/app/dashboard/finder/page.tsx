'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { scraperApi, leadsApi } from '../../../lib/api';
import {
  Search,
  Sliders,
  Play,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Mail,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function FinderPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('general');
  const [maxResults, setMaxResults] = useState(5);
  const [platform, setPlatform] = useState<'YOUTUBE' | 'INSTAGRAM'>('YOUTUBE');
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  // Fetch history to see if there is an active job running
  const { data: historyData } = useQuery({
    queryKey: ['history'],
    queryFn: () => scraperApi.history(),
    refetchInterval: runningJobId ? 1500 : false, // Poll every 1.5s if a job is running
  });

  // Track the running job and progress state
  useEffect(() => {
    if (historyData?.history) {
      const activeJob = historyData.history.find((h: any) => h.id === runningJobId);
      if (activeJob) {
        if (activeJob.status === 'COMPLETED') {
          setProgress(100);
          setProgressText('Job completed successfully!');
          setTimeout(() => {
            setRunningJobId(null);
            setProgress(0);
            setProgressText('');
            // Refetch leads lists
            queryClient.invalidateQueries({ queryKey: ['leads'] });
          }, 2000);
        } else if (activeJob.status === 'FAILED') {
          setRunningJobId(null);
          setProgress(0);
          setProgressText('');
          alert('Scrape job failed. Please check backend logs or try mock mode.');
        } else {
          // Simulate sub-step progress increments for smoother UX while waiting
          setProgressText('Scraping YouTube channels & analyzing editing quality...');
          setProgress((prev) => Math.min(prev + 8, 92));
        }
      }
    }
  }, [historyData, runningJobId, queryClient]);

  // Start scraper mutation
  const startScrapeMutation = useMutation({
    mutationFn: (data: any) => scraperApi.start(data),
    onSuccess: (data) => {
      setRunningJobId(data.search.id);
      setProgress(10);
      setProgressText('Initializing Scraper Engine...');
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to start scraping');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    startScrapeMutation.mutate({
      keyword,
      niche: niche === 'general' ? undefined : niche,
      platform,
      maxResults,
    });
  };

  const isScraping = !!runningJobId;

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Lead Finder</h1>
        <p className="text-slate-400 text-sm mt-1">Discover creators who need professional video editors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Finder Configuration form */}
        <div className="glass p-6 rounded-xl border border-white/5 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Search Filters</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Keyword Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  disabled={isScraping}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. fitness vlogs, tech reviews"
                  className="w-full bg-[#181822] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Niche Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Niche / Category
              </label>
              <select
                disabled={isScraping}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-[#181822] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              >
                <option value="general">General (All niches)</option>
                <option value="gaming">Gaming</option>
                <option value="tech">Technology</option>
                <option value="cooking">Cooking & Food</option>
                <option value="fitness">Fitness & Health</option>
                <option value="travel">Travel</option>
                <option value="business">Business & Finance</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="education">Education</option>
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isScraping}
                  onClick={() => setPlatform('YOUTUBE')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    platform === 'YOUTUBE'
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-[#181822] border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  disabled={isScraping}
                  onClick={() => setPlatform('INSTAGRAM')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    platform === 'INSTAGRAM'
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-[#181822] border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Instagram
                </button>
              </div>
            </div>

            {/* Max Results slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Leads to Search
                </label>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {maxResults}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                disabled={isScraping}
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full h-1 bg-[#181822] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 lead</span>
                <span>20 leads</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="finder-search-submit"
              type="submit"
              disabled={isScraping || !keyword}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 font-medium text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scraping...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Search
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Progress tracker & Results panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {isScraping ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass p-12 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                  <Search className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-semibold text-slate-200">Finding clients...</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{progressText}</p>
                </div>
                {/* Custom progress bar */}
                <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-indigo-500 h-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-400">{Math.round(progress)}%</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-8 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]"
              >
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold text-slate-200">Ready to discover</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter keywords related to creators (e.g. "travel vloggers", "unboxing") to scan their channels.
                    Our AI Scraper will look up subscriber levels, calculate upload frequency, find contact emails,
                    and score them based on editing indicators.
                  </p>
                </div>
                <div className="border border-white/5 rounded-lg p-3.5 bg-white/25 max-w-sm text-left">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      <strong>Tip:</strong> If you don't have a YouTube API key configured in Settings,
                      the finder automatically runs in <strong>Mock Mode</strong> to fetch simulated creators instantly so you can test features.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

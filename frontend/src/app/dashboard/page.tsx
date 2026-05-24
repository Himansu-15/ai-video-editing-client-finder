'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { leadsApi, scraperApi } from '../../lib/api';
import {
  Users,
  Search,
  Sparkles,
  CheckCircle,
  Loader2,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Fetch leads and history for analytics
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', { limit: 1000 }],
    queryFn: () => leadsApi.list({ limit: 1000 }),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => scraperApi.history(),
  });

  const isLoading = leadsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const leads = leadsData?.leads || [];
  const history = historyData?.history || [];

  // Metrics calculations
  const totalLeads = leads.length;
  const highQualityLeads = leads.filter((l: any) => l.qualityScore === 'HIGH').length;
  
  const contactedLeads = leads.filter(
    (l: any) => l.outreachStatus !== 'NOT_CONTACTED'
  ).length;
  const conversionRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;

  const activeScrapes = history.filter((s: any) => s.status === 'RUNNING').length;

  // Group leads by date for a simple chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map((date) => {
    const count = leads.filter((l: any) => l.createdAt.startsWith(date)).length;
    const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { label, count };
  });

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-8 flex-1">
      {/* Welcome banner */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time performance metrics and lead pipeline status</p>
        </div>
        <Link
          href="/dashboard/finder"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Search className="w-4 h-4" /> Start Lead Finder
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Leads Found', value: totalLeads, desc: 'Across all platforms', icon: Users, color: 'text-indigo-400' },
          { title: 'High Quality Leads', value: highQualityLeads, desc: 'Identified by Lead Scorer', icon: Sparkles, color: 'text-amber-400' },
          { title: 'Outreach Pipeline', value: `${conversionRate}%`, desc: `${contactedLeads} leads contacted`, icon: CheckCircle, color: 'text-emerald-400' },
          { title: 'Active Scrapers', value: activeScrapes, desc: 'Jobs running currently', icon: Search, color: 'text-sky-400' },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.title}</span>
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl font-bold text-slate-100">{metric.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{metric.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Growth Chart */}
        <div className="glass p-6 rounded-xl border border-white/5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-200">Leads Discovered</h2>
              <p className="text-xs text-slate-400">Leads generated over the past 7 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 border-b border-white/5">
            {chartData.map((d, i) => {
              const pct = (d.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${Math.max(pct, 5)}%` }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all cursor-pointer relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-200 hidden group-hover:block whitespace-nowrap shadow-lg">
                      {d.count} found
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 pb-2">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scraper Status Card */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Scraper Activity</h2>
            <p className="text-xs text-slate-400 mb-4">Latest search execution summaries</p>

            {history.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No searches run yet.</p>
            ) : (
              <div className="space-y-3.5">
                {history.slice(0, 4).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">"{h.keyword}"</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">+{h.runCount} leads</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                          h.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : h.status === 'RUNNING'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/dashboard/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mt-4">
            View Search History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Recently Discovered Leads</h2>
            <p className="text-xs text-slate-400">The latest potential clients analyzed</p>
          </div>
          <Link href="/dashboard/leads" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
            View database <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-slate-500 py-12 text-center">No leads found yet. Start by using the Lead Finder!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold h-10">
                  <th>Creator</th>
                  <th>Subscribers</th>
                  <th>Upload Frequency</th>
                  <th>Quality Score</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((lead: any) => (
                  <tr key={lead.id} className="border-b border-white/5 h-12 hover:bg-white/5 transition-colors">
                    <td className="font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {lead.name}
                        <a href={lead.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-400">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="text-slate-300">{(lead.subscriberCount / 1000).toFixed(0)}k</td>
                    <td className="text-slate-300">{lead.uploadFrequency.toFixed(1)} vids/wk</td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold border text-[9px] ${
                          lead.qualityScore === 'HIGH'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : lead.qualityScore === 'MEDIUM'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        }`}
                      >
                        {lead.qualityScore}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {lead.outreachStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link href="/dashboard/leads" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Pitch Client
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

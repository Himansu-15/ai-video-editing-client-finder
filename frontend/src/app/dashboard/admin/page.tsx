'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/api';
import { ShieldCheck, Users, Search, Play, Loader2, Database, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 rounded-xl border border-red-500/10 text-center flex flex-col items-center justify-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h3 className="text-base font-bold text-slate-200">Unauthorized</h3>
        <p className="text-xs text-slate-400">You must be logged in as an administrator to view this page.</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalSearches: 0,
    totalLeads: 0,
    leadsByQuality: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    leadsByOutreach: { NOT_CONTACTED: 0, CONTACTED: 0, REPLIED: 0, CLOSED: 0 },
  };

  const recentUsages = data?.recentUsages || [];

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-indigo-500" /> Admin Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Platform analytics and API usage statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Global Platform Users', value: stats.totalUsers, desc: 'Registered editor accounts', icon: Users, color: 'text-indigo-400' },
          { title: 'Searches Run', value: stats.totalSearches, desc: 'Total scrape tasks triggered', icon: Search, color: 'text-sky-400' },
          { title: 'Creator Leads Captured', value: stats.totalLeads, desc: 'Total records in system', icon: Database, color: 'text-emerald-400' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="glass p-6 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.title}</span>
                <h3 className="text-2xl font-bold text-slate-100 mt-2">{metric.value}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{metric.desc}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${metric.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Distribution */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Lead Quality Breakdown</h2>
          <div className="space-y-3.5">
            {[
              { label: 'High Quality', count: stats.leadsByQuality.HIGH, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium Quality', count: stats.leadsByQuality.MEDIUM, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low Quality', count: stats.leadsByQuality.LOW, color: 'bg-slate-500', text: 'text-slate-400' },
            ].map((bar) => {
              const total = stats.totalLeads || 1;
              const pct = ((bar.count / total) * 100).toFixed(0);
              return (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={bar.text}>{bar.label}</span>
                    <span className="text-slate-300">{bar.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`${bar.color} h-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outreach Distribution */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Outreach Pipeline Distribution</h2>
          <div className="space-y-3.5">
            {[
              { label: 'Not Contacted', count: stats.leadsByOutreach.NOT_CONTACTED, color: 'bg-slate-500', text: 'text-slate-400' },
              { label: 'Contacted', count: stats.leadsByOutreach.CONTACTED, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'Replied', count: stats.leadsByOutreach.REPLIED, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Closed / Secured', count: stats.leadsByOutreach.CLOSED, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((bar) => {
              const total = stats.totalLeads || 1;
              const pct = ((bar.count / total) * 100).toFixed(0);
              return (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={bar.text}>{bar.label}</span>
                    <span className="text-slate-300">{bar.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`${bar.color} h-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Telemetry Logs */}
      <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">System Telemetry Audit Logs</h2>
        {recentUsages.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No audit logs available.</p>
        ) : (
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#0f0f13]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold h-10 bg-white/5 px-6">
                  <th className="px-4">User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th className="px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentUsages.map((log: any) => (
                  <tr key={log.id} className="border-b border-white/5 h-11 hover:bg-white/5 transition-colors">
                    <td className="px-4 font-semibold text-slate-200">
                      <div>
                        <span>{log.user.name}</span>
                        <span className="block text-[9px] font-normal text-slate-400 mt-0.5">{log.user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-300 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="text-slate-300 font-normal">{log.details || 'N/A'}</td>
                    <td className="px-4 text-right text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
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

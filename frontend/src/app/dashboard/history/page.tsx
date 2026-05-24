'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scraperApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { History, Play, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch search history
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => scraperApi.history(),
  });

  // Re-run search mutation
  const rerunSearchMutation = useMutation({
    mutationFn: (data: any) => scraperApi.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      // Redirect to Lead Finder so they see it running
      router.push('/dashboard/finder');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to re-run search');
    },
  });

  const handleRerun = (h: any) => {
    const filters = JSON.parse(h.filters || '{}');
    rerunSearchMutation.mutate({
      keyword: h.keyword,
      niche: h.niche || undefined,
      platform: h.platform,
      maxResults: filters.maxResults || 5,
    });
  };

  const history = data?.history || [];

  return (
    <div className="space-y-8 flex-1 flex flex-col min-h-0">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Search History</h1>
        <p className="text-slate-400 text-sm mt-1">Review and re-run your previous lead scans</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="glass p-16 rounded-xl border border-white/5 text-center flex-1 flex flex-col justify-center items-center">
          <div className="p-4 bg-[#181822] border border-white/5 rounded-2xl text-slate-500 mb-4">
            <History className="w-10 h-10" />
          </div>
          <p className="text-slate-400 font-semibold mb-2">No queries run yet</p>
          <p className="text-xs text-slate-500">Go to the Lead Finder to run your first scrape scan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl bg-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold h-11 bg-white/5 px-6">
                <th className="px-6">Keyword / Search Phrase</th>
                <th>Platform</th>
                <th>Niche</th>
                <th>Status</th>
                <th>Leads Discovered</th>
                <th>Date Executed</th>
                <th className="text-right px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: any) => {
                const filters = JSON.parse(h.filters || '{}');
                return (
                  <tr key={h.id} className="border-b border-white/5 h-14 hover:bg-white/5 transition-colors">
                    {/* Keyword */}
                    <td className="px-6 font-semibold text-slate-200">
                      <div>
                        <span>"{h.keyword}"</span>
                        <p className="text-[10px] font-normal text-slate-500 mt-1">
                          Max: {filters.maxResults || 5} results
                        </p>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="text-slate-300 font-medium">{h.platform}</td>

                    {/* Niche */}
                    <td className="text-slate-300 capitalize">{h.niche || 'General'}</td>

                    {/* Status */}
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[9px] ${
                          h.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : h.status === 'RUNNING'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {h.status === 'COMPLETED' && <CheckCircle className="w-2.5 h-2.5" />}
                        {h.status === 'FAILED' && <AlertCircle className="w-2.5 h-2.5" />}
                        {h.status}
                      </span>
                    </td>

                    {/* Leads Discovered */}
                    <td className="text-slate-200 font-semibold">+{h.runCount} leads</td>

                    {/* Date */}
                    <td className="text-slate-400">{new Date(h.createdAt).toLocaleString()}</td>

                    {/* Actions */}
                    <td className="text-right px-6">
                      <button
                        onClick={() => handleRerun(h)}
                        disabled={h.status === 'RUNNING'}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        Run Again <Play className="w-3 h-3 fill-current" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../../lib/api';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Download,
  ExternalLink,
  Mail,
  Copy,
  Trash2,
  X,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [qualityScore, setQualityScore] = useState('');
  const [outreachStatus, setOutreachStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [emailText, setEmailText] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch leads with parameters
  const { data, isLoading } = useQuery({
    queryKey: ['leads', { page, search, qualityScore, outreachStatus, platform }],
    queryFn: () =>
      leadsApi.list({
        page,
        limit: 10,
        search,
        qualityScore: qualityScore || undefined,
        outreachStatus: outreachStatus || undefined,
        platform: platform || undefined,
      }),
  });

  // Update outreach status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.update(id, { outreachStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (selectedLead) {
        // Update selected lead state if drawer is open
        setSelectedLead((prev: any) =>
          prev ? { ...prev, outreachStatus: prev.outreachStatus } : null
        );
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update outreach status');
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      setSelectedLead(null);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete lead');
    },
  });

  // Generate Email mutation
  const generateEmailMutation = useMutation({
    mutationFn: (id: string) => leadsApi.generateEmail(id),
    onMutate: () => {
      setGeneratingEmail(true);
      setEmailText('');
    },
    onSuccess: (data) => {
      setEmailText(data.email);
      setGeneratingEmail(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to generate email pitch');
      setGeneratingEmail(false);
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLeadMutation.mutate(id);
    }
  };

  const handleGenerateEmail = (id: string) => {
    generateEmailMutation.mutate(id);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const leads = data?.leads || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="space-y-8 flex-1 flex flex-col min-h-0 relative">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Leads Database</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and contact your analyzed creator list</p>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-2">
          <a
            href={leadsApi.getExportUrl('csv')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#181822] hover:bg-[#20202d] text-slate-300 border border-white/5 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <a
            href={leadsApi.getExportUrl('excel')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#181822] hover:bg-[#20202d] text-slate-300 border border-white/5 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel
          </a>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass p-4 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search creators..."
            className="w-full bg-[#181822] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Quality Score */}
        <div className="relative">
          <select
            value={qualityScore}
            onChange={(e) => {
              setQualityScore(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#181822] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Quality Scores</option>
            <option value="HIGH">High Quality</option>
            <option value="MEDIUM">Medium Quality</option>
            <option value="LOW">Low Quality</option>
          </select>
        </div>

        {/* Outreach Status */}
        <div className="relative">
          <select
            value={outreachStatus}
            onChange={(e) => {
              setOutreachStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#181822] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Pipeline Statuses</option>
            <option value="NOT_CONTACTED">Not Contacted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REPLIED">Replied</option>
            <option value="CLOSED">Closed / Work Secured</option>
          </select>
        </div>

        {/* Platform */}
        <div className="relative">
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#181822] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="INSTAGRAM">Instagram</option>
          </select>
        </div>
      </div>

      {/* Main leads content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="glass p-16 rounded-xl border border-white/5 text-center flex-1 flex flex-col justify-center items-center">
          <p className="text-slate-400 font-semibold mb-2">No matching leads found</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* Table wrapper */}
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold h-11 bg-white/5 select-none px-6">
                  <th className="px-6">Creator Info</th>
                  <th>Subscribers</th>
                  <th>Avg Views</th>
                  <th>Upload Schedule</th>
                  <th>Quality Score</th>
                  <th>Outreach Status</th>
                  <th className="text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setEmailText('');
                    }}
                    className="border-b border-white/5 h-14 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Creator Info */}
                    <td className="px-6 font-semibold text-slate-200">
                      <div>
                        <span className="group-hover:text-indigo-400 transition-colors">{lead.name}</span>
                        <div className="flex items-center gap-1.5 mt-1 font-normal text-[10px] text-slate-400">
                          <span>{lead.platform}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{lead.email || 'No email found'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Subscribers */}
                    <td className="text-slate-300">{(lead.subscriberCount / 1000).toFixed(0)}k</td>

                    {/* Avg Views */}
                    <td className="text-slate-300">{lead.averageViews.toLocaleString()}</td>

                    {/* Upload schedule */}
                    <td className="text-slate-300">{lead.uploadFrequency.toFixed(1)} vids/wk</td>

                    {/* Quality Score */}
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[9px] ${
                          lead.qualityScore === 'HIGH'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : lead.qualityScore === 'MEDIUM'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        }`}
                      >
                        {lead.qualityScore === 'HIGH' && <Sparkles className="w-2.5 h-2.5" />}
                        {lead.qualityScore}
                      </span>
                    </td>

                    {/* Outreach Status */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.outreachStatus}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className="bg-[#181822] border border-white/5 rounded px-2.5 py-1 text-[10px] text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="NOT_CONTACTED">Not Contacted</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="REPLIED">Replied</option>
                        <option value="CLOSED">Closed / Secured</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setEmailText('');
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Generate Pitch
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs mt-4">
            <span className="text-slate-400">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} leads total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 bg-[#181822] hover:bg-[#20202d] border border-white/5 text-slate-300 rounded-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-[#181822] hover:bg-[#20202d] border border-white/5 text-slate-300 rounded-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide drawer for Lead Details */}
      {selectedLead && (
        <div className="fixed inset-0 z-30 flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSelectedLead(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Side Drawer Body */}
          <div className="relative w-full max-w-xl bg-[#0f0f13] border-l border-white/5 h-full flex flex-col z-10 shadow-2xl p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {selectedLead.platform} Lead
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedLead.name}</h2>
                <a
                  href={selectedLead.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 font-medium"
                >
                  Visit Channel <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Score Reason Callout */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Scorer Assessment</span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      selectedLead.qualityScore === 'HIGH'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : selectedLead.qualityScore === 'MEDIUM'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {selectedLead.qualityScore} Score
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{selectedLead.scoreReason}</p>
              </div>

              {/* Lead Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Subscribers', value: `${(selectedLead.subscriberCount / 1000).toFixed(0)}k` },
                  { label: 'Avg Views', value: selectedLead.averageViews.toLocaleString() },
                  { label: 'Upload Frequency', value: `${selectedLead.uploadFrequency.toFixed(1)} vids/wk` },
                ].map((metric) => (
                  <div key={metric.label} className="bg-[#181822] border border-white/5 rounded-lg p-3 text-center">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <span className="block text-sm font-bold text-slate-200 mt-1">{metric.value}</span>
                  </div>
                ))}
              </div>

              {/* Email contact row */}
              <div className="bg-[#181822] border border-white/5 rounded-lg p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                    {selectedLead.email || 'No email available'}
                  </span>
                </div>
                {selectedLead.email && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLead.email);
                      alert('Email copied to clipboard!');
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase cursor-pointer"
                  >
                    Copy
                  </button>
                )}
              </div>

              {/* Generate Cold Email Panel */}
              <div className="border border-white/5 rounded-xl p-4 space-y-4 bg-indigo-500/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Cold Outreach Pitch</h3>
                  </div>
                  {!emailText && !generatingEmail && (
                    <button
                      id="generate-pitch-btn"
                      onClick={() => handleGenerateEmail(selectedLead.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] px-3 py-1 font-bold transition-colors cursor-pointer"
                    >
                      Generate Pitch
                    </button>
                  )}
                </div>

                {generatingEmail && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-[10px] text-slate-400">AI Outreach Assistant writing pitch...</span>
                  </div>
                )}

                {emailText && (
                  <div className="space-y-3">
                    <textarea
                      readOnly
                      value={emailText}
                      className="w-full bg-[#121217] border border-white/5 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none h-44 resize-y leading-normal"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Ready to send</span>
                      <button
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1.5 bg-[#181822] hover:bg-[#20202d] text-indigo-400 border border-white/5 rounded px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent videos list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Recent Content Uploads
                </h3>
                <div className="space-y-2.5">
                  {JSON.parse(selectedLead.recentVideos || '[]').map((video: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#181822] border border-white/5 rounded-lg p-3 flex justify-between items-center text-xs"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="font-semibold text-slate-200 truncate leading-relaxed">{video.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Upload: {new Date(video.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-bold text-slate-300">{video.views.toLocaleString()} views</span>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium mt-1"
                        >
                          Watch <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

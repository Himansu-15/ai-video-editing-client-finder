'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../lib/api';
import { Settings, Key, AlertCircle, ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [mockScraper, setMockScraper] = useState(true);
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch settings
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  // Sync state with fetched settings
  useEffect(() => {
    if (data?.settings) {
      setMockScraper(data.settings.mockScraper);
      setYoutubeApiKey(data.settings.youtubeApiKey || '');
      setOpenaiApiKey(data.settings.openaiApiKey || '');
      setEmailTemplate(data.settings.emailTemplate || '');
    }
  }, [data]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: any) => settingsApi.update(payload),
    onSuccess: (resData) => {
      setSuccessMsg('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to save settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      mockScraper,
      youtubeApiKey: youtubeApiKey || null,
      openaiApiKey: openaiApiKey || null,
      emailTemplate: emailTemplate || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your API integration keys and email preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Engine Toggle Settings */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            Scraper Engine Configuration
          </h2>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div>
              <p className="text-xs font-semibold text-slate-200">Enable Mock Scraper Mode</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-md">
                Uses local simulated search parameters to crawl leads. This avoids hitting Google API limits
                or getting blocked by CAPTCHAs during testing. Recommended for local evaluation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMockScraper(!mockScraper)}
              className="text-slate-300 focus:outline-none cursor-pointer"
            >
              {mockScraper ? (
                <ToggleRight className="w-12 h-12 text-indigo-500" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Keys config */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-indigo-400" /> API Credentials
          </h2>

          {/* YouTube API */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              YouTube Data API Key (v3)
            </label>
            <input
              type="password"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder={data?.settings?.hasYoutubeKey ? '••••••••••••••••••••' : 'Enter YouTube API Key'}
              className="w-full bg-[#181822] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
              Required for fetching live YouTube statistics if Mock Scraper Mode is disabled.
            </p>
          </div>

          {/* OpenAI API */}
          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder={data?.settings?.hasOpenaiKey ? '••••••••••••••••••••' : 'Enter OpenAI API Key'}
              className="w-full bg-[#181822] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
              Used to perform AI-based quality analysis of channels and write highly custom cold outreach email pitches.
            </p>
          </div>
        </div>

        {/* Custom Email Pitch Templates */}
        <div className="glass p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            Outreach Default Template
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pitch Layout Description / Pitch Instruction Hook
            </label>
            <textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="e.g. Keep emails short and under 150 words. Focus on retention, offer a free trial edit, and ask them for a brief review..."
              className="w-full bg-[#181822] border border-white/5 rounded-lg p-3 text-xs text-slate-300 focus:outline-none h-28 resize-y leading-normal"
            />
            <p className="text-[9px] text-slate-500 mt-1">
              Provide instructions to customize the AI's email generation style when pitching creator leads.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          id="settings-save-submit"
          type="submit"
          disabled={updateSettingsMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 py-2.5 font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}

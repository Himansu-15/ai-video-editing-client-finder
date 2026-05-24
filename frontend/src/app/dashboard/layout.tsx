'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import {
  LayoutDashboard,
  Search,
  Users,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
  Loader2,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevents flashing content while redirecting
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lead Finder', href: '/dashboard/finder', icon: Search },
    { name: 'Leads Database', href: '/dashboard/leads', icon: Users },
    { name: 'Search History', href: '/dashboard/history', icon: History },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ name: 'Admin Hub', href: '/dashboard/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0c]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0f0f13] border-b border-white/5 relative z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
            VF
          </div>
          <span className="font-semibold text-slate-200 tracking-tight text-sm">VideoFinder AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-20 w-64 bg-[#0f0f13] border-r border-white/5 flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out md:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-screen`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="hidden md:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              VF
            </div>
            <span className="font-semibold text-slate-100 tracking-tight">VideoFinder AI</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
            {user.role === 'ADMIN' && (
              <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 p-6 md:p-10 relative z-10 flex flex-col">
        {children}
      </main>

      {/* Background overlay on mobile when sidebar open */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
        />
      )}
    </div>
  );
}

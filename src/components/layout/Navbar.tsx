import React, { useState } from 'react';
import { sounds } from '../../utils/soundManager';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onPlayRandom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onPlayRandom }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());

  const handleMuteToggle = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const navItems = [
    { id: 'home', label: 'All Games' },
    { id: 'stats', label: 'Leaderboard' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single element wordmark */}
        <button
          onClick={() => {
            sounds.playClick();
            onNavigate('home');
          }}
          className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span>
            MY <span className="text-cyan-400">ARCADE</span>
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onNavigate(item.id);
              }}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === item.id ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (+ sound button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              handleMuteToggle();
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? (
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onPlayRandom();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            🎲 Quick Play
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs text-slate-400 px-3">
            <button onClick={() => { onNavigate('privacy'); setMobileMenuOpen(false); }}>Privacy</button>
            <button onClick={() => { onNavigate('terms'); setMobileMenuOpen(false); }}>Terms</button>
            <button onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}>Contact</button>
          </div>
        </div>
      )}
    </header>
  );
};

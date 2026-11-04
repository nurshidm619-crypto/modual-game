import React from 'react';
import { AdSlot } from '../ads/AdSlot';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 mt-16 pt-10 pb-12">
      {/* Top Banner AdSlot on footer */}
      <AdSlot slot="leaderboard-top" className="mb-8" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xl font-black font-display text-white flex items-center gap-2">
              <span>MY <span className="text-cyan-400">ARCADE</span></span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Free, browser-native 10 mini-game arcade platform powered by HTML5 Canvas and modern Web Audio APIs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
              All Games
            </button>
            <button onClick={() => onNavigate('stats')} className="hover:text-cyan-400 transition-colors">
              Leaderboard & Stats
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors">
              About
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors">
              Contact
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} MY ARCADE. All rights reserved. Zero downloads required.
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>AdSense Monetization Ready</span>
            <span aria-hidden="true">·</span>
            <span>Non-Intrusive Layout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

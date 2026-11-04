import React from 'react';

interface AdSlotProps {
  slot: 'leaderboard-top' | 'sidebar-display' | 'game-over-banner' | 'in-feed';
  className?: string;
}

/**
 * Ethically reserved advertisement slot designed for standard Google AdSense units.
 * Features strict disclaimer labels, safe non-interactive bounds, and zero deceptive practices.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ slot, className = '' }) => {
  if (slot === 'leaderboard-top') {
    return (
      <div className={`w-full max-w-5xl mx-auto my-4 px-4 ${className}`}>
        <div className="border border-dashed border-slate-700/80 bg-slate-900/60 rounded-xl p-3 text-center flex flex-col items-center justify-center min-h-[90px]">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1">
            Sponsored Advertisement · 728×90 Leaderboard Slot
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>AdSense Ready Container</span>
            <span aria-hidden="true">·</span>
            <span>Unobtrusive Placement Outside Gameplay</span>
          </div>
        </div>
      </div>
    );
  }

  if (slot === 'sidebar-display') {
    return (
      <div className={`w-full ${className}`}>
        <div className="border border-dashed border-slate-700/80 bg-slate-900/60 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[250px]">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
            Sponsored Ad · 300×250 Medium Rectangle
          </span>
          <div className="w-16 h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xs text-slate-400 max-w-[200px]">
            Reserved display ad container. Will render approved sponsor or AdSense creative.
          </p>
        </div>
      </div>
    );
  }

  if (slot === 'game-over-banner') {
    return (
      <div className={`w-full my-3 ${className}`}>
        <div className="border border-dashed border-slate-700 bg-slate-900/70 rounded-xl p-3 text-center flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1">
            Advertisement Space · Post-Game Summary
          </span>
          <p className="text-xs text-slate-400">
            Compliant sponsor unit · Does not obscure replay or high-score actions.
          </p>
        </div>
      </div>
    );
  }

  // in-feed slot
  return (
    <div className={`border border-dashed border-slate-800 bg-slate-900/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[220px] ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
        Reserved In-Feed Ad Unit
      </span>
      <p className="text-xs text-slate-400 max-w-xs">
        Standard responsive IAB ad display unit for certified brand sponsors.
      </p>
    </div>
  );
};

import React from 'react';

interface AboutPageProps {
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onSelectGame }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Arcade Home
      </button>

      <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-6 md:p-10 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            About MY ARCADE
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mt-1">
            Pure Instant Web Arcade Gaming
          </h1>
          <p className="text-base text-slate-300 mt-3 leading-relaxed">
            MY ARCADE was founded on a simple principle: classic browser gaming should be lightning-fast, free, respectful of user privacy, and built with modern web technologies that perform flawlessly across both desktop mice and mobile touchscreens.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-2">
          <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-xl">
            <h3 className="text-base font-semibold text-white mb-2">Zero Downloads</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every mini-game runs natively in your browser using pure HTML5 Canvas and Web Audio APIs. No plugins, no installers, no bloat.
            </p>
          </div>
          <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-xl">
            <h3 className="text-base font-semibold text-white mb-2">Offline-Ready Scores</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your high scores, streak records, and game history stay strictly on your device via secure HTML5 LocalStorage.
            </p>
          </div>
          <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-xl">
            <h3 className="text-base font-semibold text-white mb-2">Ethical Monetization</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We never obscure gameplay controls with deceptive click traps, pop-unders, or intrusive audio. Ads are strictly non-disruptive.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-xl font-bold font-display text-white mb-3">Our 10 Mini-Games Roster</h2>
          <p className="text-sm text-slate-300 mb-4">
            From reflex twitch-testing to brain-bending block logic, our hand-crafted suite tests every spectrum of arcade mastery:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { id: 'fruit-slice', name: 'Fruit Slice', desc: 'Ninja slash combos and bomb avoidance' },
              { id: 'bubble-pop', name: 'Bubble Pop', desc: 'Cluster popping and chain cascades' },
              { id: 'brick-breaker', name: 'Brick Breaker', desc: 'Arkanoid paddle angles and laser drops' },
              { id: 'space-dodge', name: 'Space Dodge', desc: 'High-speed cosmic obstacle navigation' },
              { id: 'memory-match', name: 'Memory Match', desc: 'Visual retention under a ticking clock' },
              { id: 'color-rush', name: 'Color Rush', desc: 'Stroop cognitive interference challenge' },
              { id: 'number-puzzle', name: 'Number Puzzle', desc: 'Strategic tile merge mathematics' },
              { id: 'tap-challenge', name: 'Tap Challenge', desc: 'High CPS and speed target accuracy' },
              { id: 'block-puzzle', name: 'Block Puzzle', desc: 'Geometric spatial clearing matrix' },
              { id: 'quick-reflex', name: 'Quick Reflex', desc: 'Sub-millisecond nervous system benchmark' },
            ].map((game) => (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className="text-left p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/50 transition-all group"
              >
                <div className="font-semibold text-cyan-300 group-hover:text-cyan-200">
                  {game.name} &rarr;
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{game.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

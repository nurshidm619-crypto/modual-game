import React from 'react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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

      <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-6 md:p-10 space-y-6 text-slate-300 text-sm leading-relaxed">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            Legal Terms
          </span>
          <h1 className="text-3xl font-bold font-display text-white mt-1">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: November 2026
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or playing games on MY ARCADE, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you should cease use of the platform immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Free Entertainment License</h2>
          <p>
            MY ARCADE grants you a revocable, non-exclusive, non-transferable, limited personal license to play, stream, and interact with the provided games for non-commercial personal entertainment purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Fair Play & Prohibited Conduct</h2>
          <p>
            Users agree not to exploit glitches, inject unauthorized memory modifications, run bot automation scripts to artificially inflate high scores, or tamper with the client-side code to harm server infrastructure or other players.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Intellectual Property</h2>
          <p>
            The game code, audio synthesizers, graphical assets, branding, and compilation of games on MY ARCADE are protected by copyright and intellectual property legislation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. MY ARCADE does not guarantee uninterrupted or error-free gameplay.
          </p>
        </section>
      </div>
    </div>
  );
};

import React from 'react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
            Compliance & Transparency
          </span>
          <h1 className="text-3xl font-bold font-display text-white mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Effective Date: November 2026 · Version 1.4
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. Information We Do Not Collect</h2>
          <p>
            MY ARCADE is engineered with privacy-first principles. We do not require registration, passwords, email addresses, credit cards, or phone numbers to enjoy our catalog of games. All games are instantly playable without account creation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. LocalStorage & Offline Data</h2>
          <p>
            Your gameplay data—including high scores, streak records, audio preferences (mute/unmute), and favorite games—is stored exclusively on your device via standard HTML5 LocalStorage. This data never leaves your browser and can be reset by you at any time via your browser settings or our platform reset utility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Cookies & Advertising Partners</h2>
          <p>
            To keep MY ARCADE free for everyone around the world, we work with advertising partners, including future Google AdSense integrations, to display non-intrusive advertisements. Third-party vendors may use cookies or web beacons to serve ads based on prior visits to this website or other internet sites.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting Google Ads Settings or www.aboutads.info. We commit never to deploy invasive tracking pixels, crypto-miners, or deceptive click redirects.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Children’s Privacy (COPPA Compliance)</h2>
          <p>
            MY ARCADE offers family-friendly arcade games and does not knowingly collect personally identifiable information from children under the age of 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Contacting the Data Controller</h2>
          <p>
            If you have any questions or feedback regarding our privacy practices, please contact us via our Contact form or email at privacy@myarcade.games.
          </p>
        </section>
      </div>
    </div>
  );
};

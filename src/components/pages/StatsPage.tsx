import React, { useState } from 'react';
import { GAMES } from '../../data/games';
import { getHighScores, getGameHistory, clearAllGameData, GameHistoryItem, getPlayCount } from '../../utils/storage';

interface StatsPageProps {
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBack, onSelectGame }) => {
  const [highScores, setHighScores] = useState<Record<string, number>>(getHighScores());
  const [history, setHistory] = useState<GameHistoryItem[]>(getGameHistory());
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    clearAllGameData();
    setHighScores({});
    setHistory([]);
    setResetConfirm(false);
  };

  const totalPoints = Object.values(highScores).reduce((acc, val) => acc + val, 0);
  const gamesPlayedCount = history.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Arcade Home
        </button>

        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Reset High Scores
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-rose-300 font-medium">Reset all records?</span>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Career Score</div>
          <div className="text-3xl font-bold font-display text-cyan-400 mt-1 tabular-nums">
            {totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Combined top records</div>
        </div>

        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Sessions Recorded</div>
          <div className="text-3xl font-bold font-display text-fuchsia-400 mt-1 tabular-nums">
            {gamesPlayedCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Last 40 logged plays</div>
        </div>

        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Unlocked Games</div>
          <div className="text-3xl font-bold font-display text-emerald-400 mt-1 tabular-nums">
            {Object.keys(highScores).length} / {GAMES.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Games with established high score</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* High Scores Leaderboard */}
        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-6">
          <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center justify-between">
            <span>Personal Best Records</span>
            <span className="text-xs font-normal text-slate-400">10 Mini-Games</span>
          </h2>
          <div className="divide-y divide-slate-800/80">
            {GAMES.map((game, idx) => {
              const score = highScores[game.id] || 0;
              const playCount = getPlayCount(game.id);
              return (
                <div key={game.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">{game.title}</div>
                      <div className="text-xs text-slate-400">
                        {game.category} · {playCount > 0 ? `${playCount} ${playCount === 1 ? 'play' : 'plays'}` : 'Unplayed'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-bold text-cyan-300 font-display tabular-nums">
                        {score > 0 ? score.toLocaleString() : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400">BEST SCORE</div>
                    </div>

                    <button
                      onClick={() => onSelectGame(game.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                    >
                      Play
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Game History */}
        <div className="border border-slate-800 bg-slate-900/70 rounded-2xl p-6">
          <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center justify-between">
            <span>Recent Match History</span>
            <span className="text-xs font-normal text-slate-400">Local Timeline</span>
          </h2>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No games played yet! Jump into any mini-game to start tracking your records.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{item.gameTitle}</div>
                    <div className="text-slate-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {item.durationSeconds}s duration
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">
                      +{item.score.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

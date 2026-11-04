import React, { useState, useEffect } from 'react';
import { GameDefinition } from '../../data/games';
import { getHighScore, saveHighScore, recordGameSession } from '../../utils/storage';
import { sounds } from '../../utils/soundManager';
import { AdSlot } from '../ads/AdSlot';

interface GameWrapperProps {
  game: GameDefinition;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  lives?: number;
  maxLives?: number;
  timeRemaining?: number; // In seconds, optional
  customStats?: { label: string; value: string | number }[];
  onPauseToggle: () => void;
  onRestart: () => void;
  onExit: () => void;
  children: React.ReactNode;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({
  game,
  score,
  isGameOver,
  isPaused,
  lives,
  maxLives = 3,
  timeRemaining,
  customStats,
  onPauseToggle,
  onRestart,
  onExit,
  children,
}) => {
  const [highScore, setHighScore] = useState<number>(() => getHighScore(game.id));
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (isGameOver) {
      const isRecord = saveHighScore(game.id, score);
      if (isRecord) {
        setIsNewHigh(true);
        setHighScore(score);
        sounds.playWin();
      } else {
        sounds.playGameOver();
      }
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      recordGameSession({
        gameId: game.id,
        gameTitle: game.title,
        score,
        durationSeconds,
      });
    }
  }, [isGameOver, score, game.id, game.title, sessionStartTime]);

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 flex flex-col items-center">
      {/* Top Header Controls & Metrics */}
      <div className="w-full border border-slate-800 bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                onExit();
              }}
              title="Exit to lobby"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
                {game.title}
              </h1>
              <div className="text-xs text-slate-400">
                {game.category} <span aria-hidden="true">·</span> High Score: {highScore.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Center: Live Score & Timer/Lives */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Score</div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-display tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>

            {typeof timeRemaining === 'number' && (
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Time</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 font-display tabular-nums">
                  {Math.max(0, timeRemaining)}s
                </div>
              </div>
            )}

            {typeof lives === 'number' && (
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Lives</div>
                <div className="flex items-center gap-1 justify-center mt-1">
                  {Array.from({ length: maxLives }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i < lives ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls (Pause, Sound, Restart) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                handleToggleMute();
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onPauseToggle();
              }}
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isPaused ? (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onRestart();
              }}
              title="Restart Game"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Arena Container */}
      <div className="relative w-full border border-slate-800/80 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[460px] md:min-h-[540px]">
        {children}

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="border border-cyan-500/30 bg-slate-900/90 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h2 className="text-2xl font-bold font-display text-white mb-2">Game Paused</h2>
              <p className="text-xs text-slate-400 mb-6">
                Take a breath! Press Resume or hit Spacebar to continue.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onPauseToggle();
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
                >
                  Resume Game
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onRestart();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onExit();
                  }}
                  className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
                >
                  Back to Arcade Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center animate-fade-in overflow-y-auto">
            <div className="border border-slate-800 bg-slate-900/95 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-auto">
              {isNewHigh ? (
                <div className="mb-4">
                  <span className="text-xs font-bold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    New Personal Best!
                  </span>
                  <h2 className="text-3xl font-extrabold font-display text-white mt-2">
                    Record Smashed!
                  </h2>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                    Run Concluded
                  </span>
                  <h2 className="text-3xl font-extrabold font-display text-white mt-1">
                    Game Over
                  </h2>
                </div>
              )}

              <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-4 my-4 flex items-center justify-around">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Final Score</div>
                  <div className="text-3xl font-bold font-display text-cyan-400 tabular-nums">
                    {score.toLocaleString()}
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-800" />
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Best Score</div>
                  <div className="text-3xl font-bold font-display text-amber-400 tabular-nums">
                    {highScore.toLocaleString()}
                  </div>
                </div>
              </div>

              {customStats && customStats.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  {customStats.map((st, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/60 border border-slate-800 text-left">
                      <div className="text-slate-400">{st.label}</div>
                      <div className="font-bold text-white text-sm">{st.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ethical, non-obtrusive Ad Slot */}
              <AdSlot slot="game-over-banner" />

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onRestart();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onExit();
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
                >
                  Arcade Lobby
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control hints footer */}
      <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Desktop:</span>
          <span>{game.controls.desktop}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Mobile:</span>
          <span>{game.controls.mobile}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface QuickReflexGameProps {
  game: GameDefinition;
  onExit: () => void;
}

type RoundState = 'IDLE' | 'WAITING' | 'CLICK_NOW' | 'FALSE_START' | 'ROUND_RESULT';

export const QuickReflexGame: React.FC<QuickReflexGameProps> = ({ game, onExit }) => {
  const [roundState, setRoundState] = useState<RoundState>('IDLE');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTimes, setRoundTimes] = useState<number[]>([]);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [testTimeLeft, setTestTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 60s benchmark session timer
  useEffect(() => {
    if (isPaused || isGameOver || testTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setTestTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, testTimeLeft]);

  const startNextRound = useCallback(() => {
    clearTimer();
    setRoundState('WAITING');

    const randomDelay = 1500 + Math.random() * 3000;
    timeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setRoundState('CLICK_NOW');
      sounds.playPop(880);
    }, randomDelay);
  }, []);

  const restartGame = useCallback(() => {
    clearTimer();
    setCurrentRound(1);
    setRoundTimes([]);
    setLastReactionMs(null);
    setScore(0);
    setTestTimeLeft(60);
    setIsGameOver(false);
    setIsPaused(false);
    setRoundState('IDLE');
  }, []);

  const handlePauseToggle = () => {
    if (!isPaused) {
      clearTimer();
      setIsPaused(true);
    } else {
      setIsPaused(false);
      if (roundState === 'WAITING') {
        startNextRound();
      }
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleUserTrigger = () => {
    if (isPaused || isGameOver) return;

    if (roundState === 'IDLE') {
      startNextRound();
    } else if (roundState === 'WAITING') {
      // FALSE START!
      clearTimer();
      sounds.playHit(150);
      setRoundState('FALSE_START');
    } else if (roundState === 'CLICK_NOW') {
      // SUCCESSFUL REACTION!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sounds.playScore();
      setLastReactionMs(elapsed);

      const nextTimes = [...roundTimes, elapsed];
      setRoundTimes(nextTimes);

      // Points formula: max(0, (550 - ms) * 4)
      const pts = Math.max(10, (550 - elapsed) * 4);
      setScore((s) => s + pts);

      if (currentRound >= 5) {
        // Complete match!
        setRoundState('ROUND_RESULT');
        setTimeout(() => {
          setIsGameOver(true);
        }, 800);
      } else {
        setRoundState('ROUND_RESULT');
      }
    } else if (roundState === 'FALSE_START' || roundState === 'ROUND_RESULT') {
      if (currentRound < 5) {
        setCurrentRound((r) => r + 1);
        startNextRound();
      }
    }
  };

  // Keyboard Spacebar trigger
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserTrigger();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [roundState, isPaused, isGameOver, currentRound]);

  const averageMs =
    roundTimes.length > 0
      ? Math.round(roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length)
      : 0;

  const getTier = (ms: number) => {
    if (ms === 0) return 'Testing...';
    if (ms < 200) return '⚡ LIGHTNING APEX';
    if (ms < 240) return '🔥 PRO ESPORTS';
    if (ms < 290) return '🎯 SHARP REFLEX';
    if (ms < 350) return '🛡️ CASUAL GAMER';
    return '🐢 SLUGGISH';
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={testTimeLeft}
      customStats={[
        { label: '5-Round Avg', value: averageMs > 0 ? `${averageMs} ms` : '—' },
        { label: 'Reflex Tier', value: getTier(averageMs) },
        { label: 'Rounds Done', value: `${roundTimes.length} / 5` },
      ]}
      onPauseToggle={handlePauseToggle}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-xl">
        {/* Round Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-2 rounded-full transition-colors ${
                idx < roundTimes.length
                  ? 'bg-emerald-500'
                  : idx === currentRound - 1
                  ? 'bg-cyan-500 animate-pulse'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Big Interactive Visual Target Pad */}
        <button
          onClick={handleUserTrigger}
          className={`w-full max-w-md h-72 sm:h-80 rounded-3xl border-4 transition-all duration-150 flex flex-col items-center justify-center p-6 text-center shadow-2xl select-none cursor-pointer ${
            roundState === 'IDLE'
              ? 'bg-slate-900 border-cyan-500/50 hover:border-cyan-400'
              : roundState === 'WAITING'
              ? 'bg-rose-950/80 border-rose-500 shadow-rose-500/30'
              : roundState === 'CLICK_NOW'
              ? 'bg-emerald-500 border-white shadow-emerald-500/50 scale-[1.02]'
              : roundState === 'FALSE_START'
              ? 'bg-amber-950/80 border-amber-500'
              : 'bg-slate-900 border-emerald-500'
          }`}
        >
          {roundState === 'IDLE' && (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl mb-3">
                ⚡
              </div>
              <h3 className="text-2xl font-bold font-display text-white">Click to Begin Test</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                When the screen turns green, click as fast as humanly possible.
              </p>
            </>
          )}

          {roundState === 'WAITING' && (
            <>
              <div className="w-4 h-4 rounded-full bg-rose-500 animate-ping mb-4" />
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-rose-200">
                WAIT FOR GREEN...
              </h3>
              <p className="text-xs text-rose-300/80 mt-2">Do not click yet or it's a false start!</p>
            </>
          )}

          {roundState === 'CLICK_NOW' && (
            <>
              <h3 className="text-4xl sm:text-5xl font-black font-display text-slate-950 animate-bounce">
                CLICK NOW!
              </h3>
              <p className="text-sm font-bold text-slate-900 mt-2">TAP ANYWHERE!</p>
            </>
          )}

          {roundState === 'FALSE_START' && (
            <>
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="text-2xl font-bold font-display text-amber-300">FALSE START!</h3>
              <p className="text-xs text-slate-300 mt-1">You clicked before it turned green.</p>
              <span className="mt-4 px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold">
                Click to Try Round {currentRound} Again
              </span>
            </>
          )}

          {roundState === 'ROUND_RESULT' && (
            <>
              <span className="text-xs uppercase text-slate-400 font-medium">Round {currentRound} Speed</span>
              <div className="text-5xl font-extrabold font-display text-emerald-400 my-2 tabular-nums">
                {lastReactionMs} <span className="text-lg font-normal text-slate-400">ms</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">{getTier(lastReactionMs || 0)}</p>
              {currentRound < 5 && (
                <span className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700">
                  Click to Proceed to Round {currentRound + 1} &rarr;
                </span>
              )}
            </>
          )}
        </button>

        {/* History of Rounds */}
        {roundTimes.length > 0 && (
          <div className="mt-4 flex items-center gap-3 text-xs">
            {roundTimes.map((t, i) => (
              <div key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                R{i + 1}: <span className="text-cyan-400 font-bold">{t}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameWrapper>
  );
};

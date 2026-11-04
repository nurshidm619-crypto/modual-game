import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface TapChallengeGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface TargetItem {
  id: number;
  index: number;
  type: 'bonus' | 'hazard' | 'normal';
  expiresAt: number;
}

export const TapChallengeGame: React.FC<TapChallengeGameProps> = ({ game, onExit }) => {
  const [subMode, setSubMode] = useState<'cps' | 'targets'>('cps');
  const [score, setScore] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCps, setCurrentCps] = useState(0);
  const [peakCps, setPeakCps] = useState(0);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const tapTimesRef = useRef<number[]>([]);

  const restartGame = useCallback(() => {
    setScore(0);
    setTapCount(0);
    setTimeLeft(subMode === 'cps' ? 10 : 25);
    setIsStarted(false);
    setIsGameOver(false);
    setIsPaused(false);
    setCurrentCps(0);
    setPeakCps(0);
    setTargets([]);
    tapTimesRef.current = [];
  }, [subMode]);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isPaused || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isPaused, isGameOver]);

  // Target spawning loop for 'targets' mode
  useEffect(() => {
    if (subMode !== 'targets' || !isStarted || isPaused || isGameOver) return;

    const interval = setInterval(() => {
      setTargets((prev) => {
        const now = Date.now();
        const active = prev.filter((t) => t.expiresAt > now);
        if (active.length < 3) {
          const usedIndices = new Set(active.map((t) => t.index));
          const available: number[] = [];
          for (let i = 0; i < 16; i++) {
            if (!usedIndices.has(i)) available.push(i);
          }
          if (available.length > 0) {
            const chosen = available[Math.floor(Math.random() * available.length)];
            const isHazard = Math.random() < 0.2;
            const isBonus = Math.random() < 0.15;
            active.push({
              id: Math.random(),
              index: chosen,
              type: isHazard ? 'hazard' : isBonus ? 'bonus' : 'normal',
              expiresAt: now + (isBonus ? 1300 : 1800),
            });
          }
        }
        return active;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [subMode, isStarted, isPaused, isGameOver]);

  // Handle CPS Frenzy Tap
  const handleCpsTap = () => {
    if (isPaused || isGameOver) return;
    if (!isStarted) setIsStarted(true);

    const now = Date.now();
    tapTimesRef.current.push(now);

    // Filter taps in last 1000ms
    const recent = tapTimesRef.current.filter((t) => now - t <= 1000);
    tapTimesRef.current = recent;

    const cps = recent.length;
    setCurrentCps(cps);
    if (cps > peakCps) setPeakCps(cps);

    sounds.playPop(450 + Math.min(600, cps * 40));

    setTapCount((prev) => prev + 1);
    setScore((prev) => prev + 10 + cps * 2);
  };

  // Handle Target Mode Tap
  const handleTargetClick = (target: TargetItem) => {
    if (!isStarted) setIsStarted(true);
    if (isPaused || isGameOver) return;

    if (target.type === 'hazard') {
      sounds.playHit(180);
      setScore((s) => Math.max(0, s - 100));
    } else if (target.type === 'bonus') {
      sounds.playScore();
      setScore((s) => s + 200);
      setTapCount((t) => t + 1);
    } else {
      sounds.playPop(650);
      setScore((s) => s + 50);
      setTapCount((t) => t + 1);
    }

    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  // Keyboard Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (subMode === 'cps') handleCpsTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subMode, isStarted, isPaused, isGameOver]);

  const cpsTier =
    peakCps >= 12
      ? '⚡ GODLIKE CYBERNETIC'
      : peakCps >= 9
      ? '🔥 PRO ESPORTS'
      : peakCps >= 6
      ? '🎯 AGILITY MASTER'
      : 'Novice Speed';

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={timeLeft}
      customStats={[
        { label: 'Total Taps', value: tapCount },
        { label: 'Peak CPS', value: `${peakCps} CPS` },
        { label: 'Speed Rank', value: cpsTier },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-lg">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSubMode('cps')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'cps'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10-Sec CPS Frenzy
          </button>
          <button
            onClick={() => setSubMode('targets')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subMode === 'targets'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reflex Whack-A-Disc
          </button>
        </div>

        {subMode === 'cps' ? (
          /* CPS Frenzy Arena */
          <div className="flex flex-col items-center w-full">
            {/* Speedometer display */}
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-[10px] uppercase text-slate-400 font-medium">Live Speed</div>
                <div className="text-3xl font-bold font-display text-rose-400 tabular-nums">
                  {currentCps} <span className="text-sm font-normal text-slate-400">CPS</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-slate-400 font-medium">Peak Rate</div>
                <div className="text-3xl font-bold font-display text-amber-400 tabular-nums">
                  {peakCps} <span className="text-sm font-normal text-slate-400">CPS</span>
                </div>
              </div>
            </div>

            {/* Huge Tap Button */}
            <button
              onPointerDown={handleCpsTap}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-rose-500/80 bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 active:scale-90 transition-transform shadow-2xl flex flex-col items-center justify-center text-white cursor-pointer select-none group"
              style={{
                boxShadow: '0 0 35px rgba(244, 63, 94, 0.45)',
              }}
            >
              <span className="text-3xl sm:text-4xl font-extrabold font-display group-hover:scale-105">
                {isStarted ? 'TAP!' : 'START!'}
              </span>
              <span className="text-xs text-rose-200 mt-1 font-medium">
                {isStarted ? `${tapCount} clicks` : 'Spacebar or Tap'}
              </span>
            </button>

            <div className="mt-4 text-xs font-semibold text-rose-300">
              Tier: {cpsTier}
            </div>
          </div>
        ) : (
          /* Target Whack Grid */
          <div className="w-full max-w-sm">
            {!isStarted && (
              <div className="text-center text-xs text-slate-300 mb-3 animate-pulse">
                Click any appearing target to ignite timer! Avoid red skull hazards.
              </div>
            )}
            <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-950 border-2 border-slate-800 rounded-2xl aspect-square">
              {Array.from({ length: 16 }).map((_, idx) => {
                const target = targets.find((t) => t.index === idx);
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-center relative overflow-hidden"
                  >
                    {target && (
                      <button
                        onClick={() => handleTargetClick(target)}
                        className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-lg transition-transform active:scale-90 ${
                          target.type === 'hazard'
                            ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-400'
                            : target.type === 'bonus'
                            ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 animate-pulse'
                            : 'bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300'
                        }`}
                      >
                        {target.type === 'hazard' ? '💀' : target.type === 'bonus' ? '⭐' : '🎯'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
};

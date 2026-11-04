import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface ColorRushGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
}

const COLOR_PALETTE: ColorOption[] = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#10b981' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
];

export const ColorRushGame: React.FC<ColorRushGameProps> = ({ game, onExit }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mode, setMode] = useState<'INK' | 'WORD'>('INK'); // Match ink or word
  const [wordText, setWordText] = useState('BLUE');
  const [inkColor, setInkColor] = useState('#ef4444');
  const [correctColorName, setCorrectColorName] = useState('RED');
  const [currentOptions, setCurrentOptions] = useState<ColorOption[]>([]);
  const [timeLeftMs, setTimeLeftMs] = useState(2500);
  const [maxTimeMs, setMaxTimeMs] = useState(2500);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const generateQuestion = useCallback((currStreak: number) => {
    const isInkMode = Math.random() < 0.65;
    const wordOption = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    let inkOption = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    // Make sure ink and word are often conflicting for authentic Stroop challenge
    if (inkOption.name === wordOption.name && Math.random() < 0.8) {
      const candidates = COLOR_PALETTE.filter((c) => c.name !== wordOption.name);
      inkOption = candidates[Math.floor(Math.random() * candidates.length)];
    }

    setMode(isInkMode ? 'INK' : 'WORD');
    setWordText(wordOption.name);
    setInkColor(inkOption.hex);

    const targetName = isInkMode ? inkOption.name : wordOption.name;
    setCorrectColorName(targetName);

    // Pick 4 options including target
    const targetObj = COLOR_PALETTE.find((c) => c.name === targetName)!;
    const others = COLOR_PALETTE.filter((c) => c.name !== targetName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const shuffledOptions = [targetObj, ...others].sort(() => Math.random() - 0.5);
    setCurrentOptions(shuffledOptions);

    // Dynamic timer based on streak
    const allotted = Math.max(1100, 2600 - currStreak * 70);
    setMaxTimeMs(allotted);
    setTimeLeftMs(allotted);
    lastTickRef.current = Date.now();
  }, []);

  const restartGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFeedback(null);
    generateQuestion(0);
  }, [generateQuestion]);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Main countdown timer loop
  useEffect(() => {
    if (isPaused || isGameOver) return;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setTimeLeftMs((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          sounds.playExplode();
          setIsGameOver(true);
          return 0;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  const handleChoice = (chosenName: string) => {
    if (isPaused || isGameOver) return;

    if (chosenName === correctColorName) {
      // Correct!
      sounds.playScore();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      const multiplier = nextStreak >= 10 ? 3 : nextStreak >= 5 ? 2 : 1;
      const pts = 50 * multiplier;
      setScore((s) => s + pts);

      setFeedback('correct');
      setTimeout(() => setFeedback(null), 250);
      generateQuestion(nextStreak);
    } else {
      // Wrong!
      sounds.playHit(160);
      setFeedback('wrong');
      setIsGameOver(true);
    }
  };

  // Keyboard shortcut listener (1-4 keys)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isPaused || isGameOver) return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx !== -1 && currentOptions[idx]) {
        handleChoice(currentOptions[idx].name);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentOptions, isPaused, isGameOver, correctColorName]);

  const timePct = Math.max(0, (timeLeftMs / maxTimeMs) * 100);

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={Math.ceil(timeLeftMs / 1000)}
      customStats={[
        { label: 'Current Streak', value: `${streak}x` },
        { label: 'Best Streak', value: `${bestStreak}x` },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-lg">
        {/* Countdown Fuse Bar */}
        <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-75 ${
              timePct > 40 ? 'bg-cyan-500' : timePct > 20 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Challenge Prompt Banner */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-1">
            {mode === 'INK' ? '🎨 SELECT THE INK COLOR' : '🔤 SELECT THE WRITTEN WORD'}
          </div>
          <div
            className={`text-6xl sm:text-7xl font-extrabold font-display tracking-wider py-4 select-none transition-transform ${
              feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'shake' : ''
            }`}
            style={{ color: inkColor, textShadow: `0 0 25px ${inkColor}88` }}
          >
            {wordText}
          </div>
        </div>

        {/* 4 Color Options Grid */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          {currentOptions.map((opt, idx) => (
            <button
              key={opt.name}
              onClick={() => handleChoice(opt.name)}
              className="py-4 px-4 rounded-2xl border-2 border-slate-700/80 bg-slate-900 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-between group shadow-lg"
              style={{ borderColor: opt.hex }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-sm"
                  style={{ backgroundColor: opt.hex }}
                />
                <span className="font-bold font-display text-white text-base sm:text-lg">
                  {opt.name}
                </span>
              </div>
              <span className="hidden sm:inline text-xs font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                [{idx + 1}]
              </span>
            </button>
          ))}
        </div>

        {/* Streak indicator */}
        <div className="mt-6 text-xs text-slate-400 text-center">
          Streak Multiplier: <span className="text-cyan-400 font-bold">{streak >= 10 ? '3x' : streak >= 5 ? '2x' : '1x'}</span> · Keyboard Keys: 1, 2, 3, 4
        </div>
      </div>
    </GameWrapper>
  );
};

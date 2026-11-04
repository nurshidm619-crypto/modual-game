import React, { useState, useEffect, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface MemoryMatchGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ARCADE_SYMBOLS = [
  { symbol: '🕹️', name: 'Joystick', color: '#06b6d4' },
  { symbol: '👾', name: 'Invader', color: '#a855f7' },
  { symbol: '🚀', name: 'Rocket', color: '#ec4899' },
  { symbol: '💎', name: 'Diamond', color: '#38bdf8' },
  { symbol: '👑', name: 'Crown', color: '#f59e0b' },
  { symbol: '⚡', name: 'Lightning', color: '#eab308' },
  { symbol: '🔥', name: 'Fire', color: '#f97316' },
  { symbol: '🪙', name: 'Coin', color: '#facc15' },
  { symbol: '⭐', name: 'Star', color: '#f43f5e' },
  { symbol: '🛡️', name: 'Shield', color: '#10b981' },
];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ game, onExit }) => {
  const [boardSize, setBoardSize] = useState<'4x4' | '3x4' | '4x5'>('4x4');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const initDeck = useCallback((size: '4x4' | '3x4' | '4x5') => {
    let pairCount = 8; // 4x4 default
    if (size === '3x4') pairCount = 6;
    if (size === '4x5') pairCount = 10;

    const chosenSymbols = [...ARCADE_SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck: CardItem[] = [];

    chosenSymbols.forEach((sym, idx) => {
      deck.push({
        id: idx * 2,
        symbol: sym.symbol,
        name: sym.name,
        color: sym.color,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 1,
        symbol: sym.symbol,
        name: sym.name,
        color: sym.color,
        isFlipped: false,
        isMatched: false,
      });
    });

    return deck.sort(() => Math.random() - 0.5);
  }, []);

  const restartGame = useCallback(() => {
    setCards(initDeck(boardSize));
    setFlippedIds([]);
    setScore(0);
    setMoves(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(boardSize === '3x4' ? 45 : boardSize === '4x4' ? 60 : 75);
    setIsGameOver(false);
    setIsPaused(false);
    setIsLocked(false);
  }, [boardSize, initDeck]);

  useEffect(() => {
    restartGame();
  }, [boardSize, restartGame]);

  // Countdown timer effect
  useEffect(() => {
    if (isPaused || isGameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isGameOver, timeLeft]);

  const handleCardClick = (cardId: number) => {
    if (isLocked || isPaused || isGameOver) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    sounds.playClick();

    // Flip the clicked card
    const nextFlipped = [...flippedIds, cardId];
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedIds(nextFlipped);

    // If 2 cards are flipped, check for match
    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = card;

      if (firstCard && firstCard.name === secondCard.name) {
        // MATCH!
        sounds.playPop(750);
        const currentStreak = streak + 1;
        setStreak(currentStreak);
        if (currentStreak > bestStreak) setBestStreak(currentStreak);

        const bonus = currentStreak * 50;
        const matchPoints = 100 + bonus;
        setScore((s) => s + matchPoints);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedIds([]);
          setIsLocked(false);

          // Check if all matched
          setCards((latest) => {
            const allMatched = latest.every(
              (c) => c.id === firstId || c.id === secondId || c.isMatched
            );
            if (allMatched) {
              const timeBonus = timeLeft * 30;
              setScore((s) => s + timeBonus);
              sounds.playWin();
              setIsGameOver(true);
            }
            return latest;
          });
        }, 350);
      } else {
        // MISMATCH
        sounds.playHit(220);
        setStreak(0);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setIsLocked(false);
        }, 750);
      }
    }
  };

  const gridColsClass =
    boardSize === '3x4' ? 'grid-cols-4' : boardSize === '4x4' ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={timeLeft}
      customStats={[
        { label: 'Total Moves', value: moves },
        { label: 'Best Streak', value: `${bestStreak}x` },
        { label: 'Grid Size', value: boardSize },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full">
        {/* Grid size difficulty selector */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['3x4', '4x4', '4x5'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setBoardSize(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                boardSize === size
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {size === '3x4' ? 'Casual (12)' : size === '4x4' ? 'Standard (16)' : 'Master (20)'}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div
          className={`grid ${gridColsClass} gap-2 sm:gap-3.5 max-w-lg w-full p-2`}
        >
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCardClick(c.id)}
              disabled={c.isFlipped || c.isMatched || isLocked || isPaused || isGameOver}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-300 relative border-2 ${
                c.isMatched
                  ? 'bg-slate-900/60 border-emerald-500/60 text-emerald-400 opacity-60 scale-95 shadow-sm'
                  : c.isFlipped
                  ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-100'
                  : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/80 hover:border-cyan-500 hover:scale-[1.02] cursor-pointer'
              }`}
            >
              {c.isFlipped || c.isMatched ? (
                <span>{c.symbol}</span>
              ) : (
                <div className="w-6 h-6 rounded-lg border border-slate-700 bg-slate-800/60 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-mono">?</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Streak banner */}
        {streak > 1 && (
          <div className="mt-3 text-xs font-bold text-amber-400 animate-pulse">
            🔥 {streak}x MATCH STREAK! (+{streak * 50} pts bonus)
          </div>
        )}
      </div>
    </GameWrapper>
  );
};

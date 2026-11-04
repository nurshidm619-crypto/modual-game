import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface NumberPuzzleGameProps {
  game: GameDefinition;
  onExit: () => void;
}

type Board = number[][];

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#1e293b', text: '#e2e8f0' },
  4: { bg: '#334155', text: '#f8fafc' },
  8: { bg: '#0284c7', text: '#ffffff' },
  16: { bg: '#0369a1', text: '#ffffff' },
  32: { bg: '#0d9488', text: '#ffffff' },
  64: { bg: '#059669', text: '#ffffff' },
  128: { bg: '#eab308', text: '#ffffff' },
  256: { bg: '#f59e0b', text: '#ffffff' },
  512: { bg: '#f97316', text: '#ffffff' },
  1024: { bg: '#ef4444', text: '#ffffff' },
  2048: { bg: '#a855f7', text: '#ffffff' },
  4096: { bg: '#ec4899', text: '#ffffff' },
};

export const NumberPuzzleGame: React.FC<NumberPuzzleGameProps> = ({ game, onExit }) => {
  const [board, setBoard] = useState<Board>(() => Array.from({ length: 4 }, () => Array(4).fill(0)));
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highestTile, setHighestTile] = useState(2);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    const next = currentBoard.map((row) => [...row]);
    next[r][c] = val;
    return next;
  };

  const restartGame = useCallback(() => {
    let fresh: Board = Array.from({ length: 4 }, () => Array(4).fill(0));
    fresh = addRandomTile(fresh);
    fresh = addRandomTile(fresh);
    setBoard(fresh);
    setPrevBoard(null);
    setScore(0);
    setPrevScore(0);
    setTimeLeft(180);
    setIsGameOver(false);
    setIsPaused(false);
    setHighestTile(2);
  }, []);

  // Timer loop
  useEffect(() => {
    if (isPaused || isGameOver || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sounds.playGameOver();
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, timeLeft]);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  const slideRow = (row: number[]): { newRow: number[]; earned: number } => {
    const filtered = row.filter((val) => val !== 0);
    let earned = 0;
    const merged: number[] = [];

    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
        const sum = filtered[i] * 2;
        merged.push(sum);
        earned += sum;
        i++; // skip merged neighbor
      } else {
        merged.push(filtered[i]);
      }
    }

    while (merged.length < 4) {
      merged.push(0);
    }
    return { newRow: merged, earned };
  };

  const move = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (isGameOver || isPaused) return;

      let changed = false;
      let addedScore = 0;
      let nextBoard: Board = board.map((r) => [...r]);

      if (direction === 'left') {
        for (let r = 0; r < 4; r++) {
          const { newRow, earned } = slideRow(nextBoard[r]);
          if (JSON.stringify(newRow) !== JSON.stringify(nextBoard[r])) changed = true;
          nextBoard[r] = newRow;
          addedScore += earned;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) {
          const reversed = [...nextBoard[r]].reverse();
          const { newRow, earned } = slideRow(reversed);
          const finalRow = newRow.reverse();
          if (JSON.stringify(finalRow) !== JSON.stringify(nextBoard[r])) changed = true;
          nextBoard[r] = finalRow;
          addedScore += earned;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = [nextBoard[0][c], nextBoard[1][c], nextBoard[2][c], nextBoard[3][c]];
          const { newRow, earned } = slideRow(col);
          for (let r = 0; r < 4; r++) {
            if (nextBoard[r][c] !== newRow[r]) changed = true;
            nextBoard[r][c] = newRow[r];
          }
          addedScore += earned;
        }
      } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = [nextBoard[3][c], nextBoard[2][c], nextBoard[1][c], nextBoard[0][c]];
          const { newRow, earned } = slideRow(col);
          const finalCol = newRow.reverse();
          for (let r = 0; r < 4; r++) {
            if (nextBoard[r][c] !== finalCol[r]) changed = true;
            nextBoard[r][c] = finalCol[r];
          }
          addedScore += earned;
        }
      }

      if (changed) {
        setPrevBoard(board);
        setPrevScore(score);
        sounds.playClick();
        if (addedScore > 0) sounds.playScore();

        const withNewTile = addRandomTile(nextBoard);
        setBoard(withNewTile);
        setScore((s) => s + addedScore);

        // Update highest tile
        let maxVal = highestTile;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (withNewTile[r][c] > maxVal) maxVal = withNewTile[r][c];
          }
        }
        setHighestTile(maxVal);

        if (checkGameOver(withNewTile)) {
          setIsGameOver(true);
        }
      }
    },
    [board, isGameOver, isPaused, highestTile, score]
  );

  const handleUndo = () => {
    if (prevBoard) {
      setBoard(prevBoard);
      setScore(prevScore);
      setPrevBoard(null);
      sounds.playPop(400);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        move('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const threshold = 35;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) move('right');
      else if (dx < -threshold) move('left');
    } else {
      if (dy > threshold) move('down');
      else if (dy < -threshold) move('up');
    }
    touchStartRef.current = null;
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={timeLeft}
      customStats={[
        { label: 'Highest Tile', value: highestTile },
        { label: 'Undo Available', value: prevBoard ? 'YES' : 'NO' },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full">
        {/* Undo Move Button */}
        <div className="flex justify-end w-full max-w-sm mb-3">
          <button
            onClick={handleUndo}
            disabled={!prevBoard}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
          >
            ↩ Undo Move
          </button>
        </div>

        {/* 2048 Grid */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="p-3 sm:p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-sm w-full aspect-square shadow-2xl"
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const theme = TILE_COLORS[val] || { bg: '#0f172a', text: '#ffffff' };
              return (
                <div
                  key={`${r}-${c}`}
                  className={`rounded-xl flex items-center justify-center font-bold font-display transition-all duration-150 select-none ${
                    val === 0 ? 'bg-slate-900/60' : 'shadow-md scale-100'
                  } ${
                    val >= 1024
                      ? 'text-lg sm:text-xl'
                      : val >= 128
                      ? 'text-xl sm:text-2xl'
                      : 'text-2xl sm:text-3xl'
                  }`}
                  style={{
                    backgroundColor: val > 0 ? theme.bg : undefined,
                    color: val > 0 ? theme.text : undefined,
                    boxShadow: val >= 128 ? `0 0 16px ${theme.bg}88` : undefined,
                  }}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })
          )}
        </div>

        {/* On-screen D-Pad for Mobile and Desktop click */}
        <div className="mt-4 grid grid-cols-3 gap-2 w-48 sm:hidden">
          <div />
          <button
            onClick={() => move('up')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-white active:bg-cyan-500/20 font-bold"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => move('left')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-white active:bg-cyan-500/20 font-bold"
          >
            ◀
          </button>
          <button
            onClick={() => move('down')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-white active:bg-cyan-500/20 font-bold"
          >
            ▼
          </button>
          <button
            onClick={() => move('right')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-white active:bg-cyan-500/20 font-bold"
          >
            ▶
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-400 text-center">
          Arrow Keys or Swipe to slide · Merge identical numbers to reach 2048!
        </div>
      </div>
    </GameWrapper>
  );
};

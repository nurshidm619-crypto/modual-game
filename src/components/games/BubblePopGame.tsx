import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface BubblePopGameProps {
  game: GameDefinition;
  onExit: () => void;
}

const COLORS = ['#06b6d4', '#d946ef', '#f59e0b', '#10b981', '#8b5cf6'];
const ROWS = 8;
const COLS = 8;

export const BubblePopGame: React.FC<BubblePopGameProps> = ({ game, onExit }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(800);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<{ r: number; c: number }[]>([]);
  const [floatingScore, setFloatingScore] = useState<{ x: number; y: number; text: string } | null>(null);
  const [popsTotal, setPopsTotal] = useState(0);

  const initGrid = useCallback(() => {
    const newGrid: string[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: string[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  const restartGame = useCallback(() => {
    setGrid(initGrid());
    setScore(0);
    setLevel(1);
    setTargetScore(800);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsPaused(false);
    setSelectedCluster([]);
    setPopsTotal(0);
  }, [initGrid]);

  // Stage countdown timer
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
    setGrid(initGrid());
  }, [initGrid]);

  // Find connected same-color bubbles
  const findCluster = (startR: number, startC: number, currentGrid: string[][]) => {
    const targetColor = currentGrid[startR][startC];
    if (!targetColor) return [];

    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const cluster: { r: number; c: number }[] = [];
    const queue: [number, number][] = [[startR, startC]];
    visited[startR][startC] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      cluster.push({ r, c });

      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 &&
          nr < ROWS &&
          nc >= 0 &&
          nc < COLS &&
          !visited[nr][nc] &&
          currentGrid[nr][nc] === targetColor
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return cluster;
  };

  const handleBubbleClick = (r: number, c: number, event: React.MouseEvent) => {
    if (isPaused || isGameOver || !grid[r] || !grid[r][c]) return;

    const cluster = findCluster(r, c, grid);
    if (cluster.length < 2) {
      // Single bubble cannot be popped
      sounds.playHit(200);
      return;
    }

    // Play pop audio with pitch scaling with cluster size
    sounds.playPop(500 + cluster.length * 35);

    // Calculate score: N^2 * 10
    const points = cluster.length * cluster.length * 10;
    const nextScore = score + points;
    setScore(nextScore);
    setPopsTotal((prev) => prev + cluster.length);

    // Show floating score
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setFloatingScore({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: `+${points} (${cluster.length}x)`,
    });
    setTimeout(() => setFloatingScore(null), 800);

    // Remove bubbles and apply gravity
    const newGrid = grid.map((row) => [...row]);
    cluster.forEach(({ r: cr, c: cc }) => {
      newGrid[cr][cc] = '';
    });

    // Bubble gravity: bubbles fall downward within each column
    for (let col = 0; col < COLS; col++) {
      let emptyRow = ROWS - 1;
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col] !== '') {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = newGrid[row][col];
            newGrid[row][col] = '';
          }
          emptyRow--;
        }
      }
    }

    // Shift columns to the left if entire column is empty
    for (let col = 0; col < COLS - 1; col++) {
      const isColEmpty = newGrid.every((row) => row[col] === '');
      if (isColEmpty) {
        // Find next non-empty column
        let nextNonEmpty = -1;
        for (let nextC = col + 1; nextC < COLS; nextC++) {
          if (newGrid.some((row) => row[nextC] !== '')) {
            nextNonEmpty = nextC;
            break;
          }
        }
        if (nextNonEmpty !== -1) {
          for (let r = 0; r < ROWS; r++) {
            newGrid[r][col] = newGrid[r][nextNonEmpty];
            newGrid[r][nextNonEmpty] = '';
          }
        }
      }
    }

    // Check if player cleared level or no moves left
    let hasValidMove = false;
    let remainingBubbles = 0;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (newGrid[row][col]) {
          remainingBubbles++;
          const cl = findCluster(row, col, newGrid);
          if (cl.length >= 2) {
            hasValidMove = true;
          }
        }
      }
    }

    setGrid(newGrid);

    // Check Level Progression
    if (nextScore >= targetScore || remainingBubbles === 0) {
      sounds.playWin();
      setLevel((prev) => prev + 1);
      setTargetScore((prev) => prev + 1200);
      setTimeLeft((prev) => prev + 25);
      setTimeout(() => {
        setGrid(initGrid());
      }, 500);
    } else if (!hasValidMove) {
      // Game over - no possible moves left!
      setIsGameOver(true);
    }
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={timeLeft}
      customStats={[
        { label: 'Current Level', value: `Stage ${level}` },
        { label: 'Bubbles Popped', value: popsTotal },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-4 w-full">
        {/* Level & Target progress bar */}
        <div className="w-full max-w-md mb-4 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
            <span>Stage {level} Target</span>
            <span>{score.toLocaleString()} / {targetScore.toLocaleString()} pts</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
            />
          </div>
        </div>

        {/* Bubble Grid */}
        <div className="relative border-2 border-slate-800 bg-slate-950/80 p-3 sm:p-4 rounded-2xl shadow-2xl">
          <div
            className="grid gap-2 sm:gap-2.5 select-none"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((color, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={(e) => handleBubbleClick(r, c, e)}
                  disabled={!color || isPaused || isGameOver}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-transform active:scale-90 flex items-center justify-center relative ${
                    color
                      ? 'cursor-pointer hover:scale-105 shadow-md'
                      : 'opacity-0 cursor-default pointer-events-none'
                  }`}
                  style={{
                    backgroundColor: color || 'transparent',
                    boxShadow: color ? `0 0 12px ${color}66` : 'none',
                  }}
                >
                  {color && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 absolute top-1.5 left-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Floating score indicator */}
          {floatingScore && (
            <div
              className="fixed pointer-events-none text-base font-bold text-cyan-300 animate-bounce font-display"
              style={{ left: floatingScore.x - 20, top: floatingScore.y - 30 }}
            >
              {floatingScore.text}
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-400 text-center">
          Tap adjacent clusters of 2 or more matching bubbles to pop. Larger clusters score huge points!
        </div>
      </div>
    </GameWrapper>
  );
};

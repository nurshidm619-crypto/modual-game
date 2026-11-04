import React, { useState, useEffect, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface BlockPuzzleGameProps {
  game: GameDefinition;
  onExit: () => void;
}

const GRID_SIZE = 8;

interface Piece {
  id: number;
  shape: number[][]; // 2D matrix of 1s and 0s
  color: string;
}

const SHAPES: { shape: number[][]; color: string }[] = [
  { shape: [[1]], color: '#06b6d4' }, // Single dot
  { shape: [[1, 1]], color: '#10b981' }, // 1x2 horizontal
  { shape: [[1], [1]], color: '#10b981' }, // 2x1 vertical
  { shape: [[1, 1, 1]], color: '#3b82f6' }, // 1x3 horizontal
  { shape: [[1], [1], [1]], color: '#3b82f6' }, // 3x1 vertical
  { shape: [[1, 1, 1, 1]], color: '#8b5cf6' }, // 1x4
  { shape: [[1], [1], [1], [1]], color: '#8b5cf6' }, // 4x1
  { shape: [[1, 1], [1, 1]], color: '#f59e0b' }, // 2x2
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#f43f5e' }, // 3x3
  { shape: [[1, 0], [1, 0], [1, 1]], color: '#d946ef' }, // L-shape
  { shape: [[0, 1], [0, 1], [1, 1]], color: '#d946ef' }, // Reverse L
  { shape: [[1, 1, 1], [0, 1, 0]], color: '#14b8a6' }, // T-shape
];

export const BlockPuzzleGame: React.FC<BlockPuzzleGameProps> = ({ game, onExit }) => {
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  );
  const [pieces, setPieces] = useState<(Piece | null)[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [linesClearedTotal, setLinesClearedTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const spawnPieces = useCallback(() => {
    const newPieces: Piece[] = [];
    for (let i = 0; i < 3; i++) {
      const template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      newPieces.push({
        id: Math.random(),
        shape: template.shape,
        color: template.color,
      });
    }
    return newPieces;
  }, []);

  const canPlacePiece = (piece: Piece, rStart: number, cStart: number, currentGrid: string[][]): boolean => {
    const pRows = piece.shape.length;
    const pCols = piece.shape[0].length;

    if (rStart + pRows > GRID_SIZE || cStart + pCols > GRID_SIZE) return false;

    for (let r = 0; r < pRows; r++) {
      for (let c = 0; c < pCols; c++) {
        if (piece.shape[r][c] === 1) {
          if (currentGrid[rStart + r][cStart + c] !== '') {
            return false;
          }
        }
      }
    }
    return true;
  };

  const hasAnyValidMove = (currentPieces: (Piece | null)[], currentGrid: string[][]): boolean => {
    for (const piece of currentPieces) {
      if (!piece) continue;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlacePiece(piece, r, c, currentGrid)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const restartGame = useCallback(() => {
    const emptyGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    setGrid(emptyGrid);
    const initial = spawnPieces();
    setPieces(initial);
    setSelectedPieceIndex(null);
    setScore(0);
    setLinesClearedTotal(0);
    setTimeLeft(120);
    setIsGameOver(false);
    setIsPaused(false);
  }, [spawnPieces]);

  // Round countdown timer
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

  const handlePlaceAt = (rStart: number, cStart: number) => {
    if (selectedPieceIndex === null || isPaused || isGameOver) return;
    const piece = pieces[selectedPieceIndex];
    if (!piece) return;

    if (!canPlacePiece(piece, rStart, cStart, grid)) {
      sounds.playHit(200);
      return;
    }

    sounds.playClick();

    // Place the piece
    const nextGrid = grid.map((row) => [...row]);
    let blocksPlaced = 0;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        if (piece.shape[r][c] === 1) {
          nextGrid[rStart + r][cStart + c] = piece.color;
          blocksPlaced++;
        }
      }
    }

    let pointsEarned = blocksPlaced * 10;

    // Check full rows and full columns
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (nextGrid[r].every((cell) => cell !== '')) {
        fullRows.push(r);
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let isColFull = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (nextGrid[r][c] === '') {
          isColFull = false;
          break;
        }
      }
      if (isColFull) fullCols.push(c);
    }

    // Clear completed lines
    if (fullRows.length > 0 || fullCols.length > 0) {
      sounds.playScore();
      const linesCleared = fullRows.length + fullCols.length;
      pointsEarned += linesCleared * linesCleared * 100;
      setLinesClearedTotal((prev) => prev + linesCleared);

      fullRows.forEach((r) => {
        for (let c = 0; c < GRID_SIZE; c++) {
          nextGrid[r][c] = '';
        }
      });

      fullCols.forEach((c) => {
        for (let r = 0; r < GRID_SIZE; r++) {
          nextGrid[r][c] = '';
        }
      });
    }

    setScore((s) => s + pointsEarned);

    // Consume piece from tray
    const nextPieces = [...pieces];
    nextPieces[selectedPieceIndex] = null;
    setSelectedPieceIndex(null);

    // Check if tray is empty -> spawn fresh 3 pieces
    let updatedPieces = nextPieces;
    if (nextPieces.every((p) => p === null)) {
      sounds.playPowerup();
      updatedPieces = spawnPieces();
    }

    setPieces(updatedPieces);
    setGrid(nextGrid);

    // Check if any move remains
    if (!hasAnyValidMove(updatedPieces, nextGrid)) {
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
        { label: 'Lines Cleared', value: linesClearedTotal },
        { label: 'Active Block', value: selectedPieceIndex !== null ? 'READY' : 'SELECT' },
      ]}
      onPauseToggle={() => setIsPaused(!isPaused)}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 w-full max-w-lg">
        {/* 8x8 Board */}
        <div className="p-2.5 sm:p-3 bg-slate-950 border-2 border-slate-800 rounded-2xl grid grid-cols-8 gap-1 sm:gap-1.5 w-full aspect-square max-w-sm shadow-2xl mb-4">
          {grid.map((row, r) =>
            row.map((cellColor, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handlePlaceAt(r, c)}
                className={`rounded-lg transition-colors border ${
                  cellColor
                    ? 'border-transparent shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 cursor-pointer'
                }`}
                style={{
                  backgroundColor: cellColor || undefined,
                  boxShadow: cellColor ? `0 0 10px ${cellColor}66` : undefined,
                }}
              />
            ))
          )}
        </div>

        {/* Piece Holding Tray (3 slots) */}
        <div className="w-full max-w-sm flex items-center justify-around gap-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          {pieces.map((piece, idx) => (
            <div key={idx} className="flex-1 flex items-center justify-center min-h-[70px]">
              {piece ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPieceIndex(idx);
                  }}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPieceIndex === idx
                      ? 'border-cyan-400 bg-cyan-950/40 scale-105 shadow-md shadow-cyan-500/20'
                      : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
                  }`}
                >
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))`,
                    }}
                  >
                    {piece.shape.map((pRow, pr) =>
                      pRow.map((val, pc) => (
                        <div
                          key={`${pr}-${pc}`}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded ${
                            val === 1 ? 'shadow-sm' : 'opacity-0'
                          }`}
                          style={{
                            backgroundColor: val === 1 ? piece.color : 'transparent',
                          }}
                        />
                      ))
                    )}
                  </div>
                </button>
              ) : (
                <div className="w-12 h-12 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-slate-400 text-center">
          Tap a block shape in the tray, then tap anywhere on the 8x8 grid to place it. Fill complete lines to shatter!
        </div>
      </div>
    </GameWrapper>
  );
};

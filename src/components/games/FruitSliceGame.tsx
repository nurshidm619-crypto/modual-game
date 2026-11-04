import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface FruitSliceGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface FruitItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'watermelon' | 'orange' | 'kiwi' | 'strawberry' | 'banana' | 'bomb';
  color: string;
  rotation: number;
  vRot: number;
  sliced: boolean;
  half1?: { x: number; y: number; vx: number; vy: number; rotation: number };
  half2?: { x: number; y: number; vx: number; vy: number; rotation: number };
}

interface SlashPoint {
  x: number;
  y: number;
  time: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export const FruitSliceGame: React.FC<FruitSliceGameProps> = ({ game, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fruitsSliced, setFruitsSliced] = useState(0);
  const [maxCombo, setMaxCombo] = useState(1);

  // Mutable refs for high performance animation loop
  const stateRef = useRef({
    score: 0,
    lives: 3,
    timeLeft: 90,
    isGameOver: false,
    isPaused: false,
    fruits: [] as FruitItem[],
    particles: [] as Particle[],
    slashTrail: [] as SlashPoint[],
    floatingTexts: [] as FloatingText[],
    isMouseDown: false,
    lastSpawn: 0,
    fruitsSlicedCount: 0,
    currentSlashCombos: 0,
    maxComboRecorded: 1,
  });

  const restartGame = useCallback(() => {
    stateRef.current = {
      score: 0,
      lives: 3,
      timeLeft: 90,
      isGameOver: false,
      isPaused: false,
      fruits: [],
      particles: [],
      slashTrail: [],
      floatingTexts: [],
      isMouseDown: false,
      lastSpawn: Date.now(),
      fruitsSlicedCount: 0,
      currentSlashCombos: 0,
      maxComboRecorded: 1,
    };
    setScore(0);
    setLives(3);
    setTimeLeft(90);
    setIsGameOver(false);
    setIsPaused(false);
    setFruitsSliced(0);
    setMaxCombo(1);
  }, []);

  const spawnFruit = (width: number, height: number) => {
    const isBomb = Math.random() < 0.22 && stateRef.current.fruitsSlicedCount > 3;
    const types: FruitItem['type'][] = ['watermelon', 'orange', 'kiwi', 'strawberry', 'banana'];
    const chosenType = isBomb ? 'bomb' : types[Math.floor(Math.random() * types.length)];

    const colors: Record<string, string> = {
      watermelon: '#22c55e',
      orange: '#f97316',
      kiwi: '#84cc16',
      strawberry: '#ef4444',
      banana: '#eab308',
      bomb: '#1e293b',
    };

    const x = width * 0.15 + Math.random() * (width * 0.7);
    const y = height + 30;
    const vx = (Math.random() - 0.5) * 5;
    const vy = -(11 + Math.random() * 4.5);

    stateRef.current.fruits.push({
      id: Math.random(),
      x,
      y,
      vx,
      vy,
      radius: isBomb ? 26 : 30 + Math.random() * 8,
      type: chosenType,
      color: colors[chosenType],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.12,
      sliced: false,
    });
  };

  const addJuiceSplatter = (x: number, y: number, color: string) => {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        alpha: 1,
        life: 0.9,
      });
    }
  };

  // Check collision between a line segment and circle
  const checkSlice = (p1: SlashPoint, p2: SlashPoint, fruit: FruitItem): boolean => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return false;

    const u = ((fruit.x - p1.x) * dx + (fruit.y - p1.y) * dy) / (len * len);
    const clampedU = Math.max(0, Math.min(1, u));
    const nearestX = p1.x + clampedU * dx;
    const nearestY = p1.y + clampedU * dy;

    const dist = Math.hypot(fruit.x - nearestX, fruit.y - nearestY);
    return dist <= fruit.radius;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = Math.min(800, rect.width - 16);
        canvas.height = Math.min(540, Math.max(420, window.innerHeight * 0.55));
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Main animation loop
    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Background atmospheric grid
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      // Subtle radial glow in background
      const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.6);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      grad.addColorStop(1, 'rgba(10, 15, 29, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
        // Fruit Spawning
        const now = Date.now();
        const spawnInterval = Math.max(700, 1500 - stateRef.current.fruitsSlicedCount * 15);
        if (now - stateRef.current.lastSpawn > spawnInterval) {
          stateRef.current.lastSpawn = now;
          spawnFruit(width, height);
          if (Math.random() < 0.35 && stateRef.current.fruitsSlicedCount > 10) {
            spawnFruit(width, height); // Double spawn
          }
        }

        // Clean stale slash trail
        stateRef.current.slashTrail = stateRef.current.slashTrail.filter((p) => now - p.time < 180);
      }

      // Draw and update particles
      for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
        const p = stateRef.current.particles[i];
        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25; // gravity
          p.alpha -= 0.02;
        }

        if (p.alpha <= 0) {
          stateRef.current.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw and update fruits
      for (let i = stateRef.current.fruits.length - 1; i >= 0; i--) {
        const f = stateRef.current.fruits[i];

        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          if (!f.sliced) {
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.28; // gravity
            f.rotation += f.vRot;

            // Missed fruit (dropped below bottom)
            if (f.y > height + 50 && f.vy > 0) {
              if (f.type !== 'bomb') {
                const nextLives = stateRef.current.lives - 1;
                stateRef.current.lives = Math.max(0, nextLives);
                setLives(stateRef.current.lives);
                sounds.playHit(180);

                if (stateRef.current.lives <= 0) {
                  stateRef.current.isGameOver = true;
                  setIsGameOver(true);
                }
              }
              stateRef.current.fruits.splice(i, 1);
              continue;
            }
          } else if (f.half1 && f.half2) {
            // Sliced halves physics
            f.half1.x += f.half1.vx;
            f.half1.y += f.half1.vy;
            f.half1.vy += 0.35;
            f.half1.rotation += 0.08;

            f.half2.x += f.half2.vx;
            f.half2.y += f.half2.vy;
            f.half2.vy += 0.35;
            f.half2.rotation -= 0.08;

            if (f.half1.y > height + 80 && f.half2.y > height + 80) {
              stateRef.current.fruits.splice(i, 1);
              continue;
            }
          }
        }

        // Render intact fruit
        if (!f.sliced) {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rotation);

          if (f.type === 'bomb') {
            // Bomb graphic with glowing fuse
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Skull icon
            ctx.fillStyle = '#f87171';
            ctx.font = `${f.radius * 0.9}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', 0, 2);
          } else {
            // Fruit outer skin
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();

            // Fruit inner highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(-f.radius * 0.3, -f.radius * 0.3, f.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Center details
            if (f.type === 'watermelon') {
              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.arc(0, 0, f.radius * 0.75, 0, Math.PI * 2);
              ctx.fill();
            } else if (f.type === 'orange') {
              ctx.fillStyle = '#fdba74';
              ctx.beginPath();
              ctx.arc(0, 0, f.radius * 0.7, 0, Math.PI * 2);
              ctx.fill();
            } else if (f.type === 'kiwi') {
              ctx.fillStyle = '#bef264';
              ctx.beginPath();
              ctx.arc(0, 0, f.radius * 0.75, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        } else if (f.half1 && f.half2) {
          // Render Sliced Halves
          [f.half1, f.half2].forEach((half, idx) => {
            ctx.save();
            ctx.translate(half.x, half.y);
            ctx.rotate(half.rotation);
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, idx === 0 ? 0 : Math.PI, idx === 0 ? Math.PI : Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
      }

      // Draw Sword Slash Trail
      const trail = stateRef.current.slashTrail;
      if (trail.length > 1) {
        ctx.save();
        for (let i = 1; i < trail.length; i++) {
          const p1 = trail[i - 1];
          const p2 = trail[i];
          const age = Date.now() - p2.time;
          const alpha = Math.max(0, 1 - age / 180);

          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = 6 * alpha;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Inner white neon core
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 2.5 * alpha;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Floating Scores & Combo Banners
      for (let i = stateRef.current.floatingTexts.length - 1; i >= 0; i--) {
        const ft = stateRef.current.floatingTexts[i];
        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          ft.y -= 1.2;
          ft.alpha -= 0.025;
        }
        if (ft.alpha <= 0) {
          stateRef.current.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Countdown timer loop
  useEffect(() => {
    if (isPaused || isGameOver || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stateRef.current.isGameOver = true;
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, timeLeft]);

  // Handle pointer interactions with accurate canvas scaling
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerStart = (clientX: number, clientY: number) => {
    if (stateRef.current.isPaused || stateRef.current.isGameOver) return;
    const { x, y } = getCanvasCoords(clientX, clientY);

    stateRef.current.isMouseDown = true;
    stateRef.current.currentSlashCombos = 0;
    stateRef.current.slashTrail = [{ x, y, time: Date.now() }];
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!stateRef.current.isMouseDown || stateRef.current.isPaused || stateRef.current.isGameOver) return;
    const { x, y } = getCanvasCoords(clientX, clientY);

    const trail = stateRef.current.slashTrail;
    const prevPoint = trail[trail.length - 1];
    const currentPoint: SlashPoint = { x, y, time: Date.now() };
    trail.push(currentPoint);

    if (prevPoint) {
      // Check collision with all active fruits
      stateRef.current.fruits.forEach((fruit) => {
        if (!fruit.sliced && checkSlice(prevPoint, currentPoint, fruit)) {
          if (fruit.type === 'bomb') {
            // Bomb sliced - Game Over!
            fruit.sliced = true;
            sounds.playExplode();
            addJuiceSplatter(fruit.x, fruit.y, '#f87171');
            stateRef.current.lives = 0;
            stateRef.current.isGameOver = true;
            setLives(0);
            setIsGameOver(true);
          } else {
            // Fruit sliced!
            fruit.sliced = true;
            stateRef.current.fruitsSlicedCount++;
            stateRef.current.currentSlashCombos++;
            setFruitsSliced(stateRef.current.fruitsSlicedCount);

            sounds.playSlice();
            addJuiceSplatter(fruit.x, fruit.y, fruit.color);

            // Halves setup
            fruit.half1 = { x: fruit.x - 8, y: fruit.y, vx: -3 - Math.random() * 2, vy: -2, rotation: fruit.rotation };
            fruit.half2 = { x: fruit.x + 8, y: fruit.y, vx: 3 + Math.random() * 2, vy: -2, rotation: fruit.rotation };

            let pts = 10;
            if (stateRef.current.currentSlashCombos >= 3) {
              const comboBonus = stateRef.current.currentSlashCombos * 15;
              pts += comboBonus;
              sounds.playScore();

              if (stateRef.current.currentSlashCombos > stateRef.current.maxComboRecorded) {
                stateRef.current.maxComboRecorded = stateRef.current.currentSlashCombos;
                setMaxCombo(stateRef.current.maxComboRecorded);
              }

              stateRef.current.floatingTexts.push({
                x: fruit.x,
                y: fruit.y - 20,
                text: `${stateRef.current.currentSlashCombos}x COMBO! +${pts}`,
                color: '#38bdf8',
                alpha: 1,
              });
            } else {
              stateRef.current.floatingTexts.push({
                x: fruit.x,
                y: fruit.y - 15,
                text: `+${pts}`,
                color: '#facc15',
                alpha: 1,
              });
            }

            stateRef.current.score += pts;
            setScore(stateRef.current.score);
          }
        }
      });
    }
  };

  const handlePointerEnd = () => {
    stateRef.current.isMouseDown = false;
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      lives={lives}
      maxLives={3}
      timeRemaining={timeLeft}
      customStats={[
        { label: 'Fruits Sliced', value: fruitsSliced },
        { label: 'Max Combo', value: `${maxCombo}x` },
      ]}
      onPauseToggle={() => {
        stateRef.current.isPaused = !isPaused;
        setIsPaused(!isPaused);
      }}
      onRestart={restartGame}
      onExit={onExit}
    >
      <div className="relative w-full flex flex-col items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            if (e.touches[0]) handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={handlePointerEnd}
          className="rounded-xl border border-slate-800 cursor-crosshair shadow-inner max-w-full select-none"
        />

        {/* In-game quick hint */}
        <div className="mt-2 text-[11px] text-slate-400 text-center">
          Slash fruits in rapid succession for combo multipliers · Avoid skull bombs!
        </div>
      </div>
    </GameWrapper>
  );
};

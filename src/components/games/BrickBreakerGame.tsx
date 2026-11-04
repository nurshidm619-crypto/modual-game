import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface BrickBreakerGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
  alive: boolean;
}

interface Powerup {
  x: number;
  y: number;
  vy: number;
  type: 'wide' | 'multiball' | 'slow' | 'life';
  color: string;
  symbol: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export const BrickBreakerGame: React.FC<BrickBreakerGameProps> = ({ game, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bricksShattered, setBricksShattered] = useState(0);

  const stateRef = useRef({
    score: 0,
    lives: 3,
    level: 1,
    timeLeft: 120,
    isGameOver: false,
    isPaused: false,
    paddle: { x: 300, y: 480, w: 100, h: 14, defaultW: 100 },
    balls: [] as Ball[],
    bricks: [] as Brick[],
    powerups: [] as Powerup[],
    particles: [] as Particle[],
    bricksDestroyedCount: 0,
    keys: { left: false, right: false },
  });

  const createBricks = (lvl: number, width: number) => {
    const bricks: Brick[] = [];
    const rows = 5 + Math.min(3, lvl - 1);
    const cols = 8;
    const padding = 8;
    const brickW = (width - padding * (cols + 1)) / cols;
    const brickH = 22;
    const topOffset = 50;

    const rowColors = ['#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#d946ef'];

    for (let r = 0; r < rows; r++) {
      const color = rowColors[r % rowColors.length];
      const maxHits = r === 0 && lvl > 1 ? 2 : 1;
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: padding + c * (brickW + padding),
          y: topOffset + r * (brickH + padding),
          w: brickW,
          h: brickH,
          hits: maxHits,
          maxHits,
          color,
          points: (rows - r) * 20,
          alive: true,
        });
      }
    }
    return bricks;
  };

  const resetBallAndPaddle = (width: number, height: number) => {
    stateRef.current.paddle.x = width / 2 - stateRef.current.paddle.w / 2;
    stateRef.current.paddle.y = height - 32;
    stateRef.current.paddle.w = stateRef.current.paddle.defaultW;

    stateRef.current.balls = [
      {
        x: width / 2,
        y: height - 50,
        vx: (Math.random() > 0.5 ? 1 : -1) * 4,
        vy: -5,
        radius: 7,
        speed: 6.2,
      },
    ];
    stateRef.current.powerups = [];
  };

  const restartGame = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 700;
    const h = canvas ? canvas.height : 500;

    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.level = 1;
    stateRef.current.timeLeft = 120;
    stateRef.current.isGameOver = false;
    stateRef.current.isPaused = false;
    stateRef.current.bricksDestroyedCount = 0;
    stateRef.current.bricks = createBricks(1, w);
    resetBallAndPaddle(w, h);

    setScore(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(120);
    setIsGameOver(false);
    setIsPaused(false);
    setBricksShattered(0);
  }, []);

  // Level countdown timer
  useEffect(() => {
    if (isPaused || isGameOver || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextLives = stateRef.current.lives - 1;
          stateRef.current.lives = nextLives;
          setLives(nextLives);
          sounds.playExplode();
          if (nextLives <= 0) {
            stateRef.current.isGameOver = true;
            setIsGameOver(true);
            return 0;
          }
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, timeLeft]);

  const addShatterParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
      });
    }
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
        canvas.width = Math.min(760, rect.width - 16);
        canvas.height = Math.min(520, Math.max(440, window.innerHeight * 0.58));
        if (stateRef.current.bricks.length === 0) {
          stateRef.current.bricks = createBricks(1, canvas.width);
          resetBallAndPaddle(canvas.width, canvas.height);
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      }
      if (e.key === ' ') {
        e.preventDefault();
        stateRef.current.isPaused = !stateRef.current.isPaused;
        setIsPaused(stateRef.current.isPaused);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation Loop
    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Neon cyber game arena styling
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Arena grid pattern
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
        // Paddle movement with keys
        const paddleSpeed = 8;
        if (stateRef.current.keys.left) {
          stateRef.current.paddle.x = Math.max(0, stateRef.current.paddle.x - paddleSpeed);
        }
        if (stateRef.current.keys.right) {
          stateRef.current.paddle.x = Math.min(
            width - stateRef.current.paddle.w,
            stateRef.current.paddle.x + paddleSpeed
          );
        }

        // Update powerups
        for (let i = stateRef.current.powerups.length - 1; i >= 0; i--) {
          const p = stateRef.current.powerups[i];
          p.y += p.vy;

          // Catch powerup with paddle
          const pad = stateRef.current.paddle;
          if (
            p.y + 12 >= pad.y &&
            p.y <= pad.y + pad.h &&
            p.x >= pad.x &&
            p.x <= pad.x + pad.w
          ) {
            sounds.playPowerup();
            if (p.type === 'wide') {
              pad.w = Math.min(180, pad.w + 35);
            } else if (p.type === 'multiball' && stateRef.current.balls.length > 0) {
              const b = stateRef.current.balls[0];
              stateRef.current.balls.push(
                { x: b.x, y: b.y, vx: -b.vx, vy: b.vy, radius: b.radius, speed: b.speed },
                { x: b.x, y: b.y, vx: b.vx * 0.7, vy: -Math.abs(b.vy), radius: b.radius, speed: b.speed }
              );
            } else if (p.type === 'life') {
              stateRef.current.lives = Math.min(4, stateRef.current.lives + 1);
              setLives(stateRef.current.lives);
            } else if (p.type === 'slow') {
              stateRef.current.balls.forEach((b) => (b.speed = Math.max(4.5, b.speed * 0.8)));
            }
            stateRef.current.powerups.splice(i, 1);
            continue;
          }

          if (p.y > height + 20) {
            stateRef.current.powerups.splice(i, 1);
          }
        }

        // Update Balls
        for (let bIdx = stateRef.current.balls.length - 1; bIdx >= 0; bIdx--) {
          const ball = stateRef.current.balls[bIdx];
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounces
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
            sounds.playHit(400);
          } else if (ball.x + ball.radius >= width) {
            ball.x = width - ball.radius;
            ball.vx = -Math.abs(ball.vx);
            sounds.playHit(400);
          }

          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
            sounds.playHit(400);
          }

          // Paddle collision with angle deflection
          const pad = stateRef.current.paddle;
          if (
            ball.y + ball.radius >= pad.y &&
            ball.y - ball.radius <= pad.y + pad.h &&
            ball.x >= pad.x &&
            ball.x <= pad.x + pad.w &&
            ball.vy > 0
          ) {
            sounds.playHit(300);
            const hitPoint = (ball.x - (pad.x + pad.w / 2)) / (pad.w / 2);
            const maxAngle = (75 * Math.PI) / 180;
            const bounceAngle = hitPoint * maxAngle;

            ball.vx = ball.speed * Math.sin(bounceAngle);
            ball.vy = -ball.speed * Math.cos(bounceAngle);
          }

          // Brick collision
          stateRef.current.bricks.forEach((brick) => {
            if (!brick.alive) return;

            if (
              ball.x + ball.radius > brick.x &&
              ball.x - ball.radius < brick.x + brick.w &&
              ball.y + ball.radius > brick.y &&
              ball.y - ball.radius < brick.y + brick.h
            ) {
              // Hit brick!
              ball.vy = -ball.vy;
              brick.hits--;

              if (brick.hits <= 0) {
                brick.alive = false;
                stateRef.current.score += brick.points;
                stateRef.current.bricksDestroyedCount++;
                setScore(stateRef.current.score);
                setBricksShattered(stateRef.current.bricksDestroyedCount);
                sounds.playScore();
                addShatterParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);

                // Chance to spawn powerup
                if (Math.random() < 0.25) {
                  const types: Powerup['type'][] = ['wide', 'multiball', 'slow', 'life'];
                  const t = types[Math.floor(Math.random() * types.length)];
                  const symbols: Record<Powerup['type'], string> = {
                    wide: '⟷',
                    multiball: '●●',
                    slow: '⏱',
                    life: '♥',
                  };
                  stateRef.current.powerups.push({
                    x: brick.x + brick.w / 2,
                    y: brick.y + brick.h / 2,
                    vy: 2.2,
                    type: t,
                    color: t === 'life' ? '#f43f5e' : '#38bdf8',
                    symbol: symbols[t],
                  });
                }
              } else {
                sounds.playHit(500);
              }
            }
          });

          // Check bottom drop
          if (ball.y - ball.radius > height) {
            stateRef.current.balls.splice(bIdx, 1);
          }
        }

        // If all balls lost
        if (stateRef.current.balls.length === 0) {
          const nextLives = stateRef.current.lives - 1;
          stateRef.current.lives = nextLives;
          setLives(nextLives);
          sounds.playExplode();

          if (nextLives <= 0) {
            stateRef.current.isGameOver = true;
            setIsGameOver(true);
          } else {
            resetBallAndPaddle(width, height);
          }
        }

        // Check if all bricks cleared
        const remaining = stateRef.current.bricks.filter((b) => b.alive);
        if (remaining.length === 0) {
          sounds.playWin();
          stateRef.current.level++;
          setLevel(stateRef.current.level);
          stateRef.current.bricks = createBricks(stateRef.current.level, width);
          resetBallAndPaddle(width, height);
        }
      }

      // Draw Bricks
      stateRef.current.bricks.forEach((brick) => {
        if (!brick.alive) return;
        ctx.save();
        ctx.fillStyle = brick.color;
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
        ctx.fill();

        // If multi-hit brick
        if (brick.maxHits > 1 && brick.hits > 1) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Powerups
      stateRef.current.powerups.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();
      });

      // Draw Particles
      for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
        const pt = stateRef.current.particles[i];
        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.025;
        }
        if (pt.alpha <= 0) {
          stateRef.current.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Paddle
      const pad = stateRef.current.paddle;
      ctx.save();
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 6);
      ctx.fill();

      // Inner neon line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pad.x + 8, pad.y + 4, pad.w - 16, 2);
      ctx.restore();

      // Draw Balls
      stateRef.current.balls.forEach((ball) => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || stateRef.current.isPaused || stateRef.current.isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const x = (clientX - rect.left) * scaleX;
    stateRef.current.paddle.x = Math.max(
      0,
      Math.min(canvas.width - stateRef.current.paddle.w, x - stateRef.current.paddle.w / 2)
    );
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
        { label: 'Level', value: `Round ${level}` },
        { label: 'Bricks Shattered', value: bricksShattered },
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
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onTouchStart={(e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
          }}
          className="rounded-xl border border-slate-800 cursor-ew-resize shadow-inner max-w-full touch-none select-none"
        />

        {/* Mobile touch paddle slider bar */}
        <div className="w-full max-w-xs mt-3 flex items-center justify-between gap-3 sm:hidden">
          <button
            onPointerDown={() => {
              stateRef.current.keys.left = true;
            }}
            onPointerUp={() => {
              stateRef.current.keys.left = false;
            }}
            className="flex-1 py-3 bg-slate-800/80 active:bg-cyan-500/30 rounded-xl text-center font-bold text-white border border-slate-700"
          >
            ◀ Move Left
          </button>
          <button
            onPointerDown={() => {
              stateRef.current.keys.right = true;
            }}
            onPointerUp={() => {
              stateRef.current.keys.right = false;
            }}
            className="flex-1 py-3 bg-slate-800/80 active:bg-cyan-500/30 rounded-xl text-center font-bold text-white border border-slate-700"
          >
            Move Right ▶
          </button>
        </div>

        <div className="mt-2 text-[11px] text-slate-400 text-center">
          Deflect ball at angles to hit high-tier blocks · Collect falling power-ups to clear levels!
        </div>
      </div>
    </GameWrapper>
  );
};

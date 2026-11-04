import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameDefinition } from '../../data/games';
import { GameWrapper } from './GameWrapper';
import { sounds } from '../../utils/soundManager';

interface SpaceDodgeGameProps {
  game: GameDefinition;
  onExit: () => void;
}

interface Obstacle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  type: 'asteroid' | 'drone';
  color: string;
}

interface StarItem {
  x: number;
  y: number;
  vy: number;
  type: 'energy' | 'shield';
}

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export const SpaceDodgeGame: React.FC<SpaceDodgeGameProps> = ({ game, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [orbsCollected, setOrbsCollected] = useState(0);

  const stateRef = useRef({
    score: 0,
    hasShield: false,
    distance: 0,
    isGameOver: false,
    isPaused: false,
    ship: { x: 300, y: 440, w: 32, h: 42, vx: 0 },
    keys: { left: false, right: false, up: false, down: false },
    bgStars: [] as BackgroundStar[],
    obstacles: [] as Obstacle[],
    collectibles: [] as StarItem[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; alpha: number }[],
    lastObstacleSpawn: 0,
    speedMultiplier: 1.0,
    orbsCollectedCount: 0,
  });

  const initStars = (width: number, height: number) => {
    const stars: BackgroundStar[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1,
        brightness: Math.random() * 0.7 + 0.3,
      });
    }
    return stars;
  };

  const restartGame = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 600;
    const h = canvas ? canvas.height : 500;

    stateRef.current.score = 0;
    stateRef.current.hasShield = false;
    stateRef.current.distance = 0;
    stateRef.current.isGameOver = false;
    stateRef.current.isPaused = false;
    stateRef.current.obstacles = [];
    stateRef.current.collectibles = [];
    stateRef.current.particles = [];
    stateRef.current.speedMultiplier = 1.0;
    stateRef.current.orbsCollectedCount = 0;
    stateRef.current.ship.x = w / 2;
    stateRef.current.ship.y = h - 60;

    setScore(0);
    setHasShield(false);
    setDistanceKm(0);
    setIsGameOver(false);
    setIsPaused(false);
    setOrbsCollected(0);
  }, []);

  const addExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
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
        canvas.width = Math.min(680, rect.width - 16);
        canvas.height = Math.min(540, Math.max(450, window.innerHeight * 0.6));
        if (stateRef.current.bgStars.length === 0) {
          stateRef.current.bgStars = initStars(canvas.width, canvas.height);
          stateRef.current.ship.x = canvas.width / 2;
          stateRef.current.ship.y = canvas.height - 60;
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') stateRef.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') stateRef.current.keys.down = true;
      if (e.key === ' ') {
        e.preventDefault();
        stateRef.current.isPaused = !stateRef.current.isPaused;
        setIsPaused(stateRef.current.isPaused);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') stateRef.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') stateRef.current.keys.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Deep space void
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      // Parallax starfield
      stateRef.current.bgStars.forEach((star) => {
        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          star.y += star.speed * stateRef.current.speedMultiplier;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
        // Distance and Speed ramp
        stateRef.current.distance += 1.5;
        stateRef.current.speedMultiplier = 1.0 + Math.min(2.2, stateRef.current.distance / 1500);
        stateRef.current.score += 1;
        setDistanceKm(Math.floor(stateRef.current.distance / 10));
        setScore(stateRef.current.score);

        // Ship movement
        const moveSpeed = 6.5;
        const ship = stateRef.current.ship;
        if (stateRef.current.keys.left) ship.x = Math.max(ship.w / 2, ship.x - moveSpeed);
        if (stateRef.current.keys.right) ship.x = Math.min(width - ship.w / 2, ship.x + moveSpeed);
        if (stateRef.current.keys.up) ship.y = Math.max(80, ship.y - moveSpeed * 0.7);
        if (stateRef.current.keys.down) ship.y = Math.min(height - ship.h, ship.y + moveSpeed * 0.7);

        // Spawn obstacles
        const now = Date.now();
        const spawnDelay = Math.max(380, 850 - stateRef.current.distance * 0.25);
        if (now - stateRef.current.lastObstacleSpawn > spawnDelay) {
          stateRef.current.lastObstacleSpawn = now;
          const isDrone = Math.random() < 0.3;
          stateRef.current.obstacles.push({
            x: 20 + Math.random() * (width - 40),
            y: -30,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (3.5 + Math.random() * 3.5) * stateRef.current.speedMultiplier,
            radius: isDrone ? 18 : 16 + Math.random() * 16,
            rotation: 0,
            vRot: (Math.random() - 0.5) * 0.08,
            type: isDrone ? 'drone' : 'asteroid',
            color: isDrone ? '#f43f5e' : '#78716c',
          });

          // Chance to spawn energy core or shield
          if (Math.random() < 0.22) {
            stateRef.current.collectibles.push({
              x: 20 + Math.random() * (width - 40),
              y: -20,
              vy: 3.5 * stateRef.current.speedMultiplier,
              type: Math.random() < 0.75 ? 'energy' : 'shield',
            });
          }
        }

        // Update collectibles
        for (let i = stateRef.current.collectibles.length - 1; i >= 0; i--) {
          const c = stateRef.current.collectibles[i];
          c.y += c.vy;

          // Collect collision with ship
          const dist = Math.hypot(c.x - ship.x, c.y - ship.y);
          if (dist < ship.w + 12) {
            if (c.type === 'shield') {
              stateRef.current.hasShield = true;
              setHasShield(true);
              sounds.playPowerup();
            } else {
              stateRef.current.score += 250;
              stateRef.current.orbsCollectedCount++;
              setOrbsCollected(stateRef.current.orbsCollectedCount);
              sounds.playScore();
            }
            stateRef.current.collectibles.splice(i, 1);
            continue;
          }

          if (c.y > height + 30) {
            stateRef.current.collectibles.splice(i, 1);
          }
        }

        // Update obstacles & collisions
        for (let i = stateRef.current.obstacles.length - 1; i >= 0; i--) {
          const obs = stateRef.current.obstacles[i];
          obs.x += obs.vx;
          obs.y += obs.vy;
          obs.rotation += obs.vRot;

          // Check collision with ship
          const dist = Math.hypot(obs.x - ship.x, obs.y - ship.y);
          if (dist < obs.radius + ship.w * 0.45) {
            // Collision!
            if (stateRef.current.hasShield) {
              // Shield absorbed!
              stateRef.current.hasShield = false;
              setHasShield(false);
              sounds.playExplode();
              addExplosion(obs.x, obs.y, '#38bdf8');
              stateRef.current.obstacles.splice(i, 1);
              continue;
            } else {
              // Destroyed!
              sounds.playExplode();
              addExplosion(ship.x, ship.y, '#f97316');
              stateRef.current.isGameOver = true;
              setIsGameOver(true);
              break;
            }
          }

          if (obs.y > height + 50) {
            stateRef.current.obstacles.splice(i, 1);
          }
        }
      }

      // Draw Collectibles
      stateRef.current.collectibles.forEach((c) => {
        ctx.save();
        if (c.type === 'shield') {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡', c.x, c.y + 1);
        } else {
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(c.x - 2, c.y - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Obstacles
      stateRef.current.obstacles.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        if (obs.type === 'drone') {
          // Alien drone with laser glow
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.lineTo(14, -10);
          ctx.lineTo(-14, -10);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, -2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rocky asteroid
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
          ctx.fill();

          // Crater texture
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(-obs.radius * 0.3, -obs.radius * 0.2, obs.radius * 0.28, 0, Math.PI * 2);
          ctx.arc(obs.radius * 0.2, obs.radius * 0.3, obs.radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Particles
      for (let i = stateRef.current.particles.length - 1; i >= 0; i--) {
        const pt = stateRef.current.particles[i];
        if (!stateRef.current.isPaused && !stateRef.current.isGameOver) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.03;
        }
        if (pt.alpha <= 0) {
          stateRef.current.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Starship
      const ship = stateRef.current.ship;
      if (!stateRef.current.isGameOver) {
        ctx.save();
        ctx.translate(ship.x, ship.y);

        // Thruster flame animation
        const flameLength = 12 + Math.random() * 10;
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-6, ship.h / 2);
        ctx.lineTo(6, ship.h / 2);
        ctx.lineTo(0, ship.h / 2 + flameLength);
        ctx.closePath();
        ctx.fill();

        // Ship body
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -ship.h / 2);
        ctx.lineTo(ship.w / 2, ship.h / 2);
        ctx.lineTo(0, ship.h / 2 - 8);
        ctx.lineTo(-ship.w / 2, ship.h / 2);
        ctx.closePath();
        ctx.fill();

        // Cockpit glass
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, -ship.h / 6, 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Energy shield bubble if active
        if (stateRef.current.hasShield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, ship.h * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

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

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isPaused || isGameOver) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  const handlePointerSteer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || stateRef.current.isPaused || stateRef.current.isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const x = (clientX - rect.left) * scaleX;
    stateRef.current.ship.x = Math.max(
      stateRef.current.ship.w / 2,
      Math.min(canvas.width - stateRef.current.ship.w / 2, x)
    );
  };

  return (
    <GameWrapper
      game={game}
      score={score}
      isGameOver={isGameOver}
      isPaused={isPaused}
      timeRemaining={elapsedTime}
      customStats={[
        { label: 'Survival Time', value: `${elapsedTime}s` },
        { label: 'Distance', value: `${distanceKm} km` },
        { label: 'Energy Orbs', value: orbsCollected },
        { label: 'Shield Status', value: hasShield ? 'ACTIVE' : 'OFFLINE' },
      ]}
      onPauseToggle={() => {
        stateRef.current.isPaused = !isPaused;
        setIsPaused(!isPaused);
      }}
      onRestart={() => {
        setElapsedTime(0);
        restartGame();
      }}
      onExit={onExit}
    >
      <div className="relative w-full flex flex-col items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => handlePointerSteer(e.clientX)}
          onTouchStart={(e) => {
            if (e.touches[0]) handlePointerSteer(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerSteer(e.touches[0].clientX);
          }}
          className="rounded-xl border border-slate-800 cursor-none shadow-inner max-w-full touch-none select-none"
        />

        {/* Mobile touch steering buttons */}
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
            ◀ Left
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
            Right ▶
          </button>
        </div>

        <div className="mt-2 text-[11px] text-slate-400 text-center">
          Dodge asteroids and red laser drones · Collect yellow energy stars (+250) and blue shields!
        </div>
      </div>
    </GameWrapper>
  );
};

import React from 'react';
import { GameDefinition } from '../../data/games';
import { getHighScore, isFavorite, toggleFavorite, getPlayCount } from '../../utils/storage';
import { sounds } from '../../utils/soundManager';

interface GameCardProps {
  game: GameDefinition;
  onPlay: (gameId: string) => void;
  onFavoriteChange?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay, onFavoriteChange }) => {
  const highScore = getHighScore(game.id);
  const playCount = getPlayCount(game.id);
  const favorite = isFavorite(game.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    toggleFavorite(game.id);
    if (onFavoriteChange) onFavoriteChange();
  };

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onPlay(game.id);
      }}
      className="group relative border border-slate-800 bg-slate-900/70 hover:bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Badge indicator */}
        {game.badge && (
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded uppercase tracking-wider">
            {game.badge}
          </div>
        )}

        {/* Favorite Star Button */}
        <button
          onClick={handleFavoriteClick}
          title={favorite ? 'Remove Favorite' : 'Save as Favorite'}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${favorite ? 'text-amber-400 fill-amber-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>

        {/* Play overlay hover button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
          <div className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <span>Play Game</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata unboxed text with typographic separators (anti-slop rule §1.A) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-medium">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span>{game.difficulty}</span>
          </div>

          <h3 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
            {game.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Bottom footer: Personal Best & Real User Plays */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            {highScore > 0 ? (
              <span>
                Best: <strong className="text-amber-400 font-display tabular-nums">{highScore.toLocaleString()}</strong>
              </span>
            ) : (
              <span>Not played yet</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {playCount > 0 ? `${playCount} ${playCount === 1 ? 'play' : 'plays'}` : 'Unplayed'}
          </span>
        </div>
      </div>
    </div>
  );
};

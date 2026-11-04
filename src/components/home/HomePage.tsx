import React, { useState } from 'react';
import { GAMES, GameCategory } from '../../data/games';
import { GameCard } from './GameCard';
import { getRecentGameIds, getFavorites } from '../../utils/storage';
import { AdSlot } from '../ads/AdSlot';
import { sounds } from '../../utils/soundManager';

interface HomePageProps {
  onSelectGame: (gameId: string) => void;
  filterFavoritesOnly?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectGame,
  filterFavoritesOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [, setFavTick] = useState(0);

  const recentIds = getRecentGameIds();
  const recentGames = GAMES.filter((g) => recentIds.includes(g.id));
  const featuredGames = GAMES.filter((g) => g.badge === 'FEATURED');

  // Filter games based on search, category, or favorites
  const filteredGames = GAMES.filter((game) => {
    if (filterFavoritesOnly) {
      const favs = getFavorites();
      if (!favs.includes(game.id)) return false;
    }
    if (selectedCategory !== 'All' && game.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchTag = game.tagline.toLowerCase().includes(q);
      const matchCat = game.category.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchCat) return false;
    }
    return true;
  });

  const categories: GameCategory[] = ['All', 'Action', 'Puzzle', 'Reflex', 'Classic'];

  return (
    <div className="w-full">
      {/* Hero Showcase (only shown when not filtering favorites) */}
      {!filterFavoritesOnly && (
        <section className="relative w-full border-b border-slate-800/80 bg-slate-950 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                <span>Free HTML5 Arcade</span>
                <span aria-hidden="true">·</span>
                <span>No Installation Required</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white text-balance leading-tight">
                Play 10 Instant <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent">
                  Browser Mini-Games
                </span>
              </h1>

              <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                Slash fruits, shatter neon bricks, pop bubble clusters, and dodge cosmic meteor storms. Powered by HTML5 Canvas with instant local high scores and zero lag.
              </p>

              {/* Instant Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games (e.g. Fruit, Bubble, Reflex)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 shadow-xl transition-all"
                />
                <svg
                  className="w-5 h-5 absolute left-3.5 top-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick feature tags (anti-slop clean metadata, no pill badge sandwich) */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span>100% Free Forever</span>
                <span aria-hidden="true">·</span>
                <span>Keyboard & Touch Controls</span>
                <span aria-hidden="true">·</span>
                <span>Synthesized Web Audio</span>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group">
                <img
                  src="/src/assets/images/arcade_hero_banner_1793772302943.jpg"
                  alt="MY ARCADE Gaming Lounge"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase text-cyan-400 font-bold tracking-wider">Spotlight</div>
                    <div className="text-lg font-bold font-display text-white">Full 10-Game Suite Online</div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectGame('fruit-slice');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    Play Now &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Header Ad Placement (Outside Gameplay) */}
        <AdSlot slot="leaderboard-top" />

        {/* Recently Played Bar (if has history and not searching) */}
        {!searchQuery && !filterFavoritesOnly && recentGames.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <span>Recently Played</span>
              </h2>
              <span className="text-xs text-slate-400">Quick Resume</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {recentGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(game.id);
                  }}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                    {game.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{game.category}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter Tabs & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">
              {filterFavoritesOnly ? 'Your Favorite Games' : 'Explore Arcade Games'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {filteredGames.length} of {GAMES.length} mini-games ready to play instantly
            </p>
          </div>

          {/* Interactive filter tabs (functional buttons allowed §1.A) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-lg font-bold text-white">No mini-games matched your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try a different keyword or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-cyan-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={onSelectGame}
                onFavoriteChange={() => setFavTick((t) => t + 1)}
              />
            ))}
          </div>
        )}

        {/* Featured Mini-Games Strip (if on All view) */}
        {!filterFavoritesOnly && !searchQuery && selectedCategory === 'All' && (
          <section className="mt-16 pt-12 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                  Arcade Highlights
                </span>
                <h2 className="text-2xl font-bold font-display text-white mt-0.5">
                  Featured Mini-Games
                </h2>
              </div>
              <span className="text-xs text-slate-400">Hand-crafted arcade titles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(game.id);
                  }}
                  className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-cyan-300 truncate">
                      {game.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{game.category} · {game.difficulty}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-colors shrink-0">
                    &rarr;
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

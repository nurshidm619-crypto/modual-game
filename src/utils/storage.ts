/**
 * LocalStorage state persistence for MY ARCADE high scores, player history, and favorites.
 */

export interface GameHistoryItem {
  id: string;
  gameId: string;
  gameTitle: string;
  score: number;
  timestamp: number;
  durationSeconds: number;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalScoreAccumulated: number;
  favoriteGames: string[];
  highScores: Record<string, number>;
}

const HIGH_SCORES_KEY = 'myarcade_highscores';
const GAME_HISTORY_KEY = 'myarcade_history';
const FAVORITES_KEY = 'myarcade_favorites';
const RECENT_KEY = 'myarcade_recent';
const PLAY_COUNTS_KEY = 'myarcade_play_counts';

export function getHighScores(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getHighScore(gameId: string): number {
  const scores = getHighScores();
  return scores[gameId] || 0;
}

export function saveHighScore(gameId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getHighScores();
    const prev = current[gameId] || 0;
    if (score > prev) {
      current[gameId] = score;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(current));
      return true; // New record!
    }
    return false;
  } catch {
    return false;
  }
}

export function getPlayCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PLAY_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPlayCount(gameId: string): number {
  const counts = getPlayCounts();
  return counts[gameId] || 0;
}

export function incrementPlayCount(gameId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const counts = getPlayCounts();
    const next = (counts[gameId] || 0) + 1;
    counts[gameId] = next;
    localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(counts));
    return next;
  } catch {
    return 0;
  }
}

export function getGameHistory(): GameHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GAME_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordGameSession(session: Omit<GameHistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getGameHistory();
    const newItem: GameHistoryItem = {
      ...session,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    // Prepend and keep last 40 entries
    const updated = [newItem, ...history].slice(0, 40);
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updated));

    // Also update recent played game list and play count
    updateRecentGames(session.gameId);
    incrementPlayCount(session.gameId);
  } catch {
    // Storage quota or error
  }
}

export function getRecentGameIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateRecentGames(gameId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getRecentGameIds().filter((id) => id !== gameId);
    list.unshift(gameId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    // Ignore
  }
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(gameId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const favs = getFavorites();
    let updated: string[];
    let isFav = false;
    if (favs.includes(gameId)) {
      updated = favs.filter((id) => id !== gameId);
      isFav = false;
    } else {
      updated = [...favs, gameId];
      isFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return isFav;
  } catch {
    return false;
  }
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

export function clearAllGameData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HIGH_SCORES_KEY);
  localStorage.removeItem(GAME_HISTORY_KEY);
  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(RECENT_KEY);
  localStorage.removeItem(PLAY_COUNTS_KEY);
}


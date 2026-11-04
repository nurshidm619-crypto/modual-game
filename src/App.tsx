import React, { useState, useEffect } from 'react';
import { GAMES, GameDefinition } from './data/games';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/home/HomePage';
import { StatsPage } from './components/pages/StatsPage';
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { ContactPage } from './components/pages/ContactPage';

// Games
import { FruitSliceGame } from './components/games/FruitSliceGame';
import { BubblePopGame } from './components/games/BubblePopGame';
import { BrickBreakerGame } from './components/games/BrickBreakerGame';
import { SpaceDodgeGame } from './components/games/SpaceDodgeGame';
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { ColorRushGame } from './components/games/ColorRushGame';
import { NumberPuzzleGame } from './components/games/NumberPuzzleGame';
import { TapChallengeGame } from './components/games/TapChallengeGame';
import { BlockPuzzleGame } from './components/games/BlockPuzzleGame';
import { QuickReflexGame } from './components/games/QuickReflexGame';
import { sounds } from './utils/soundManager';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Sync hash routing on mount and hashchange
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) {
        setCurrentView('home');
        setActiveGameId(null);
        return;
      }

      const foundGame = GAMES.find((g) => g.id === hash);
      if (foundGame) {
        setActiveGameId(foundGame.id);
        setCurrentView('game');
      } else if (['stats', 'favorites', 'about', 'privacy', 'terms', 'contact'].includes(hash)) {
        setCurrentView(hash);
        setActiveGameId(null);
      } else {
        setCurrentView('home');
        setActiveGameId(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: string) => {
    window.location.hash = view === 'home' ? '' : view;
    setCurrentView(view);
    setActiveGameId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const launchGame = (gameId: string) => {
    window.location.hash = gameId;
    setActiveGameId(gameId);
    setCurrentView('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayRandom = () => {
    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    sounds.playScore();
    launchGame(randomGame.id);
  };

  const activeGame = GAMES.find((g) => g.id === activeGameId);

  const renderGameScreen = (game: GameDefinition) => {
    switch (game.id) {
      case 'fruit-slice':
        return <FruitSliceGame game={game} onExit={() => navigateTo('home')} />;
      case 'bubble-pop':
        return <BubblePopGame game={game} onExit={() => navigateTo('home')} />;
      case 'brick-breaker':
        return <BrickBreakerGame game={game} onExit={() => navigateTo('home')} />;
      case 'space-dodge':
        return <SpaceDodgeGame game={game} onExit={() => navigateTo('home')} />;
      case 'memory-match':
        return <MemoryMatchGame game={game} onExit={() => navigateTo('home')} />;
      case 'color-rush':
        return <ColorRushGame game={game} onExit={() => navigateTo('home')} />;
      case 'number-puzzle':
        return <NumberPuzzleGame game={game} onExit={() => navigateTo('home')} />;
      case 'tap-challenge':
        return <TapChallengeGame game={game} onExit={() => navigateTo('home')} />;
      case 'block-puzzle':
        return <BlockPuzzleGame game={game} onExit={() => navigateTo('home')} />;
      case 'quick-reflex':
        return <QuickReflexGame game={game} onExit={() => navigateTo('home')} />;
      default:
        return <HomePage onSelectGame={launchGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onPlayRandom={handlePlayRandom}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'game' && activeGame ? (
          <div className="py-4">
            {renderGameScreen(activeGame)}
          </div>
        ) : currentView === 'favorites' ? (
          <HomePage onSelectGame={launchGame} filterFavoritesOnly={true} />
        ) : currentView === 'stats' ? (
          <StatsPage onBack={() => navigateTo('home')} onSelectGame={launchGame} />
        ) : currentView === 'about' ? (
          <AboutPage onBack={() => navigateTo('home')} onSelectGame={launchGame} />
        ) : currentView === 'privacy' ? (
          <PrivacyPolicyPage onBack={() => navigateTo('home')} />
        ) : currentView === 'terms' ? (
          <TermsPage onBack={() => navigateTo('home')} />
        ) : currentView === 'contact' ? (
          <ContactPage onBack={() => navigateTo('home')} />
        ) : (
          <HomePage onSelectGame={launchGame} />
        )}
      </div>

      {/* Footer (shown on all non-game views or at bottom) */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export type GameCategory = 'All' | 'Action' | 'Puzzle' | 'Reflex' | 'Classic';

export interface GameDefinition {
  id: string;
  title: string;
  tagline: string;
  category: 'Action' | 'Puzzle' | 'Reflex' | 'Classic';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
  badge?: 'FEATURED' | 'ARCADE' | 'ORIGINAL';
  thumbnail: string;
  color: string;
  controls: {
    desktop: string;
    mobile: string;
  };
  instructions: string[];
  rules: string;
}

export const GAMES: GameDefinition[] = [
  {
    id: 'fruit-slice',
    title: 'Fruit Slice',
    tagline: 'Slice soaring fruits with ninja reflexes & avoid the bombs!',
    category: 'Action',
    difficulty: 'Adaptive',
    badge: 'FEATURED',
    thumbnail: '/src/assets/images/fruit_slice_thumb_1793772303367.jpg',
    color: '#ef4444',
    controls: {
      desktop: 'Click & drag mouse to slice across fruits',
      mobile: 'Swipe your finger across flying fruits',
    },
    instructions: [
      'Slice incoming fruits before they drop off screen.',
      'Slice multiple fruits in a single slash for combo multipliers (2x, 3x, 4x).',
      'Never slice the black skull bombs — one hit triggers an instant explosion!',
      '3 dropped fruits will end your game.',
    ],
    rules: 'Speed and fruit throw frequency scale with your combo streak. Earn bonus points for clean multi-slices.',
  },
  {
    id: 'bubble-pop',
    title: 'Bubble Pop',
    tagline: 'Pop matching bubble clusters and trigger chain reactions!',
    category: 'Puzzle',
    difficulty: 'Medium',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/fruit_slice_thumb_1793772303367.jpg',
    color: '#06b6d4',
    controls: {
      desktop: 'Click connected bubble clusters (2 or more)',
      mobile: 'Tap matching bubble groups to pop',
    },
    instructions: [
      'Tap clusters of 2 or more adjacent matching colored bubbles.',
      'Larger clusters earn exponentially higher points.',
      'Clearing clusters before timer expires advances to next level.',
      'Bonus seconds awarded for large cluster clearances.',
    ],
    rules: 'Each pop clears space and drops bubbles down with real physics. Reach the target score to clear each stage.',
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker',
    tagline: 'Shatter neon blocks with electric balls & laser power-ups!',
    category: 'Classic',
    difficulty: 'Medium',
    badge: 'FEATURED',
    thumbnail: '/src/assets/images/brick_breaker_thumb_1793772303650.jpg',
    color: '#3b82f6',
    controls: {
      desktop: 'Mouse move or Left/Right Arrow keys to glide paddle',
      mobile: 'Touch and slide your finger on the screen bottom',
    },
    instructions: [
      'Control the paddle to bounce the energy orb into neon bricks.',
      'Angle of reflection changes based on where the ball strikes your paddle.',
      'Collect falling power-ups: Multi-ball, Wide Paddle, Slow Motion, and Extra Life.',
      'Clear all rows to advance to denser, reinforced brick layouts.',
    ],
    rules: 'You start with 3 lives. Dropping the ball below the paddle loses 1 life.',
  },
  {
    id: 'space-dodge',
    title: 'Space Dodge',
    tagline: 'Navigate meteor storms and intercept alien laser drones!',
    category: 'Action',
    difficulty: 'Hard',
    badge: 'FEATURED',
    thumbnail: '/src/assets/images/space_dodge_thumb_1793772303932.jpg',
    color: '#8b5cf6',
    controls: {
      desktop: 'A / D or Arrow Keys to steer (or mouse follow)',
      mobile: 'Touch left or right side of screen / drag ship',
    },
    instructions: [
      'Pilot your fighter through asteroid fields and plasma beams.',
      'Collect luminous cosmic energy cores for +250 bonus points.',
      'Pick up Force Shields to absorb 1 catastrophic collision.',
      'Survive as long as possible while warp speed accelerates.',
    ],
    rules: 'Collision without an active energy shield ends the run. Distance traveled multiplies your total score.',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    tagline: 'Flip cards and find hidden retro arcade pairs under pressure!',
    category: 'Puzzle',
    difficulty: 'Medium',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/arcade_hero_banner_1793772302943.jpg',
    color: '#10b981',
    controls: {
      desktop: 'Click cards to flip and reveal',
      mobile: 'Tap cards to flip',
    },
    instructions: [
      'Flip two cards at a time to uncover matching arcade symbols.',
      'Consecutive successful matches trigger combo multipliers.',
      'Match all pairs before the round timer reaches zero.',
      'Choose between 3 board configurations: 3x4 (Casual), 4x4 (Standard), 4x5 (Master).',
    ],
    rules: 'Mismatched cards flip back after a brief glance. Keep track of locations to maximize your speed bonus.',
  },
  {
    id: 'color-rush',
    title: 'Color Rush',
    tagline: 'Beat the Stroop effect! Match colors at lightning speed.',
    category: 'Reflex',
    difficulty: 'Adaptive',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/arcade_hero_banner_1793772302943.jpg',
    color: '#f59e0b',
    controls: {
      desktop: 'Keys 1-4 or click the corresponding color buttons',
      mobile: 'Tap the matching color tile rapidly',
    },
    instructions: [
      'Read the instruction carefully: either "MATCH INK COLOR" or "MATCH TEXT WORD".',
      'Select the corresponding color option before the fuse timer burns down.',
      'Each correct tap adds time to the clock and raises your streak multiplier.',
      'One wrong answer or timing out instantly ends your streak.',
    ],
    rules: 'The game challenges brain-eye coordination by switching between linguistic and chromatic perception.',
  },
  {
    id: 'number-puzzle',
    title: 'Number Puzzle',
    tagline: 'Slide and combine numerical tiles to construct 2048 and beyond!',
    category: 'Puzzle',
    difficulty: 'Medium',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/arcade_hero_banner_1793772302943.jpg',
    color: '#d97706',
    controls: {
      desktop: 'Arrow keys (Up, Down, Left, Right) or W, A, S, D',
      mobile: 'Swipe in 4 directions on the grid or tap direction arrows',
    },
    instructions: [
      'Slide all tiles across the 4x4 grid in one direction.',
      'When two tiles with the same number collide, they merge into their sum.',
      'Score equals the sum of all merged tiles created.',
      'Keep open spaces clear so new numbers can spawn.',
    ],
    rules: 'The game ends when the board fills and no adjacent tiles can merge. Use the Undo move feature wisely.',
  },
  {
    id: 'tap-challenge',
    title: 'Tap Challenge',
    tagline: 'Unleash extreme finger speed in pure CPS & reflex target tests!',
    category: 'Reflex',
    difficulty: 'Adaptive',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/fruit_slice_thumb_1793772303367.jpg',
    color: '#ec4899',
    controls: {
      desktop: 'Left Click or Spacebar as fast as humanly possible',
      mobile: 'Rapidly tap the central target pad with alternating fingers',
    },
    instructions: [
      'Choose between 10-Second CPS Frenzy or Whack Target speed test.',
      'In CPS Frenzy: tap like lightning to achieve pro esports CPS (Clicks Per Second).',
      'In Target Whack: tap neon targets before they disappear; avoid skull targets.',
      'Receive official speed tier certifications from Novice to Demigod.',
    ],
    rules: 'Real-time CPS counter with combo burst multipliers and peak speed calculation.',
  },
  {
    id: 'block-puzzle',
    title: 'Block Puzzle',
    tagline: 'Fit polyomino geometric blocks into rows to clear lines!',
    category: 'Puzzle',
    difficulty: 'Hard',
    badge: 'ARCADE',
    thumbnail: '/src/assets/images/brick_breaker_thumb_1793772303650.jpg',
    color: '#14b8a6',
    controls: {
      desktop: 'Drag shapes into the 8x8 grid or click shape then click grid',
      mobile: 'Tap shape then tap the grid target position',
    },
    instructions: [
      'Place 3 given block shapes into the 8x8 grid.',
      'Fill complete horizontal rows or vertical columns to shatter them.',
      'Clearing multiple lines at once earns massive combo multipliers.',
      'Plan ahead! If none of your 3 current pieces can fit, the game ends.',
    ],
    rules: 'Pieces cannot be rotated. Clear rows to keep grid capacity open for large 3x3 and 5x1 blocks.',
  },
  {
    id: 'quick-reflex',
    title: 'Quick Reflex',
    tagline: 'Precision benchmark testing your visual reaction in milliseconds!',
    category: 'Reflex',
    difficulty: 'Adaptive',
    badge: 'FEATURED',
    thumbnail: '/src/assets/images/arcade_hero_banner_1793772302943.jpg',
    color: '#22c55e',
    controls: {
      desktop: 'Click mouse button or press Spacebar on signal',
      mobile: 'Tap the screen immediately when visual shifts to Green',
    },
    instructions: [
      'Wait in anticipation: screen will display RED and warning signals.',
      'At an unpredictable random interval (1.5 to 4.5 seconds), it flashes GREEN!',
      'Click or tap instantly when green appears.',
      'Tapping too early triggers a FALSE START penalty.',
    ],
    rules: '5 consecutive rounds test your consistent nervous system reaction speed and calculate your benchmark tier.',
  },
];

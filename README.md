# Arkanoid - Teams & Jira Edition

A modern web-based Arkanoid (brick breaker) game where blocks represent either Microsoft Teams calendar meetings or Jira tasks. Break your schedule and clear your backlog!

## How to Start

### Quick Start
1. **Download or clone** this repository to your local machine
2. **Open `index.html`** in any modern web browser
3. **Start playing!** No installation, build process, or server setup required

### Step-by-Step Instructions
```bash
# Option 1: Download and extract the ZIP file
# Then navigate to the extracted folder and open index.html

# Option 2: Clone with git (if available)
git clone [repository-url]
cd browser_game

# Option 3: Direct browser opening
# Simply double-click index.html in your file explorer
```

### Requirements
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **JavaScript enabled** (required for game functionality)
- **Local file access** (no internet connection needed)

### Troubleshooting
- **Game not loading?** Check browser console for errors (F12)
- **No sound?** Ensure browser allows audio autoplay
- **Controls not working?** Make sure JavaScript is enabled
- **Display issues?** Try refreshing the page or using a different browser

## Features

### Game Mechanics
- **Classic Arkanoid gameplay**: Ball, paddle, and blocks with physics-based collision detection
- **Mouse control**: Move your mouse to control the paddle
- **Multiple lives**: Start with 3 lives, lose one when ball falls off screen
- **Progressive difficulty**: Ball speed increases with each level
- **Particle effects**: Visual feedback when blocks are destroyed
- **Sound effects**: Audio feedback for collisions and events

### Data Integration (Mock)
- **Teams Mode**: Blocks represent calendar meetings with realistic data
  - Meeting titles, times, durations, and organizers
  - Color-coded by meeting length (short/medium/long)
  - Block strength based on meeting importance
  
- **Jira Mode**: Blocks represent project tasks with realistic data
  - Task keys, summaries, status, and priority levels
  - Color-coded by task status (To Do, In Progress, Done, etc.)
  - Block strength based on task priority

### Controls
- **Mouse**: Move paddle left/right
- **Click or Space**: Launch ball when ready
- **Space**: Pause/resume game during play
- **Toggle Switch**: Switch between Teams and Jira modes
- **Settings**: Adjust difficulty and ball speed

## How to Play

1. **Start the Game**: Click "Start Game" or press Space
2. **Control Paddle**: Move your mouse to control the paddle position
3. **Launch Ball**: Click or press Space to launch the ball
4. **Break Blocks**: Hit blocks with the ball to destroy them
   - Some blocks require multiple hits (shown with numbers)
   - Different colored blocks represent different meeting types or task priorities
5. **Switch Modes**: Use the toggle switch to switch between Teams and Jira
6. **Win Condition**: Clear all blocks to advance to the next level
7. **Game Over**: Game ends when you lose all lives

## Technical Details

### Architecture
- **Vanilla JavaScript**: No external dependencies
- **Canvas-based rendering**: Smooth 60 FPS gameplay
- **Component-based structure**: Modular game objects (Ball, Paddle, Block)
- **Physics engine**: Custom collision detection and ball physics
- **Mock API services**: Simulated Teams and Jira data

### File Structure
```
/
├── index.html              # Main HTML file
├── styles/
│   └── game.css           # Game styling
├── src/
│   ├── components/
│   │   ├── Game.js        # Main game class
│   │   ├── Ball.js        # Ball physics and rendering
│   │   ├── Paddle.js      # Paddle control and rendering
│   │   └── Block.js       # Block logic and rendering
│   ├── services/
│   │   ├── authService.js # Mock authentication
│   │   ├── teamsService.js # Mock Teams API
│   │   └── jiraService.js # Mock Jira API
│   ├── utils/
│   │   ├── physics.js     # Physics calculations
│   │   └── gameHelpers.js # Utility functions
│   └── app.js            # Application initialization
└── README.md
```

### Mock Data
- **Teams**: 20 different meeting types with realistic titles, times, and durations
- **Jira**: 40 different task summaries with various statuses and priorities
- **Authentication**: Simulated login process with loading states
- **API Delays**: Realistic loading times to simulate real API calls

## Customization

### Adding Real API Integration
The game is structured to easily integrate with real APIs:

```javascript
// Example: Load real Teams data
const realMeetings = await fetch('/api/teams/meetings').then(r => r.json());
arkanoidApp.loadRealData('teams', realMeetings);

// Example: Load real Jira data
const realTasks = await fetch('/api/jira/tasks').then(r => r.json());
arkanoidApp.loadRealData('jira', realTasks);
```

### Game Settings
- **Difficulty levels**: Easy, Normal, Hard
- **Ball speed**: Adjustable from 3-8
- **Block strength**: Based on meeting duration or task priority
- **Visual themes**: Teams (purple) and Jira (blue) themed backgrounds

## Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Canvas support**: Required for game rendering
- **Audio support**: Optional for sound effects
- **Responsive**: Adapts to different screen sizes

## Future Enhancements
- Real API integration with OAuth authentication
- Power-ups (multi-ball, larger paddle, slow-motion)
- High score tracking and leaderboards
- Custom themes and visual effects
- Mobile touch controls
- Multiplayer support

---

**Note**: This game uses mock data to simulate Teams and Jira integration. No real API calls are made, and no actual calendar or task data is accessed.
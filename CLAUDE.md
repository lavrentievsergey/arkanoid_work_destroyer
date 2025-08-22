# Claude Memory - Arkanoid Calendar & Jira Game

## Project Overview
This is a web-based Arkanoid (brick breaker) game where blocks represent calendar meetings or Jira tasks. The game uses **mock data only** - no real API integrations with Calendar or Jira are implemented.

## Key Design Decisions

### Mock Integration Approach
- **No real API calls**: All Calendar and Jira data is simulated with realistic mock data
- **Authentication simulation**: Mock login flows with loading states for realistic UX
- **Realistic UI overlays**: Calendar shows actual calendar with weekdays/dates, Jira shows kanban board columns
- **Automatic mode switching**: Game automatically alternates between Calendar and Jira modes each level

### Architecture
- **Vanilla JavaScript**: No external frameworks or dependencies
- **Canvas-based rendering**: HTML5 Canvas for smooth 60 FPS gameplay with HTML overlays
- **Component-based structure**: Separate classes for Game, Ball, Paddle, Block
- **Service layer**: Mock services for Calendar and Jira data generation
- **Event-driven system**: Random events add blocks dynamically during gameplay

### Game Mechanics
- **Physics-based collision**: Custom collision detection with realistic ball bouncing
- **Block strength system**: Based on meeting duration (Calendar) or task priority (Jira)
- **Progressive difficulty**: Ball speed and block count increase with each level
- **Random events**: New blocks appear dynamically with funny workplace notifications
- **Column-based positioning**: Blocks align to weekday columns (Calendar) or status columns (Jira)
- **Humorous messaging**: Context-aware jokes for level completion, difficulty increases, and game over
- **Automatic mode alternating**: Starting mode is random, then alternates between Calendar and Jira each level
- **Power-up system**: Random blocks can have good or bad powers that affect gameplay
- **Multi-ball physics**: Support for multiple balls with proper life management

## File Structure
```
/
├── index.html              # Main game interface
├── styles/game.css         # Complete styling with Calendar/Jira themes
├── src/
│   ├── components/
│   │   ├── Game.js        # Main game logic, state management, and power-up system
│   │   ├── Ball.js        # Ball physics and trail effects with multi-ball support
│   │   ├── Paddle.js      # Paddle control with gradient styling
│   │   └── Block.js       # Block rendering with data-specific content and power-up effects
│   ├── services/
│   │   ├── authService.js # Mock authentication for both services
│   │   ├── calendarService.js # Mock Calendar meeting data generation
│   │   ├── jiraService.js # Mock Jira task data generation
│   │   └── localizationService.js # Multi-language support (Russian/English)
│   ├── utils/
│   │   ├── physics.js     # Collision detection and physics calculations
│   │   └── gameHelpers.js # Utilities for colors, formatting, notifications
│   └── app.js            # Application initialization, event handling, and settings auto-pause
├── README.md              # User documentation
├── CLAUDE.md             # This file
└── .gitignore            # Git ignore rules for development
```

## Mock Data Details

### Calendar Mock Data
- **50+ meetings**: Generated across current week with realistic timing
- **20 meeting types**: Daily Standup, Sprint Planning, Code Review, etc.
- **Weekly distribution**: Meetings spread across Monday-Sunday columns
- **Meeting properties**: Subject, organizer, duration, attendee count, location
- **Block strength**: Determined by meeting duration (15-30min=1, 60-90min=2, 120min+=3)
- **Random count**: Each game starts with 10-20 blocks randomly distributed

### Jira Mock Data  
- **40+ different tasks**: Mix of bugs, stories, tasks, and improvements
- **7 workflow statuses**: To Do, In Progress, Awaiting MR, Ready for Testing, In Testing, Tested, Done
- **Priority levels**: Lowest, Low, Medium, High, Highest
- **Block strength**: Based on priority level (Low=1, Medium=2, High/Urgent=3)
- **Column distribution**: Tasks evenly spread across status columns regardless of original mock status
- **Random count**: Each game starts with 10-20 blocks randomly distributed

## Technical Implementation Notes

### Game Physics (`src/utils/physics.js`)
- **Collision detection**: AABB and circle-rectangle collision algorithms
- **Ball bouncing**: Realistic angle calculations based on paddle hit position
- **Velocity normalization**: Maintains consistent ball speed throughout gameplay

### Visual Design
- **Calendar theme**: Purple gradient background with realistic calendar overlay showing current week dates
- **Jira theme**: Blue gradient background with kanban board columns (To Do → Done)
- **UI layout**: Level, lives, and score centered with current mode display
- **Block styling**: Color-coded by meeting duration, task status/priority, or red for random events
- **Power-up effects**: White glow for good powers, black glow for bad powers
- **Animations**: Hit effects, destroy particles, ball trail, golden glow for random event blocks
- **Status bar**: Active power-up effects display with timers
- **Notifications**: Styled popups for random events, level completion, and difficulty warnings
- **Lightning animations**: Chain reaction effects between blocks
- **Explosion effects**: Multi-layered explosion animations with particles and debris

### Performance Optimizations
- **60 FPS target**: Uses `requestAnimationFrame` for smooth gameplay
- **Efficient rendering**: Only draws visible elements and active particles
- **Memory management**: Proper cleanup of destroyed blocks and expired particles
- **Smart positioning**: Efficient algorithms for finding available spaces for random event blocks

### Random Event System
- **Probability calculation**: Base 30% + 20% per level (capped at 90%)
- **Timing**: Events checked every 10 seconds during active gameplay
- **Dynamic block creation**: Finds suitable positions in appropriate columns
- **Visual distinction**: Random event blocks have red color and golden glow effect
- **Context-aware content**: Emergency meetings for Calendar, critical bugs for Jira

### Power-up System
- **Block power probability**: 70% chance for random event blocks, 20% for regular blocks
- **Power distribution**: 60% good powers, 40% bad powers
- **Good powers**:
  - **Multi-Ball**: Spawns 3 balls total, lives only lost when all balls are gone
  - **Explosion**: Destroys all blocks within 3-block radius with visual explosion effect
  - **Chain Reaction**: Next 3 hits damage 3 closest blocks with lightning animation
- **Bad powers**:
  - **Extra Blocks**: Spawns 3 additional blocks randomly on the field
  - **Chaos Ball**: Ball changes direction randomly every second for 5 seconds
  - **Tiny Ball**: Ball becomes smaller and 20% slower for 5 seconds
- **Status tracking**: Active effects shown in status bar with countdown timers
- **Settings toggle**: Power-ups can be disabled in settings panel
- **Visual feedback**: White glow for good powers, dark glow for bad powers

## Development Commands

### Running the Game
```bash
# Simply open in browser (no build process required)
open index.html
```

### Testing
```bash
# No automated tests implemented - manual testing recommended
# Game can be tested by opening index.html in any modern browser
```

### Code Style
- **ES6 classes**: Modern JavaScript class syntax
- **No build tools**: Direct browser execution without transpilation
- **Consistent formatting**: 4-space indentation, clear variable naming

## Gameplay Features

### Difficulty Progression
- **Ball speed**: Increases by 0.25 + (level * 0.1) per level (50% slower than original)
- **Block count**: 30% more blocks each level beyond the random starting amount
- **Level completion**: Shows humorous messages before difficulty warnings
- **Difficulty reset**: Game over resets level and ball speed to normal

### Humorous Messaging System
- **Level completion**: 6 different messages for each mode (Calendar/Jira)
- **Difficulty warnings**: 7 different workplace-themed messages for each mode
- **Game over messages**: 6 roasting messages for each mode
- **Random events**: 10 different emergency/urgent situation messages for each mode
- **Context-aware**: All messages match the current data source theme

### User Interface
- **Clean layout**: Level, lives, and score positioned with current mode display
- **Auto-pause**: Game automatically pauses when settings panel is opened
- **Settings panel**: Difficulty, ball speed, random blocks, and power-ups toggles
- **Language support**: Russian/English language switcher in header
- **Status bar**: Shows active power-up effects with countdown timers
- **Real-time updates**: UI elements update immediately when values change
- **Responsive overlays**: Calendar and kanban board backgrounds with proper column alignment
- **Visual feedback**: Notifications, animations, and particle effects enhance user experience

## Future Enhancement Ideas
- **Real API integration**: Replace mock services with actual Calendar/Jira APIs
- **Additional power-ups**: Paddle size changes, time effects, shield, laser
- **Leaderboards**: Score tracking and persistence
- **Mobile support**: Touch controls for mobile devices
- **Sound improvements**: Better audio effects and background music
- **Achievements system**: Unlock rewards for various gameplay milestones
- **Boss battles**: Special end-of-level challenges with unique mechanics

## Known Limitations
- **No persistence**: Game state is not saved between sessions
- **Mock data only**: No real calendar or task integration
- **Single player**: No multiplayer or collaborative features
- **Browser only**: Not packaged as desktop or mobile app
- **Limited randomization**: Block positions follow column constraints

## Maintenance Notes
- **Mock data refresh**: Update `getMockCalendarData()` and `getMockJiraData()` for variety
- **Visual themes**: Modify CSS gradients and colors in `game.css` for theme updates  
- **Game balance**: Adjust ball speed, block strength, and scoring in `Game.js`
- **Power-up tuning**: Modify power probabilities, durations, and effects in `Game.js` activatePowerUp methods
- **Power-up visuals**: Update glow effects, animations, and particles in `game.css` and `Block.js`
- **Sound effects**: Audio generation handled in `gameHelpers.js` with Web Audio API
- **Message updates**: Add/modify humorous messages in respective `getMessage()` methods
- **Random events**: Adjust probability calculations and timing in `checkRandomEvents()`
- **UI positioning**: Modify header layout in `index.html` and corresponding CSS
- **Localization**: Add new translations in `localizationService.js` for both languages

## Recent Updates

### Power-up System Implementation (Latest)
- **Comprehensive power-up system**: Added 6 different powers (3 good, 3 bad) with visual effects
- **Multi-ball support**: Complete multi-ball physics with proper life management
- **Power-up probability**: 70% chance for random events, 20% for regular blocks
- **Status bar**: Real-time display of active effects with countdown timers
- **Visual effects**: Lightning animations, explosion effects, glowing blocks
- **Settings toggle**: Power-ups can be disabled in game settings
- **Increased power frequency**: Significantly more powered blocks throughout gameplay

### UI and Quality of Life Improvements
- **Auto-pause settings**: Game automatically pauses when settings panel is opened
- **Smart resume**: Game only auto-resumes if it was auto-paused (respects manual pause)
- **Game state fixes**: Fixed game over issues with single ball loss in multi-ball mode
- **Duplicate method cleanup**: Removed duplicate gameOver() and levelComplete() methods
- **Enhanced status tracking**: Better game state management and effect tracking

### Previous Major Updates
- **Automatic Mode Switching**: Removed manual toggle, game now automatically alternates between Calendar and Jira each level
- **Random Starting Mode**: Each game starts with a randomly selected mode (Calendar or Jira)
- **Current Mode Display**: Added indicator showing which mode is currently active
- **Localization Support**: Added Russian and English language support with Russian as default
- **Language Toggle**: Added language switch toggle in the header UI
- **Translated Content**: All UI elements, game messages, and mock data now support both languages
- **Dynamic Language Switching**: Real-time language changes without page reload
- **Column-based layouts**: Added realistic Calendar calendar and Jira board backgrounds
- **Random starting blocks**: 10-20 blocks per game for better variety
- **Progressive difficulty**: Balanced speed increases and block count scaling
- **Random event system**: Dynamic block addition with workplace humor
- **Enhanced messaging**: Context-aware jokes for all game states
- **UI improvements**: Centered game info, better visual hierarchy
- **Difficulty reset**: Game over properly resets to normal difficulty
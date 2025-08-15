# Claude Memory - Arkanoid Teams & Jira Game

## Project Overview
This is a web-based Arkanoid (brick breaker) game where blocks represent Microsoft Teams calendar meetings or Jira tasks. The game uses **mock data only** - no real API integrations with Teams or Jira are implemented.

## Key Design Decisions

### Mock Integration Approach
- **No real API calls**: All Teams and Jira data is simulated with realistic mock data
- **Authentication simulation**: Mock login flows with loading states for realistic UX
- **Themed backgrounds**: Visual design emulates Teams (purple gradient) and Jira (blue gradient) interfaces
- **Data source toggle**: Switch between Teams and Jira modes affects block content and styling

### Architecture
- **Vanilla JavaScript**: No external frameworks or dependencies
- **Canvas-based rendering**: HTML5 Canvas for smooth 60 FPS gameplay
- **Component-based structure**: Separate classes for Game, Ball, Paddle, Block
- **Service layer**: Mock services for Teams and Jira data generation

### Game Mechanics
- **Physics-based collision**: Custom collision detection with realistic ball bouncing
- **Block strength system**: Based on meeting duration (Teams) or task priority (Jira)
- **Progressive difficulty**: Ball speed increases with each level
- **Visual feedback**: Particle effects, animations, and sound effects

## File Structure
```
/
├── index.html              # Main game interface
├── styles/game.css         # Complete styling with Teams/Jira themes
├── src/
│   ├── components/
│   │   ├── Game.js        # Main game logic and state management
│   │   ├── Ball.js        # Ball physics and trail effects  
│   │   ├── Paddle.js      # Paddle control with gradient styling
│   │   └── Block.js       # Block rendering with data-specific content
│   ├── services/
│   │   ├── authService.js # Mock authentication for both services
│   │   ├── teamsService.js # Mock Teams meeting data generation
│   │   └── jiraService.js # Mock Jira task data generation
│   ├── utils/
│   │   ├── physics.js     # Collision detection and physics calculations
│   │   └── gameHelpers.js # Utilities for colors, formatting, notifications
│   └── app.js            # Application initialization and event handling
├── README.md              # User documentation
└── CLAUDE.md             # This file
```

## Mock Data Details

### Teams Mock Data
- **20 meeting types**: Daily Standup, Sprint Planning, Code Review, etc.
- **Realistic timing**: Distributed throughout the day with appropriate durations
- **Meeting properties**: Subject, organizer, duration, attendee count, location
- **Block strength**: Determined by meeting duration (15-30min=1, 60-90min=2, 120min+=3)

### Jira Mock Data  
- **40 different tasks**: Mix of bugs, stories, tasks, and improvements
- **Realistic statuses**: To Do, In Progress, In Review, Testing, Done, Blocked
- **Priority levels**: Lowest, Low, Medium, High, Highest
- **Block strength**: Based on priority level (Low=1, Medium=2, High/Urgent=3)

## Technical Implementation Notes

### Game Physics (`src/utils/physics.js`)
- **Collision detection**: AABB and circle-rectangle collision algorithms
- **Ball bouncing**: Realistic angle calculations based on paddle hit position
- **Velocity normalization**: Maintains consistent ball speed throughout gameplay

### Visual Design
- **Teams theme**: Purple gradient background (#464775 to #6264a7) with calendar emoji
- **Jira theme**: Blue gradient background (#0052cc to #2684ff) with target emoji  
- **Block styling**: Color-coded by meeting duration or task status/priority
- **Animations**: Hit effects, destroy particles, ball trail, smooth transitions

### Performance Optimizations
- **60 FPS target**: Uses `requestAnimationFrame` for smooth gameplay
- **Efficient rendering**: Only draws visible elements and active particles
- **Memory management**: Proper cleanup of destroyed blocks and expired particles

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

## Future Enhancement Ideas
- **Real API integration**: Replace mock services with actual Teams/Jira APIs
- **Power-ups**: Multi-ball, paddle size changes, time effects
- **Leaderboards**: Score tracking and persistence
- **Mobile support**: Touch controls for mobile devices
- **Sound improvements**: Better audio effects and background music

## Known Limitations
- **No persistence**: Game state is not saved between sessions
- **Mock data only**: No real calendar or task integration
- **Single player**: No multiplayer or collaborative features
- **Browser only**: Not packaged as desktop or mobile app

## Maintenance Notes
- **Mock data refresh**: Update `getMockTeamsData()` and `getMockJiraData()` for variety
- **Visual themes**: Modify CSS gradients and colors in `game.css` for theme updates  
- **Game balance**: Adjust ball speed, block strength, and scoring in `Game.js`
- **Sound effects**: Audio generation handled in `gameHelpers.js` with Web Audio API
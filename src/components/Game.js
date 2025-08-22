class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'start';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.dataSource = Math.random() > 0.5 ? 'calendar' : 'jira';
        // Load random blocks setting from localStorage
        const savedRandomBlocks = localStorage.getItem('arkanoid_randomBlocks');
        this.randomBlocksEnabled = savedRandomBlocks !== null ? savedRandomBlocks === 'true' : true;
        
        // Load power-ups setting from localStorage
        const savedPowerUps = localStorage.getItem('arkanoid_powerUps');
        this.powerUpsEnabled = savedPowerUps !== null ? savedPowerUps === 'true' : true;
        
        this.paddle = new Paddle(
            this.width / 2 - 60, 
            this.height - 30, 
            120, 
            15, 
            this.width
        );
        
        this.ball = new Ball(
            this.width / 2, 
            this.height - 50, 
            8, 
            8
        );
        
        // Power-up system - initialize after ball is created
        this.activeEffects = new Map();
        this.balls = [this.ball]; // Array to support multi-ball
        this.originalBallRadius = this.ball.radius;
        this.originalBallSpeed = this.ball.speed;
        
        this.blocks = [];
        this.particles = [];
        this.mouseX = this.width / 2;
        
        this.keys = {};
        this.lastTime = 0;
        this.animationId = null;
        this.wasAutoPaused = false; // Track if game was auto-paused by mouse leave
        this.currentLevelSpeed = 8; // Track current level's ball speed
        this.pausedVelocity = null; // Store exact velocity during pause
        this.pausedSpeed = null; // Store exact speed during pause
        this.skipNextNormalization = false; // Flag to skip normalization after resume
        
        // Column definitions for positioning
        this.calendarColumns = this.getWeekDays();
        this.jiraColumns = ['To Do', 'In Progress', 'Blocked', 'Ready for Testing', 'Testing', 'Testing Completed', 'Done'];
        
        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.updateMessages();
            // Jira columns remain in English always
        });
        
        // Humorous messages
        this.levelCompleteMessages = this.getLevelCompleteMessages();
        this.difficultyWarningMessages = this.getDifficultyWarningMessages();
        this.randomEventMessages = this.getRandomEventMessages();
        this.gameOverMessages = this.getGameOverMessages();
        
        // Random event system
        this.lastEventTime = 0;
        this.eventInterval = 10000; // 10 seconds
        
        this.initEventListeners();
        this.generateCalendarHeader();
        this.createBlocks();
        this.switchDataSource(this.dataSource); // Initialize overlay
        this.updateCurrentModeDisplay();
    }
    
    updateMessages() {
        this.levelCompleteMessages = this.getLevelCompleteMessages();
        this.difficultyWarningMessages = this.getDifficultyWarningMessages();
        this.randomEventMessages = this.getRandomEventMessages();
        this.gameOverMessages = this.getGameOverMessages();
    }

    initEventListeners() {
        // Track mouse position globally for expanded pause area
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Update paddle position only if mouse is over canvas
            if (mouseX >= 0 && mouseX <= this.width && mouseY >= 0 && mouseY <= this.height) {
                this.mouseX = mouseX;
            }
            
            // Check if mouse is in expanded pause area (20% larger border)
            const borderSize = Math.max(this.width, this.height) * 0.2;
            const inExpandedArea = (
                mouseX >= -borderSize && 
                mouseX <= this.width + borderSize && 
                mouseY >= -borderSize && 
                mouseY <= this.height + borderSize
            );
            
            // Auto-pause logic with expanded area
            if (!inExpandedArea && this.gameState === 'playing') {
                this.autoPause();
            } else if (inExpandedArea && this.gameState === 'paused' && this.wasAutoPaused) {
                // Don't auto-resume if settings are open
                const settingsDropdown = document.querySelector('.settings-dropdown');
                const isSettingsOpen = settingsDropdown && !settingsDropdown.classList.contains('hidden');
                
                if (!isSettingsOpen) {
                    this.autoResume();
                }
            }
        });

        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing' && !this.ball.isLaunched) {
                this.ball.launch();
            }
        });

        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    if (!this.ball.isLaunched) {
                        this.ball.launch();
                    } else {
                        this.pauseGame();
                    }
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    getLevelCompleteMessages() {
        return {
            calendar: LocalizationService.tArray('levelCompleteCalendar'),
            jira: LocalizationService.tArray('levelCompleteJira')
        };
    }

    getDifficultyWarningMessages() {
        return {
            calendar: LocalizationService.tArray('difficultyWarningCalendar'),
            jira: LocalizationService.tArray('difficultyWarningJira')
        };
    }

    getRandomEventMessages() {
        return {
            calendar: LocalizationService.tArray('randomEventCalendar'),
            jira: LocalizationService.tArray('randomEventJira')
        };
    }

    getGameOverMessages() {
        return {
            calendar: LocalizationService.tArray('gameOverCalendar'),
            jira: LocalizationService.tArray('gameOverJira')
        };
    }

    getWeekDays() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        
        const weekDays = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Only weekdays
        
        for (let i = 0; i < 5; i++) { // Only 5 days (Mon-Fri)
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDays.push({
                name: dayNames[i],
                date: date.getDate(),
                month: date.getMonth() + 1,
                fullDate: date
            });
        }
        
        return weekDays;
    }

    generateCalendarHeader() {
        // Generate Calendar calendar header
        const calendarHeader = document.getElementById('calendarHeader');
        calendarHeader.innerHTML = '';
        
        this.calendarColumns.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'calendar-day-column';
            dayColumn.innerHTML = `
                <div class="calendar-day-name">${day.name}</div>
                <div class="calendar-day-date">${day.date}/${day.month}</div>
            `;
            calendarHeader.appendChild(dayColumn);
        });

        // Generate time slots for Calendar (left column)
        const timeColumn = document.getElementById('calendarTimeColumn');
        timeColumn.innerHTML = '';
        
        for (let hour = 8; hour <= 19; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'calendar-time-slot';
            timeSlot.textContent = `${hour}:00`;
            timeColumn.appendChild(timeSlot);
        }
        
        // Generate time slots for Calendar (right column)
        const timeColumnRight = document.getElementById('calendarTimeColumnRight');
        timeColumnRight.innerHTML = '';
        
        for (let hour = 8; hour <= 19; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'calendar-time-slot';
            timeSlot.textContent = `${hour}:00`;
            timeColumnRight.appendChild(timeSlot);
        }
    }

    createBlocks() {
        this.blocks = [];
        const mockData = this.dataSource === 'calendar' ? this.getMockCalendarData() : this.getMockJiraData();
        
        if (this.dataSource === 'calendar') {
            this.createCalendarBlocks(mockData);
        } else {
            this.createJiraBlocks(mockData);
        }
    }

    createCalendarBlocks(meetingsData) {
        // Headers are now outside game area, so blocks start at top of canvas
        const gameAreaTop = 0; // Blocks start at top of game area
        const gameAreaLeft = 0; // Blocks start at left edge of game area  
        const dayColumnWidth = this.width / 5; // Full canvas width divided by 5 days
        const timeSlotHeight = 40; // Match CSS height
        const workingHours = 12; // 8:00 to 19:00 = 12 hours
        const gameAreaHeight = this.height - 80; // Leave 80px for paddle area at bottom
        const baseBlocks = 10 + Math.floor(Math.random() * 11); // Random 10-20 blocks
        const maxBlocksPerDay = Math.min(baseBlocks + Math.floor(this.level * 2 * 1.3), 15); // Reduced max for better fit
        
        // Ensure we have enough meetings - create additional ones if needed
        const minMeetingsNeeded = Math.max(baseBlocks, 5); // At least 5 for one per day
        while (meetingsData.length < minMeetingsNeeded) {
            // Duplicate existing meetings with slight variations
            const originalMeeting = meetingsData[meetingsData.length % meetingsData.length];
            const additionalMeeting = {
                ...originalMeeting,
                subject: originalMeeting.subject + ' (Follow-up)',
                start: originalMeeting.start + (Math.random() * 3600000), // +/- 1 hour
                duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)] // Random duration
            };
            meetingsData.push(additionalMeeting);
        }
        
        // Group meetings by day of week, ensuring each day gets at least one block
        const meetingsByDay = {};
        this.calendarColumns.forEach((day, index) => {
            meetingsByDay[index] = [];
        });
        
        // First pass: Ensure each weekday gets at least one meeting
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
            meetingsByDay[dayIndex].push(meetingsData[dayIndex]);
        }
        
        // Second pass: Distribute remaining meetings randomly across days
        for (let meetingIndex = 5; meetingIndex < meetingsData.length; meetingIndex++) {
            const meeting = meetingsData[meetingIndex];
            const dayOfWeek = Math.floor(Math.random() * 5); // Random weekday (0-4)
            if (meetingsByDay[dayOfWeek].length < maxBlocksPerDay) {
                meetingsByDay[dayOfWeek].push(meeting);
            }
        }
        
        // Create blocks positioned by time slots within game area
        Object.keys(meetingsByDay).forEach(dayIndex => {
            const dayMeetings = meetingsByDay[dayIndex];
            const columnX = gameAreaLeft + parseInt(dayIndex) * dayColumnWidth;
            const usedTimeSlots = new Set(); // Track occupied time slots
            
            dayMeetings.forEach((meeting) => {
                // Calculate block height based on meeting duration
                let blockHeight;
                if (meeting.duration <= 30) {
                    blockHeight = timeSlotHeight / 2; // 0.5 hour
                } else if (meeting.duration <= 60) {
                    blockHeight = timeSlotHeight; // 1 hour
                } else {
                    blockHeight = timeSlotHeight * 2; // 2 hours
                }
                
                // Find available time slot within playable area - randomize starting position
                let timeSlot = -1;
                const slotsNeeded = Math.ceil(blockHeight / (timeSlotHeight / 2)); // How many half-slots needed
                const maxSlots = Math.floor(gameAreaHeight / (timeSlotHeight / 2)); // Available slots in game area
                
                // Create array of available slot ranges and shuffle them for random distribution
                const availableSlots = [];
                for (let slot = 0; slot <= maxSlots - slotsNeeded; slot++) {
                    let slotAvailable = true;
                    for (let i = 0; i < slotsNeeded; i++) {
                        if (usedTimeSlots.has(slot + i)) {
                            slotAvailable = false;
                            break;
                        }
                    }
                    if (slotAvailable) {
                        availableSlots.push(slot);
                    }
                }
                
                // Randomly select from available slots
                if (availableSlots.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableSlots.length);
                    timeSlot = availableSlots[randomIndex];
                    // Mark slots as used
                    for (let i = 0; i < slotsNeeded; i++) {
                        usedTimeSlots.add(timeSlot + i);
                    }
                }
                
                if (timeSlot >= 0) {
                    const x = columnX + 5;
                    const y = gameAreaTop + (timeSlot * timeSlotHeight / 2);
                    const width = dayColumnWidth - 10;
                    
                    if (y + blockHeight <= gameAreaHeight) { // Keep within game area
                        const block = new Block(x, y, width, blockHeight, meeting, this.dataSource);
                        
                        // Add power-up to regular blocks if enabled (lower chance than random events)
                        if (this.powerUpsEnabled && Math.random() < 0.2) { // 20% chance for power-up
                            block.powerType = Math.random() < 0.6 ? 'good' : 'bad'; // 60% good, 40% bad
                        }
                        
                        this.blocks.push(block);
                    }
                }
            });
        });
    }

    createJiraBlocks(tasksData) {
        const headerHeight = 60;
        const columnWidth = this.width / 7;
        const blockHeight = 60; // Further increased height for better Jira task styling
        const baseBlocks = 10 + Math.floor(Math.random() * 11); // Random 10-20 blocks
        
        // Group tasks by status
        const tasksByStatus = {};
        this.jiraColumns.forEach(status => {
            tasksByStatus[status] = [];
        });
        
        // 70% chance for no blocks in Done column
        const includeDone = Math.random() > 0.7;
        const availableColumns = includeDone ? this.jiraColumns : this.jiraColumns.slice(0, -1);
        
        // Distribute tasks with custom probabilities
        const shuffledTasks = [...tasksData].sort(() => Math.random() - 0.5);
        
        shuffledTasks.forEach((task, index) => {
            if (index >= baseBlocks) return; // Limit total blocks
            
            let targetColumn;
            const rand = Math.random();
            
            // Custom distribution logic
            if (rand < 0.5) {
                // Up to 50% chance for To Do
                targetColumn = 'To Do';
            } else if (rand < 0.6 && tasksByStatus['In Progress'].length === 0) {
                // Max 1 block in In Progress
                targetColumn = 'In Progress';
            } else if (rand < 0.7 && tasksByStatus['Blocked'].length < 4) {
                // Up to 4 blocks in Blocked
                targetColumn = 'Blocked';
            } else {
                // Equal chance for Ready for Testing, Testing, Testing Completed
                const testingColumns = ['Ready for Testing', 'Testing', 'Testing Completed'];
                if (includeDone) testingColumns.push('Done');
                targetColumn = testingColumns[Math.floor(Math.random() * testingColumns.length)];
            }
            
            // Fallback if target column is full or unavailable
            if (!availableColumns.includes(targetColumn) || 
                (targetColumn === 'In Progress' && tasksByStatus['In Progress'].length >= 1) ||
                (targetColumn === 'Blocked' && tasksByStatus['Blocked'].length >= 4)) {
                // Find first available column with space
                targetColumn = availableColumns.find(col => 
                    tasksByStatus[col].length < 8 && // Max 8 blocks per column
                    !(col === 'In Progress' && tasksByStatus[col].length >= 1) &&
                    !(col === 'Blocked' && tasksByStatus[col].length >= 4)
                ) || 'To Do';
            }
            
            // Override the task status to match the column
            task.status = targetColumn;
            tasksByStatus[targetColumn].push(task);
        });
        
        // Create blocks positioned in status columns - always stack from top
        this.jiraColumns.forEach((status, columnIndex) => {
            const columnTasks = tasksByStatus[status] || [];
            const columnX = columnIndex * columnWidth;
            
            columnTasks.forEach((task, blockIndex) => {
                const x = columnX + 5;
                const y = headerHeight + (blockIndex * (blockHeight + 8)); // Further increased spacing for bigger blocks
                const width = columnWidth - 10;
                
                if (y + blockHeight < this.height - 100) { // Leave space for paddle
                    const block = new Block(x, y, width, blockHeight, task, this.dataSource);
                    
                    // Add power-up to regular blocks if enabled (lower chance than random events)
                    if (this.powerUpsEnabled && Math.random() < 0.2) { // 20% chance for power-up
                        block.powerType = Math.random() < 0.6 ? 'good' : 'bad'; // 60% good, 40% bad
                    }
                    
                    this.blocks.push(block);
                }
            });
        });
    }

    getMockCalendarData() {
        const subjects = [
            "Daily Standup", "Sprint Planning", "Code Review", "Client Demo", "Team Lunch",
            "1:1 with Manager", "Architecture Review", "Bug Triage", "Release Meeting", "Team Retrospective"
        ];
        
        return subjects.map((subject, index) => ({
            subject: LocalizationService.t('meetingTypes.' + subject.replace(/\s+/g, '').replace(':', '')) || subject,
            start: Date.now() + (index + 1) * 3600000,
            duration: [30, 120, 45, 60, 60, 30, 90, 45, 60, 75][index]
        }));
    }

    getMockJiraData() {
        const statuses = ['To Do', 'In Progress', 'In Review', 'Testing', 'Done'];
        const priorities = ['lowest', 'low', 'medium', 'high', 'highest'];
        const issueTypes = ['story', 'bug', 'task', 'epic', 'subtask'];
        const assignees = ['JD', 'MS', 'AB', 'TK', 'RL', 'EM', 'PW', 'LM'];
        const tasks = [
            "Fix login bug", "Add dark mode", "Update API docs", "Optimize queries",
            "Write unit tests", "Refactor components", "Security audit", "Performance tuning",
            "Mobile responsive", "Error handling", "Data validation", "UI improvements",
            "Cache optimization", "Database migration", "Third-party integration"
        ];
        
        return tasks.map((task, index) => {
            const localizedTask = LocalizationService.t('taskTypes.' + task.replace(/\s+/g, '').toLowerCase()) || task;
            return {
                key: `PROJ-${1000 + index}`,
                summary: localizedTask,
                status: statuses[index % statuses.length],
                priority: priorities[index % priorities.length],
                issueType: issueTypes[index % issueTypes.length],
                assignee: assignees[index % assignees.length]
            };
        });
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameState !== 'playing') return;

        this.paddle.update(this.mouseX);
        this.ball.update(this.width, this.height, this.skipNextNormalization, deltaTime);
        if (this.skipNextNormalization) {
            this.skipNextNormalization = false;
        }

        if (this.ball.checkPaddleCollision(this.paddle)) {
            // Ball bounced off paddle
        }

        this.blocks = this.blocks.filter(block => {
            if (block.shouldRemove()) return false;
            
            block.update();
            
            if (!block.isDestroyed && this.ball.checkBlockCollision(block)) {
                const destroyed = block.hit();
                if (destroyed) {
                    this.score += block.getScore();
                    this.createParticles(block.x + block.width/2, block.y + block.height/2);
                    this.updateScore();
                }
            }
            
            return true;
        });

        this.updateParticles();

        if (this.ball.isOutOfBounds(this.height)) {
            this.lives--;
            this.updateLivesDisplay();
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }

        if (this.blocks.filter(b => !b.isDestroyed).length === 0) {
            this.levelComplete();
        }

        // Check for random events
        this.checkRandomEvents(currentTime);
    }

    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= 0.02;
            return particle.life > 0;
        });
    }

    checkRandomEvents(currentTime) {
        // Only trigger random events when ball is launched and moving, and if random blocks are enabled
        if (!this.ball.isLaunched || !this.randomBlocksEnabled) return;
        if (currentTime - this.lastEventTime < this.eventInterval) return;
        
        // Calculate probability: 0.3 base + 0.2 per level
        const baseProbability = 0.3;
        const levelBonus = (this.level - 1) * 0.2;
        const eventProbability = Math.min(baseProbability + levelBonus, 0.9); // Cap at 90%
        
        if (Math.random() < eventProbability) {
            this.triggerRandomEvent();
            this.lastEventTime = currentTime;
        }
    }

    triggerRandomEvent() {
        // Show notification popup
        const messages = this.randomEventMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        GameHelpers.showNotification(randomMessage, 'warning', 4000);
        
        // Add new random block
        this.addRandomBlock();
        
        // Play sound effect
        GameHelpers.playSound(800, 0.3, 'square');
    }

    addRandomBlock() {
        // Find a suitable position for a new block
        const availablePositions = this.findAvailableBlockPositions();
        
        if (availablePositions.length === 0) return; // No space available
        
        const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        
        // Create mock data for the new block
        let newBlockData;
        if (this.dataSource === 'calendar') {
            const meetingTypes = LocalizationService.tArray('emergencyMeetingTypes');
            newBlockData = {
                subject: meetingTypes[Math.floor(Math.random() * meetingTypes.length)],
                start: Date.now(),
                duration: 30
            };
        } else {
            const taskSummaries = LocalizationService.tArray('urgentTaskTypes');
            const statuses = ['To Do', 'In Progress', 'Awaiting MR'];
            const urgentPriorities = ['highest', 'high'];
            const urgentIssueTypes = ['bug', 'epic'];
            const assignees = ['JD', 'MS', 'AB', 'TK', 'RL', 'EM', 'PW', 'LM'];
            newBlockData = {
                key: `URGENT-${Date.now()}`,
                summary: taskSummaries[Math.floor(Math.random() * taskSummaries.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: urgentPriorities[Math.floor(Math.random() * urgentPriorities.length)],
                issueType: urgentIssueTypes[Math.floor(Math.random() * urgentIssueTypes.length)],
                assignee: assignees[Math.floor(Math.random() * assignees.length)]
            };
        }
        
        // Create and add the new block
        const newBlock = new Block(
            randomPosition.x,
            randomPosition.y,
            randomPosition.width,
            randomPosition.height,
            newBlockData,
            this.dataSource
        );
        
        // Add special visual effect for random blocks
        newBlock.isRandomEvent = true;
        newBlock.spawnTime = performance.now();
        
        // Add power-up to random blocks if enabled
        if (this.powerUpsEnabled && Math.random() < 0.7) { // 70% chance for power-up
            newBlock.powerType = Math.random() < 0.6 ? 'good' : 'bad'; // 60% good, 40% bad
        }
        
        this.blocks.push(newBlock);
    }

    findAvailableBlockPositions() {
        const positions = [];
        const blockHeight = this.dataSource === 'calendar' ? 35 : 60; // Updated Jira block height to 60px
        const headerHeight = this.dataSource === 'calendar' ? 80 : 60;
        const startY = this.dataSource === 'calendar' ? headerHeight + 20 : headerHeight; // Jira starts at header, Calendar has padding
        const maxY = this.height - 150; // Leave space for paddle
        
        if (this.dataSource === 'calendar') {
            const dayColumnWidth = this.width / 5; // Full game area width
            const timeSlotHeight = 40;
            const gameAreaHeight = this.height - 80; // Leave space for paddle
            const emergencyBlockHeight = timeSlotHeight; // Emergency meetings are 1 hour
            const maxSlots = Math.floor(gameAreaHeight / (timeSlotHeight / 2)); // Available slots in game area
            
            // Check each day column for available time slots within game area
            for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                const columnX = dayIndex * dayColumnWidth;
                
                // Check each time slot within game area
                for (let timeSlot = 0; timeSlot < maxSlots; timeSlot++) { // Half-hour slots
                    const y = timeSlot * timeSlotHeight / 2;
                    
                    if (y + emergencyBlockHeight > gameAreaHeight) break; // Stay within game area
                    
                    const hasBlock = this.blocks.some(block => 
                        !block.isDestroyed &&
                        block.x < columnX + dayColumnWidth - 5 &&
                        block.x + block.width > columnX + 5 &&
                        block.y < y + emergencyBlockHeight &&
                        block.y + block.height > y
                    );
                    
                    if (!hasBlock) {
                        positions.push({
                            x: columnX + 5,
                            y: y,
                            width: dayColumnWidth - 10,
                            height: emergencyBlockHeight
                        });
                    }
                }
            }
        } else {
            const columnWidth = this.width / 7;
            
            // Check each status column for available space - prioritize top positions
            for (let colIndex = 0; colIndex < 7; colIndex++) {
                const columnX = colIndex * columnWidth;
                
                // Find the highest available position in this column
                let highestAvailableY = startY;
                
                // Get all blocks in this column sorted by Y position
                const columnBlocks = this.blocks
                    .filter(block => 
                        !block.isDestroyed &&
                        block.x < columnX + columnWidth - 5 &&
                        block.x + block.width > columnX + 5
                    )
                    .sort((a, b) => a.y - b.y);
                
                // If no blocks in column, use start position
                if (columnBlocks.length === 0) {
                    positions.push({
                        x: columnX + 5,
                        y: highestAvailableY,
                        width: columnWidth - 10,
                        height: blockHeight
                    });
                } else {
                    // Find gaps between blocks, starting from top
                    let currentY = startY;
                    
                    for (let block of columnBlocks) {
                        if (block.y - currentY >= blockHeight + 8) {
                            // There's a gap here
                            positions.push({
                                x: columnX + 5,
                                y: currentY,
                                width: columnWidth - 10,
                                height: blockHeight
                            });
                            break; // Only add the highest available position per column
                        }
                        currentY = block.y + block.height + 8;
                    }
                    
                    // If no gaps found, add position below the last block
                    if (currentY < maxY) {
                        positions.push({
                            x: columnX + 5,
                            y: currentY,
                            width: columnWidth - 10,
                            height: blockHeight
                        });
                    }
                }
            }
        }
        
        return positions;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.drawGameObjects();
        }
        
        this.drawUI();
    }

    drawBackground() {
        if (this.dataSource === 'calendar') {
            this.drawCalendarBackground();
            this.showCalendarOverlay();
        } else {
            this.drawJiraBackground();
            this.showJiraOverlay();
        }
    }

    showCalendarOverlay() {
        document.getElementById('calendarOverlay').style.display = 'block';
        document.getElementById('jiraOverlay').style.display = 'none';
    }

    showJiraOverlay() {
        document.getElementById('calendarOverlay').style.display = 'none';
        document.getElementById('jiraOverlay').style.display = 'block';
    }

    drawCalendarBackground() {
        // Calendar background - darker space grey theme
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#37474f');
        gradient.addColorStop(1, '#455a64');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawJiraBackground() {
        // Jira board background - dark space grey theme
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#37474f');
        gradient.addColorStop(1, '#455a64');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Add subtle column separators
        const columnWidth = this.width / 7;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < 7; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * columnWidth, 0);
            this.ctx.lineTo(i * columnWidth, this.height);
            this.ctx.stroke();
        }
    }

    drawGameObjects() {
        this.blocks.forEach(block => block.draw(this.ctx));
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            const size = particle.size || 4;
            
            // Draw different particle types
            switch(particle.type) {
                case 'explosion-flash':
                    this.ctx.shadowColor = '#FFFFFF';
                    this.ctx.shadowBlur = size;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                case 'explosion-ring':
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.shadowColor = particle.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                    
                case 'explosion-shockwave':
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.globalAlpha = particle.life * 0.5;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                    
                case 'lightning':
                    this.ctx.shadowColor = '#00FFFF';
                    this.ctx.shadowBlur = size * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                case 'lightning-flash':
                    this.ctx.shadowColor = '#FFFFFF';
                    this.ctx.shadowBlur = size * 3;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                    
                default:
                    // Default particle (including explosion-fire and explosion-debris)
                    this.ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
                    break;
            }
            
            this.ctx.restore();
        });
        
        this.paddle.draw(this.ctx);
        
        // Draw all balls
        this.balls.forEach(ball => ball.draw(this.ctx));
    }

    drawUI() {
        if (this.gameState === 'paused') {
            this.drawPauseOverlay();
        }
        // UI elements now handled by HTML elements in header
    }

    updateLivesDisplay() {
        const heartsDisplay = document.getElementById('heartsDisplay');
        heartsDisplay.textContent = '❤️'.repeat(this.lives);
    }

    updateLevelDisplay() {
        document.getElementById('levelValue').textContent = this.level;
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press SPACE to resume', this.width / 2, this.height / 2 + 50);
        this.ctx.textAlign = 'left';
    }

    gameLoop(currentTime) {
        this.update(currentTime);
        this.draw();
        
        if (this.gameState !== 'stopped') {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.currentLevelSpeed = 8; // Reset to base speed
        this.pausedVelocity = null; // Reset paused velocity
        this.dataSource = Math.random() > 0.5 ? 'calendar' : 'jira'; // Random start
        this.lastEventTime = 0; // Reset random events
        this.wasAutoPaused = false; // Reset auto-pause flag
        
        // Clear all active effects and status bar
        this.activeEffects.clear();
        this.updateStatusBar();
        
        // Reset ball properties to original values
        this.ball.radius = this.originalBallRadius;
        this.ball.setSpeed(this.currentLevelSpeed);
        
        this.updateScore();
        this.updateLivesDisplay();
        this.updateLevelDisplay();
        this.switchDataSource(this.dataSource);
        this.updateCurrentModeDisplay();
        this.resetBall();
        this.createBlocks();
        this.gameLoop(performance.now());
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.wasAutoPaused = false; // Manual pause, clear auto-pause flag
            // Store exact velocity and speed for manual pause too
            this.pausedVelocity = { 
                x: this.ball.velocity.x, 
                y: this.ball.velocity.y 
            };
            this.pausedSpeed = this.ball.speed;
            this.showScreen('pause-screen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.wasAutoPaused = false; // Manual resume, clear auto-pause flag
            
            // Restore exact velocity and speed
            if (this.pausedVelocity && this.ball.isLaunched) {
                this.ball.velocity.x = this.pausedVelocity.x;
                this.ball.velocity.y = this.pausedVelocity.y;
                this.ball.speed = this.pausedSpeed;
            }
            this.pausedVelocity = null;
            this.pausedSpeed = null;
            
            this.hideAllScreens();
            this.lastTime = performance.now(); // Reset timing to avoid jumps
            this.gameLoop(performance.now());
        }
    }

    autoPause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.wasAutoPaused = true;
            // Only store velocity/speed if ball is actually moving
            if (this.ball.isLaunched && (this.ball.velocity.x !== 0 || this.ball.velocity.y !== 0)) {
                this.pausedVelocity = { 
                    x: this.ball.velocity.x, 
                    y: this.ball.velocity.y 
                };
                this.pausedSpeed = this.ball.speed;
                const actualSpeed = Math.sqrt(this.ball.velocity.x * this.ball.velocity.x + this.ball.velocity.y * this.ball.velocity.y);
            } else {
                this.pausedVelocity = null;
                this.pausedSpeed = null;
            }
            this.showScreen('pause-screen');
        }
    }

    autoResume() {
        if (this.gameState === 'paused' && this.wasAutoPaused) {
            this.gameState = 'playing';
            this.wasAutoPaused = false;
            
            // Restore exact velocity and speed
            if (this.pausedVelocity && this.ball.isLaunched) {
                this.ball.velocity.x = this.pausedVelocity.x;
                this.ball.velocity.y = this.pausedVelocity.y;
                this.ball.speed = this.pausedSpeed; // Use the exact stored speed
                this.skipNextNormalization = true; // Skip normalization on next update
                const actualSpeed = Math.sqrt(this.ball.velocity.x * this.ball.velocity.x + this.ball.velocity.y * this.ball.velocity.y);
            }
            this.pausedVelocity = null;
            this.pausedSpeed = null;
            
            this.hideAllScreens();
            this.lastTime = performance.now(); // Reset timing to avoid jumps
            this.gameLoop(performance.now());
        }
    }


    proceedToNextLevel() {
        this.level++;
        // Alternate data source for each level
        this.dataSource = this.dataSource === 'calendar' ? 'jira' : 'calendar';
        this.switchDataSource(this.dataSource);
        this.updateLevelDisplay();
        
        // Show difficulty warning
        this.showDifficultyWarning();
    }

    showDifficultyWarning() {
        const messages = this.difficultyWarningMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const difficultyWarningMessageEl = document.getElementById('difficultyWarningMessage');
        const newLevelNumberEl = document.getElementById('newLevelNumber');
        
        if (difficultyWarningMessageEl) difficultyWarningMessageEl.textContent = randomMessage;
        if (newLevelNumberEl) newLevelNumberEl.textContent = this.level;
        
        // Hide level complete screen and show difficulty warning
        this.showScreen('difficulty-warning-screen');
    }

    startNextLevel() {
        // Increase difficulty - faster progression for early levels
        const speedIncrease = (this.level <= 3) ? 0.7 + (this.level * 0.1) : 0.4 + (this.level * 0.1);
        this.currentLevelSpeed = 8 + (this.level - 1) * speedIncrease; // Calculate absolute speed for this level
        this.ball.setSpeed(this.currentLevelSpeed);
        
        // Add more blocks with each level
        this.resetBall();
        this.createBlocks();
        this.hideAllScreens();
        
        this.gameState = 'playing';
        this.gameLoop(performance.now());
        
        if (this.level > 10) {
            setTimeout(() => this.gameWin(), 100);
        }
    }

    gameWin() {
        this.gameState = 'win';
        const winScoreEl = document.getElementById('winScore');
        if (winScoreEl) winScoreEl.textContent = this.score;
        this.showScreen('win-screen');
    }

    resetBall() {
        this.ball.reset(this.width / 2, this.height - 50);
        this.ball.setSpeed(this.currentLevelSpeed); // Ensure ball keeps current level speed
        
        // Reset balls array to contain only the main ball
        this.balls = [this.ball];
        
        // Clear multi-ball effect if it was active
        if (this.activeEffects.has('multiBall')) {
            this.removeEffect('multiBall');
        }
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    showScreen(screenClass) {
        document.querySelectorAll('.start-screen, .pause-screen, .game-over-screen, .win-screen, .level-complete-screen, .difficulty-warning-screen')
            .forEach(el => el.classList.add('hidden'));
        document.querySelector(`.${screenClass}`).classList.remove('hidden');
        document.getElementById('gameOverlay').classList.remove('hidden');
    }

    hideAllScreens() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }

    showSaluteAnimation() {
        // Create salute animation element
        const saluteContainer = document.createElement('div');
        saluteContainer.className = 'salute-animation';
        
        const saluteEmoji = document.createElement('div');
        saluteEmoji.className = 'salute-emoji';
        
        // Choose random salute emoji
        const saluteEmojis = ['🫡', '🎉', '🏆', '⭐', '💪', '🎊'];
        saluteEmoji.textContent = saluteEmojis[Math.floor(Math.random() * saluteEmojis.length)];
        
        saluteContainer.appendChild(saluteEmoji);
        document.body.appendChild(saluteContainer);
        
        // Remove animation after it completes
        setTimeout(() => {
            document.body.removeChild(saluteContainer);
        }, 3000);
        
        // Play celebration sound
        GameHelpers.playSound(800, 0.3, 'square');
        setTimeout(() => GameHelpers.playSound(1000, 0.3, 'square'), 200);
        setTimeout(() => GameHelpers.playSound(1200, 0.3, 'square'), 400);
    }

    switchDataSource(newSource) {
        this.dataSource = newSource;
        if (this.gameState === 'playing' || this.gameState === 'start') {
            this.createBlocks();
        }
        
        // Update overlays immediately
        if (newSource === 'calendar') {
            this.showCalendarOverlay();
        } else {
            this.showJiraOverlay();
        }
        this.updateCurrentModeDisplay();
    }
    
    updateCurrentModeDisplay() {
        const modeDisplay = document.getElementById('currentModeDisplay');
        if (modeDisplay) {
            const displayText = this.dataSource === 'calendar' 
                ? LocalizationService.t('calendar') 
                : LocalizationService.t('jira');
            modeDisplay.textContent = displayText;
        }
    }

    setRandomBlocksEnabled(enabled) {
        this.randomBlocksEnabled = enabled;
        // Save setting to localStorage
        localStorage.setItem('arkanoid_randomBlocks', enabled.toString());
    }

    setPowerUpsEnabled(enabled) {
        this.powerUpsEnabled = enabled;
        // Save setting to localStorage
        localStorage.setItem('arkanoid_powerUps', enabled.toString());
    }

    // Power-up system methods
    activateGoodPower() {
        const powers = ['multiBall', 'explosion', 'chainReaction'];
        const power = powers[Math.floor(Math.random() * powers.length)];
        
        switch(power) {
            case 'multiBall':
                this.activateMultiBall();
                break;
            case 'explosion':
                this.activateExplosion();
                break;
            case 'chainReaction':
                this.activateChainReaction();
                break;
        }
    }

    activateBadPower() {
        const powers = ['extraBlocks', 'randomDirection', 'smallerBall'];
        const power = powers[Math.floor(Math.random() * powers.length)];
        
        switch(power) {
            case 'extraBlocks':
                this.activateExtraBlocks();
                break;
            case 'randomDirection':
                this.activateRandomDirection();
                break;
            case 'smallerBall':
                this.activateSmallerBall();
                break;
        }
    }

    // Good Powers
    activateMultiBall() {
        if (this.activeEffects.has('multiBall')) return;
        
        // Create 2 additional balls
        for (let i = 0; i < 2; i++) {
            const newBall = new Ball(
                this.ball.x + (i * 20 - 10),
                this.ball.y,
                this.ball.radius,
                this.ball.speed
            );
            newBall.velocity = {
                x: this.ball.velocity.x + (Math.random() - 0.5) * 2,
                y: this.ball.velocity.y + (Math.random() - 0.5) * 1
            };
            newBall.isLaunched = this.ball.isLaunched;
            this.balls.push(newBall);
        }
        
        this.addEffect('multiBall', 0, 'good'); // Permanent until balls are lost
        GameHelpers.showNotification(LocalizationService.t('multiBall') + ' activated!', 'success');
    }

    activateExplosion() {
        this.addEffect('explosion', 1, 'good'); // Next ball hit triggers explosion
        GameHelpers.showNotification(LocalizationService.t('explosion') + ' ready!', 'success');
    }

    activateChainReaction() {
        this.addEffect('chainReaction', 3, 'good'); // Next 3 hits trigger chain reaction
        GameHelpers.showNotification(LocalizationService.t('chainReaction') + ' ready!', 'success');
    }

    // Bad Powers
    activateExtraBlocks() {
        const newBlocks = 3;
        const availablePositions = this.findAvailablePositions();
        
        for (let i = 0; i < Math.min(newBlocks, availablePositions.length); i++) {
            const pos = availablePositions[i];
            const blockData = this.dataSource === 'calendar' 
                ? this.createRandomCalendarEvent()
                : this.createRandomJiraEvent();
            
            const block = new Block(pos.x, pos.y, pos.width, pos.height, blockData, this.dataSource);
            block.isRandomEvent = true;
            this.blocks.push(block);
        }
        
        GameHelpers.showNotification(LocalizationService.t('extraBlocks') + ' spawned!', 'error');
    }

    activateRandomDirection() {
        if (this.activeEffects.has('randomDirection')) return;
        
        this.addEffect('randomDirection', 5000, 'bad'); // 5 seconds
        GameHelpers.showNotification(LocalizationService.t('randomDirection') + ' activated!', 'error');
    }

    activateSmallerBall() {
        if (this.activeEffects.has('smallerBall')) return;
        
        // Make all balls smaller and slower
        this.balls.forEach(ball => {
            ball.radius = this.originalBallRadius * 0.6;
            ball.setSpeed(this.originalBallSpeed * 0.7);
        });
        
        this.addEffect('smallerBall', 5000, 'bad'); // 5 seconds
        GameHelpers.showNotification(LocalizationService.t('smallerBall') + ' activated!', 'error');
    }

    // Effect management
    addEffect(name, duration, type) {
        const effect = {
            name: name,
            duration: duration,
            type: type,
            startTime: performance.now()
        };
        
        this.activeEffects.set(name, effect);
        this.updateStatusBar();
    }

    removeEffect(name) {
        this.activeEffects.delete(name);
        this.updateStatusBar();
        
        // Clean up effect
        if (name === 'smallerBall') {
            this.balls.forEach(ball => {
                ball.radius = this.originalBallRadius;
                ball.setSpeed(this.currentLevelSpeed);
            });
        }
    }

    updateStatusBar() {
        const statusBar = document.getElementById('statusBar');
        const activeEffectsEl = document.getElementById('activeEffects');
        
        if (this.activeEffects.size === 0) {
            statusBar.style.display = 'none';
            return;
        }
        
        statusBar.style.display = 'block';
        activeEffectsEl.innerHTML = '';
        
        this.activeEffects.forEach((effect, name) => {
            const effectEl = document.createElement('div');
            effectEl.className = `effect-item effect-${effect.type}`;
            
            const nameEl = document.createElement('span');
            nameEl.textContent = LocalizationService.t(name);
            effectEl.appendChild(nameEl);
            
            if (effect.duration > 0) {
                const timerEl = document.createElement('span');
                timerEl.className = 'effect-timer';
                const remaining = Math.max(0, effect.duration - (performance.now() - effect.startTime));
                timerEl.textContent = `${Math.ceil(remaining / 1000)}s`;
                effectEl.appendChild(timerEl);
            }
            
            activeEffectsEl.appendChild(effectEl);
        });
    }

    updateEffects(timestamp) {
        const effectsToRemove = [];
        
        this.activeEffects.forEach((effect, name) => {
            if (effect.duration > 0) {
                const elapsed = timestamp - effect.startTime;
                if (elapsed >= effect.duration) {
                    effectsToRemove.push(name);
                }
            }
        });
        
        effectsToRemove.forEach(name => this.removeEffect(name));
        
        // Handle random direction effect
        if (this.activeEffects.has('randomDirection')) {
            const effect = this.activeEffects.get('randomDirection');
            const elapsed = performance.now() - effect.startTime;
            
            // Change direction every 1 second
            if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16.67) / 1000)) {
                this.balls.forEach(ball => {
                    if (ball.isLaunched) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
                        ball.velocity.x = Math.cos(angle) * speed;
                        ball.velocity.y = Math.sin(angle) * speed;
                    }
                });
            }
        }
        
        this.updateStatusBar();
    }

    activatePowerUp(powerType) {
        if (powerType === 'good') {
            this.activateGoodPower();
        } else if (powerType === 'bad') {
            this.activateBadPower();
        }
    }

    handleSpecialEffects(block, ball) {
        // Handle explosion effect
        if (this.activeEffects.has('explosion')) {
            this.triggerExplosion(block.x + block.width/2, block.y + block.height/2);
            this.removeEffect('explosion');
        }
        
        // Handle chain reaction effect
        if (this.activeEffects.has('chainReaction')) {
            this.triggerChainReaction(block);
            const effect = this.activeEffects.get('chainReaction');
            effect.duration--;
            if (effect.duration <= 0) {
                this.removeEffect('chainReaction');
            }
        }
    }

    triggerExplosion(centerX, centerY) {
        const explosionRadius = 3; // 3 standard blocks
        const blockWidth = this.width / 7;
        const blockHeight = this.dataSource === 'calendar' ? 35 : 60;
        const radius = explosionRadius * Math.max(blockWidth, blockHeight);
        
        this.blocks.forEach(block => {
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const distance = Math.sqrt(
                Math.pow(blockCenterX - centerX, 2) + Math.pow(blockCenterY - centerY, 2)
            );
            
            if (distance <= radius) {
                if (block.hit()) {
                    this.score += block.getScore();
                    this.createParticles(blockCenterX, blockCenterY, block.color);
                }
            }
        });
        
        // Create explosion visual effect
        this.createExplosionEffect(centerX, centerY, radius);
        GameHelpers.playSound(880, 0.3, 'square');
    }

    triggerChainReaction(hitBlock) {
        const chainRadius = 100; // Distance to find closest blocks
        const hitCenterX = hitBlock.x + hitBlock.width / 2;
        const hitCenterY = hitBlock.y + hitBlock.height / 2;
        
        // Find 3 closest blocks
        const otherBlocks = this.blocks.filter(block => block !== hitBlock && !block.isDestroyed);
        const distances = otherBlocks.map(block => {
            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            return {
                block: block,
                distance: Math.sqrt(
                    Math.pow(blockCenterX - hitCenterX, 2) + Math.pow(blockCenterY - hitCenterY, 2)
                ),
                centerX: blockCenterX,
                centerY: blockCenterY
            };
        }).sort((a, b) => a.distance - b.distance).slice(0, 3);
        
        distances.forEach(({block, centerX, centerY}, index) => {
            setTimeout(() => {
                // Create lightning bolt from hit block to target block
                this.createLightningBolt(hitCenterX, hitCenterY, centerX, centerY);
                
                // Add block lightning effect
                block.lightningEffect = {
                    startTime: performance.now(),
                    duration: 300
                };
                
                if (block.hit()) {
                    this.score += block.getScore();
                    this.createParticles(centerX, centerY, block.color);
                }
                
                GameHelpers.playSound(660 + index * 110, 0.15);
            }, index * 100);
        });
    }

    createLightningBolt(startX, startY, endX, endY) {
        const segments = 8;
        const jaggedness = 20;
        
        // Create lightning particles
        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * jaggedness;
            const y = startY + (endY - startY) * progress + (Math.random() - 0.5) * jaggedness;
            
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 0.5,
                color: '#00FFFF',
                size: 2 + Math.random() * 2,
                type: 'lightning',
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= 0.08;
                    this.vx *= 0.9;
                    this.vy *= 0.9;
                }
            });
        }
        
        // Create bright flash particles along the bolt
        const mainBoltSegments = 5;
        for (let i = 0; i <= mainBoltSegments; i++) {
            const progress = i / mainBoltSegments;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 0.3,
                color: '#FFFFFF',
                size: 4,
                type: 'lightning-flash',
                update() {
                    this.life -= 0.1;
                    this.size *= 0.95;
                }
            });
        }
    }

    createExplosionEffect(x, y, radius) {
        // Create main explosion flash
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.3,
            color: '#FFFFFF',
            size: radius / 2,
            type: 'explosion-flash',
            update() {
                this.life -= 0.1;
                this.size *= 1.1;
            }
        });

        // Create explosion ring
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.5,
            color: '#FFD700',
            size: radius / 4,
            type: 'explosion-ring',
            update() {
                this.life -= 0.05;
                this.size *= 1.15;
            }
        });

        // Create fire particles
        const fireParticleCount = 30;
        for (let i = 0; i < fireParticleCount; i++) {
            const angle = (Math.PI * 2 * i) / fireParticleCount;
            const speed = 3 + Math.random() * 8;
            const colors = ['#FF4500', '#FF6500', '#FF8C00', '#FFD700', '#FFA500'];
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8 + Math.random() * 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 4,
                type: 'explosion-fire',
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= 0.02;
                    this.vx *= 0.92;
                    this.vy *= 0.92;
                    this.size *= 0.98;
                }
            });
        }

        // Create debris particles
        const debrisCount = 15;
        for (let i = 0; i < debrisCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: '#8B4513',
                size: 1 + Math.random() * 2,
                type: 'explosion-debris',
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += 0.1; // Gravity
                    this.life -= 0.015;
                    this.vx *= 0.98;
                }
            });
        }

        // Create shockwave effect
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.4,
            color: 'rgba(255, 255, 255, 0.3)',
            size: radius / 6,
            type: 'explosion-shockwave',
            update() {
                this.life -= 0.08;
                this.size *= 1.2;
            }
        });
    }

    findAvailablePositions() {
        const positions = [];
        const columnWidth = this.width / (this.dataSource === 'calendar' ? 5 : 7);
        const headerHeight = this.dataSource === 'calendar' ? 80 : 60;
        const blockHeight = this.dataSource === 'calendar' ? 35 : 60;
        const blockSpacing = 8;
        const gameAreaHeight = this.height - 100; // Leave space for paddle
        
        const columns = this.dataSource === 'calendar' ? 5 : 7;
        
        // Check each column for available positions
        for (let col = 0; col < columns; col++) {
            const columnX = col * columnWidth;
            
            // Find existing blocks in this column
            const blocksInColumn = this.blocks.filter(block => {
                return Math.abs(block.x - (columnX + 5)) < 10; // Same column
            }).sort((a, b) => a.y - b.y); // Sort by Y position
            
            // For Calendar mode - find random positions throughout the column
            if (this.dataSource === 'calendar') {
                const maxSlotsInColumn = Math.floor((gameAreaHeight - headerHeight) / (blockHeight + blockSpacing));
                
                for (let slot = 0; slot < maxSlotsInColumn; slot++) {
                    const y = headerHeight + (slot * (blockHeight + blockSpacing));
                    const proposedPosition = {
                        x: columnX + 5,
                        y: y,
                        width: columnWidth - 10,
                        height: blockHeight
                    };
                    
                    // Check if this position conflicts with existing blocks
                    const hasConflict = blocksInColumn.some(block => 
                        Math.abs(block.y - y) < blockHeight + 5
                    );
                    
                    if (!hasConflict) {
                        positions.push(proposedPosition);
                    }
                }
            } 
            // For Jira mode - stack from top
            else {
                let nextY = headerHeight;
                if (blocksInColumn.length > 0) {
                    const topBlock = blocksInColumn[blocksInColumn.length - 1];
                    nextY = topBlock.y + topBlock.height + blockSpacing;
                }
                
                // Add position if there's room
                if (nextY + blockHeight < gameAreaHeight) {
                    positions.push({
                        x: columnX + 5,
                        y: nextY,
                        width: columnWidth - 10,
                        height: blockHeight
                    });
                }
            }
        }
        
        return positions;
    }


    gameLoop(timestamp) {
        if (this.gameState !== 'playing') {
            // Continue checking for state changes but don't update game objects
            if (this.gameState === 'paused') {
                // Keep the animation frame running to check for unpause
                this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
            }
            return;
        }
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update effects
        this.updateEffects(timestamp);
        
        // Update game objects - handle multiple balls
        this.balls.forEach(ball => {
            ball.update(this.width, this.height, this.skipNextNormalization, deltaTime);
            ball.checkPaddleCollision(this.paddle);
        });
        
        this.paddle.update(this.mouseX);
        
        // Reset normalization flag
        this.skipNextNormalization = false;
        
        // Check block collisions for all balls
        this.balls.forEach(ball => {
            this.blocks.forEach(block => {
                if (ball.checkBlockCollision(block)) {
                    if (block.hit()) {
                        // Block was destroyed
                        this.score += block.getScore();
                        this.updateScore();
                        
                        // Handle power-up activation
                        if (block.powerType) {
                            this.activatePowerUp(block.powerType);
                        }
                        
                        // Handle special effects
                        this.handleSpecialEffects(block, ball);
                        
                        // Create destruction particles
                        this.createParticles(block.x + block.width/2, block.y + block.height/2, block.color);
                    }
                }
            });
        });
        
        // Remove balls that fell off screen
        const ballsBeforeFilter = this.balls.length;
        this.balls = this.balls.filter(ball => {
            if (ball.y > this.height + 50) {
                return false; // Remove this ball
            }
            return true; // Keep this ball
        });
        
        // Check if we lost all balls
        if (this.balls.length === 0) {
            this.lives--;
            this.updateLivesDisplay();
            
            if (this.lives <= 0) {
                this.gameOver();
                return;
            } else {
                this.resetBall();
            }
        } else {
            // Update main ball reference
            this.ball = this.balls[0];
            
            // Remove multi-ball effect if only one ball remains
            if (this.balls.length === 1 && this.activeEffects.has('multiBall')) {
                this.removeEffect('multiBall');
            }
        }
        
        // Update blocks and particles
        this.blocks.forEach(block => block.update());
        this.particles.forEach(particle => particle.update());
        
        // Remove destroyed blocks and collapse columns for Jira mode
        const blocksToRemove = [];
        this.blocks.forEach((block, index) => {
            if (block.shouldRemove()) {
                blocksToRemove.push(index);
            }
        });
        
        // Remove blocks in reverse order to maintain indices
        blocksToRemove.reverse().forEach(index => {
            const removedBlock = this.blocks[index];
            this.blocks.splice(index, 1);
            
            // Collapse columns only for Jira mode
            if (this.dataSource === 'jira') {
                this.collapseJiraColumn(removedBlock);
            }
        });
        
        // Remove old particles
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // Check for level completion
        if (this.blocks.length === 0) {
            this.levelComplete();
            return;
        }
        
        // Random events
        if (this.randomBlocksEnabled && timestamp - this.lastEventTime > this.eventInterval) {
            this.checkRandomEvents(timestamp);
        }
        
        // Draw everything
        this.draw();
        
        // Continue game loop
        this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    collapseJiraColumn(removedBlock) {
        if (!removedBlock.data || !removedBlock.data.status) return;
        
        const columnWidth = this.width / 7;
        const headerHeight = 60;
        const blockHeight = 60;
        const blockSpacing = 8;
        
        // Find which column the removed block belonged to
        const columnIndex = this.jiraColumns.indexOf(removedBlock.data.status);
        if (columnIndex === -1) return;
        
        const columnX = columnIndex * columnWidth;
        
        // Find all blocks in the same column that are below the removed block
        const blocksInColumn = this.blocks.filter(block => {
            return block.data && 
                   block.data.status === removedBlock.data.status &&
                   Math.abs(block.x - (columnX + 5)) < 10 && // Same column (within tolerance)
                   block.y > removedBlock.y; // Below the removed block
        });
        
        // Sort blocks by Y position (top to bottom)
        blocksInColumn.sort((a, b) => a.y - b.y);
        
        // Move each block up by one block height + spacing
        blocksInColumn.forEach(block => {
            block.y -= (blockHeight + blockSpacing);
        });
    }

    createParticles(x, y, color) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= 0.02;
                    this.vx *= 0.98;
                    this.vy *= 0.98;
                }
            });
        }
    }

    updateLivesDisplay() {
        const livesElement = document.getElementById('livesValue');
        if (livesElement) {
            livesElement.textContent = '❤️'.repeat(this.lives);
        }
    }

    updateLevelDisplay() {
        const levelElement = document.getElementById('levelValue');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // Reset difficulty to normal for next game
        this.level = 1;
        this.currentLevelSpeed = 8;
        this.ball.setSpeed(this.currentLevelSpeed);
        this.updateLevelDisplay();
        
        // Clear all active effects
        this.activeEffects.clear();
        this.updateStatusBar();
        
        // Reset balls array to contain only the main ball
        this.balls = [this.ball];
        
        // Reset ball properties
        this.ball.radius = this.originalBallRadius;
        this.ball.speed = this.currentLevelSpeed;
        
        // Select random game over message
        const messages = this.gameOverMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const gameOverMessageEl = document.getElementById('gameOverMessage');
        const finalScoreEl = document.getElementById('finalScore');
        
        if (gameOverMessageEl) gameOverMessageEl.textContent = randomMessage;
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        
        this.showScreen('game-over-screen');
    }

    levelComplete() {
        this.gameState = 'levelComplete';
        
        // Show salute animation
        this.showSaluteAnimation();
        
        // Select random level complete message
        const messages = this.levelCompleteMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const levelCompleteMessageEl = document.getElementById('levelCompleteMessage');
        const levelScoreEl = document.getElementById('levelScore');
        
        if (levelCompleteMessageEl) levelCompleteMessageEl.textContent = randomMessage;
        if (levelScoreEl) levelScoreEl.textContent = this.score;
        
        setTimeout(() => {
            this.showScreen('level-complete-screen');
        }, 1000);
    }

    checkRandomEvents(timestamp) {
        if (this.gameState !== 'playing') return;
        
        // Calculate probability: base 30% + 20% per level, capped at 90%
        const baseProbability = 0.3;
        const levelBonus = Math.min(this.level * 0.2, 0.6);
        const eventProbability = baseProbability + levelBonus;
        
        if (Math.random() < eventProbability) {
            this.addRandomEventBlock();
            this.lastEventTime = timestamp;
        }
    }

    addRandomEventBlock() {
        const availablePositions = this.findAvailablePositions();
        if (availablePositions.length === 0) return;
        
        const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        
        // Create random event block data
        const randomEventData = this.dataSource === 'calendar' 
            ? this.createRandomCalendarEvent()
            : this.createRandomJiraEvent();
        
        const block = new Block(
            randomPosition.x,
            randomPosition.y,
            randomPosition.width,
            randomPosition.height,
            randomEventData,
            this.dataSource
        );
        
        block.isRandomEvent = true;
        block.spawnTime = performance.now();
        
        // Add power-up to random blocks if enabled
        if (this.powerUpsEnabled && Math.random() < 0.7) { // 70% chance for power-up
            block.powerType = Math.random() < 0.6 ? 'good' : 'bad'; // 60% good, 40% bad
        }
        
        this.blocks.push(block);
        
        // Show notification
        const messages = this.randomEventMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        GameHelpers.showNotification(randomMessage, 'warning');
    }

    createRandomCalendarEvent() {
        const emergencyTypes = LocalizationService.tArray('emergencyMeetingTypes');
        const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
        
        return {
            subject: randomType,
            start: Date.now(),
            duration: 30,
            organizer: 'Emergency Scheduler',
            attendees: Math.floor(Math.random() * 5) + 2
        };
    }

    createRandomJiraEvent() {
        const urgentTypes = LocalizationService.tArray('urgentTaskTypes');
        const randomType = urgentTypes[Math.floor(Math.random() * urgentTypes.length)];
        
        return {
            key: 'URG-' + Math.floor(Math.random() * 1000),
            summary: randomType,
            priority: 'highest',
            status: this.dataSource === 'jira' ? this.jiraColumns[Math.floor(Math.random() * (this.jiraColumns.length - 1))] : 'To Do',
            issueType: 'bug',
            assignee: 'YOU'
        };
    }

    stop() {
        this.gameState = 'stopped';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
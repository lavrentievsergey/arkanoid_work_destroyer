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
        this.dataSource = 'teams';
        
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
            5
        );
        
        this.blocks = [];
        this.particles = [];
        this.mouseX = this.width / 2;
        
        this.keys = {};
        this.lastTime = 0;
        this.animationId = null;
        
        // Column definitions for positioning
        this.teamsColumns = this.getWeekDays();
        this.jiraColumns = ['To Do', 'In Progress', 'Awaiting MR', 'Ready for Testing', 'In Testing', 'Tested', 'Done'];
        
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
    }

    initEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
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
        const teams = [
            "This week is done, give me another one!",
            "Meeting marathon completed! Ready for round two?",
            "Calendar cleared! Time for more 'urgent' discussions?",
            "All syncs synced! Bring on the next wave of productivity theater!",
            "Week's schedule demolished! Who's ready for more back-to-back calls?",
            "Meetings: 0, Productivity: Questionable. Next week please!"
        ];
        
        const jira = [
            "Sprint completed! Ready for more 'quick wins'?",
            "Backlog cleared! Time for some new technical debt!",
            "All tasks done! Waiting for the next 'urgent' priority shuffle...",
            "Board cleaned up! Ready for more scope creep?",
            "Stories completed! Time for the PM to add 'just one more feature'?",
            "Done column is full! Bring on the next impossible deadline!"
        ];
        
        return { teams, jira };
    }

    getDifficultyWarningMessages() {
        const teams = [
            "I finished your work too fast, take some more meetings!",
            "Hey pal, a new manager assigned you more calls!",
            "Congratulations! You are rewarded with more work to do!",
            "Efficiency detected! Time for some additional 'alignment' sessions!",
            "Great job! Here's your prize: more status updates!",
            "Performance review says you need more collaborative opportunities!",
            "Success! Your reward is a packed calendar next week!"
        ];
        
        const jira = [
            "I finished your work too fast, take some more tasks!",
            "Hey pal, a new product manager assigned you more tickets!",
            "Congratulations! You are rewarded with more work to do!",
            "Velocity too high! Time for some additional complexity!",
            "Great job! Here's your bonus: more edge cases to handle!",
            "Stand-up feedback: You need more 'challenging' user stories!",
            "Achievement unlocked: Even more technical debt to resolve!"
        ];
        
        return { teams, jira };
    }

    getRandomEventMessages() {
        const teams = [
            "🚨 Oops! HR wants a 1-on-1 ASAP",
            "📞 Emergency! Client called for an 'urgent' 15-min chat",
            "⚡ Breaking: Manager scheduled a quick sync about syncing",
            "🔥 Hot off the press: Another 'brief' status update meeting",
            "📅 Plot twist: Mandatory team building session appeared!",
            "🎯 Surprise! Last-minute demo prep meeting materialized",
            "☕ Alert: Coffee chat turned into strategic planning session",
            "📊 News flash: Stakeholder wants to 'align on priorities'",
            "🤝 Incoming: Cross-team collaboration opportunity (aka more meetings)",
            "🎪 Ta-da! Another 'quick' brainstorming session spawned"
        ];
        
        const jira = [
            "🚨 Oops! Critical bug just crawled out of production",
            "🔥 Breaking: 'Simple' task got 5 new acceptance criteria",
            "⚡ Emergency! Stakeholder remembered one tiny requirement",
            "📈 Plot twist: QA found edge cases in your edge cases",
            "🎯 Surprise! Security review revealed 'minor' concerns",
            "🤔 Alert: Product owner had a 'brilliant' idea at 3 AM",
            "📊 News flash: Designer wants to 'improve user experience'",
            "🔧 Incoming: DevOps needs you to 'quickly' fix the pipeline",
            "🎪 Ta-da! Another 'high priority' ticket appeared",
            "⭐ Magic! Technical debt decided to compound itself"
        ];
        
        return { teams, jira };
    }

    getGameOverMessages() {
        const teams = [
            "You are pathetic, AI will do your job.",
            "Maybe stick to playing solitaire during meetings?",
            "Performance review: Needs improvement... in everything.",
            "Don't worry, we'll just hire more consultants.",
            "Your calendar management skills are as bad as your gameplay.",
            "Time to update your LinkedIn - 'Former Meeting Destroyer'."
        ];
        
        const jira = [
            "You are pathetic, AI will do your job.",
            "Maybe coding isn't for you? Try product management.",
            "Error 404: Programming skills not found.",
            "Don't worry, we'll just outsource your tasks.",
            "Your bug-squashing skills need some debugging.",
            "Time to update your resume - 'Former Task Terminator'."
        ];
        
        return { teams, jira };
    }

    getWeekDays() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        
        const weekDays = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 0; i < 7; i++) {
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
        // Generate Teams calendar header
        const teamsHeader = document.getElementById('teamsHeader');
        teamsHeader.innerHTML = '';
        
        this.teamsColumns.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'teams-day-column';
            dayColumn.innerHTML = `
                <div class="teams-day-name">${day.name}</div>
                <div class="teams-day-date">${day.date}/${day.month}</div>
            `;
            teamsHeader.appendChild(dayColumn);
        });

        // Generate time slots for Teams
        const timeColumn = document.getElementById('teamsTimeColumn');
        timeColumn.innerHTML = '';
        
        for (let hour = 8; hour <= 18; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'teams-time-slot';
            timeSlot.textContent = `${hour}:00`;
            timeColumn.appendChild(timeSlot);
        }
    }

    createBlocks() {
        this.blocks = [];
        const mockData = this.dataSource === 'teams' ? this.getMockTeamsData() : this.getMockJiraData();
        
        if (this.dataSource === 'teams') {
            this.createTeamsBlocks(mockData);
        } else {
            this.createJiraBlocks(mockData);
        }
    }

    createTeamsBlocks(meetingsData) {
        const headerHeight = 80;
        const timeColumnWidth = 40;
        const dayColumnWidth = (this.width - timeColumnWidth) / 7;
        const blockHeight = 35;
        const baseBlocks = 10 + Math.floor(Math.random() * 11); // Random 10-20 blocks
        const maxBlocksPerDay = Math.min(baseBlocks + Math.floor(this.level * 2 * 1.3), 25); // 30% more blocks per level
        
        // Group meetings by day of week
        const meetingsByDay = {};
        this.teamsColumns.forEach((day, index) => {
            meetingsByDay[index] = [];
        });
        
        meetingsData.forEach(meeting => {
            const meetingDate = new Date(meeting.start);
            const dayOfWeek = (meetingDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            if (meetingsByDay[dayOfWeek] && meetingsByDay[dayOfWeek].length < maxBlocksPerDay) {
                meetingsByDay[dayOfWeek].push(meeting);
            }
        });
        
        // Create blocks positioned in day columns
        Object.keys(meetingsByDay).forEach(dayIndex => {
            const dayMeetings = meetingsByDay[dayIndex];
            const columnX = timeColumnWidth + parseInt(dayIndex) * dayColumnWidth;
            
            dayMeetings.forEach((meeting, blockIndex) => {
                const x = columnX + 5;
                const y = headerHeight + 20 + (blockIndex * (blockHeight + 5));
                const width = dayColumnWidth - 10;
                
                if (y + blockHeight < this.height - 100) { // Leave space for paddle
                    const block = new Block(x, y, width, blockHeight, meeting, this.dataSource);
                    this.blocks.push(block);
                }
            });
        });
    }

    createJiraBlocks(tasksData) {
        const headerHeight = 60;
        const columnWidth = this.width / 7;
        const blockHeight = 30;
        const baseBlocks = 10 + Math.floor(Math.random() * 11); // Random 10-20 blocks
        const maxBlocksPerColumn = Math.min(baseBlocks + Math.floor(this.level * 2 * 1.3), 28); // 30% more blocks per level
        
        // Group tasks by status
        const tasksByStatus = {};
        this.jiraColumns.forEach(status => {
            tasksByStatus[status] = [];
        });
        
        // Distribute tasks evenly across columns instead of grouping by original status
        let currentColumn = 0;
        tasksData.forEach(task => {
            const statusKey = this.jiraColumns[currentColumn];
            if (tasksByStatus[statusKey].length < maxBlocksPerColumn) {
                // Override the task status to match the column
                task.status = statusKey;
                tasksByStatus[statusKey].push(task);
                currentColumn = (currentColumn + 1) % this.jiraColumns.length;
            }
        });
        
        // Create blocks positioned in status columns
        this.jiraColumns.forEach((status, columnIndex) => {
            const columnTasks = tasksByStatus[status] || [];
            const columnX = columnIndex * columnWidth;
            
            columnTasks.forEach((task, blockIndex) => {
                const x = columnX + 5;
                const y = headerHeight + 20 + (blockIndex * (blockHeight + 3));
                const width = columnWidth - 10;
                
                if (y + blockHeight < this.height - 100) { // Leave space for paddle
                    const block = new Block(x, y, width, blockHeight, task, this.dataSource);
                    this.blocks.push(block);
                }
            });
        });
    }

    getMockTeamsData() {
        return [
            { subject: "Daily Standup", start: Date.now() + 3600000, duration: 30 },
            { subject: "Sprint Planning", start: Date.now() + 7200000, duration: 120 },
            { subject: "Code Review", start: Date.now() + 10800000, duration: 45 },
            { subject: "Client Demo", start: Date.now() + 14400000, duration: 60 },
            { subject: "Team Lunch", start: Date.now() + 18000000, duration: 60 },
            { subject: "1:1 with Manager", start: Date.now() + 21600000, duration: 30 },
            { subject: "Architecture Review", start: Date.now() + 25200000, duration: 90 },
            { subject: "Bug Triage", start: Date.now() + 28800000, duration: 45 },
            { subject: "Release Meeting", start: Date.now() + 32400000, duration: 60 },
            { subject: "Team Retrospective", start: Date.now() + 36000000, duration: 75 }
        ];
    }

    getMockJiraData() {
        const statuses = ['To Do', 'In Progress', 'In Review', 'Testing', 'Done'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const tasks = [
            "Fix login bug", "Add dark mode", "Update API docs", "Optimize queries",
            "Write unit tests", "Refactor components", "Security audit", "Performance tuning",
            "Mobile responsive", "Error handling", "Data validation", "UI improvements",
            "Cache optimization", "Database migration", "Third-party integration"
        ];
        
        return tasks.map((task, index) => ({
            key: `PROJ-${1000 + index}`,
            summary: task,
            status: statuses[index % statuses.length],
            priority: priorities[index % priorities.length]
        }));
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameState !== 'playing') return;

        this.paddle.update(this.mouseX);
        this.ball.update(this.width, this.height);

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
        if (this.dataSource === 'teams') {
            const meetingTypes = ['Emergency Sync', 'Quick Check-in', 'Urgent Review', 'Last-minute Call'];
            newBlockData = {
                subject: meetingTypes[Math.floor(Math.random() * meetingTypes.length)],
                start: Date.now(),
                duration: 30
            };
        } else {
            const taskSummaries = ['Hotfix needed', 'Critical bug', 'Urgent feature', 'Emergency patch'];
            const statuses = ['To Do', 'In Progress', 'Awaiting MR'];
            newBlockData = {
                key: `URGENT-${Date.now()}`,
                summary: taskSummaries[Math.floor(Math.random() * taskSummaries.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: 'high'
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
        
        this.blocks.push(newBlock);
    }

    findAvailableBlockPositions() {
        const positions = [];
        const blockHeight = this.dataSource === 'teams' ? 35 : 30;
        const headerHeight = this.dataSource === 'teams' ? 80 : 60;
        const startY = headerHeight + 20;
        const maxY = this.height - 150; // Leave space for paddle
        
        if (this.dataSource === 'teams') {
            const timeColumnWidth = 40;
            const dayColumnWidth = (this.width - timeColumnWidth) / 7;
            
            // Check each day column for available space
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const columnX = timeColumnWidth + dayIndex * dayColumnWidth;
                
                // Check for gaps in this column
                for (let y = startY; y < maxY; y += blockHeight + 5) {
                    const hasBlock = this.blocks.some(block => 
                        !block.isDestroyed &&
                        block.x < columnX + dayColumnWidth - 5 &&
                        block.x + block.width > columnX + 5 &&
                        Math.abs(block.y - y) < blockHeight
                    );
                    
                    if (!hasBlock) {
                        positions.push({
                            x: columnX + 5,
                            y: y,
                            width: dayColumnWidth - 10,
                            height: blockHeight
                        });
                    }
                }
            }
        } else {
            const columnWidth = this.width / 7;
            
            // Check each status column for available space
            for (let colIndex = 0; colIndex < 7; colIndex++) {
                const columnX = colIndex * columnWidth;
                
                // Check for gaps in this column
                for (let y = startY; y < maxY; y += blockHeight + 3) {
                    const hasBlock = this.blocks.some(block => 
                        !block.isDestroyed &&
                        block.x < columnX + columnWidth - 5 &&
                        block.x + block.width > columnX + 5 &&
                        Math.abs(block.y - y) < blockHeight
                    );
                    
                    if (!hasBlock) {
                        positions.push({
                            x: columnX + 5,
                            y: y,
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
        if (this.dataSource === 'teams') {
            this.drawTeamsBackground();
            this.showTeamsOverlay();
        } else {
            this.drawJiraBackground();
            this.showJiraOverlay();
        }
    }

    showTeamsOverlay() {
        document.getElementById('teamsOverlay').style.display = 'block';
        document.getElementById('jiraOverlay').style.display = 'none';
    }

    showJiraOverlay() {
        document.getElementById('teamsOverlay').style.display = 'none';
        document.getElementById('jiraOverlay').style.display = 'block';
    }

    drawTeamsBackground() {
        // Teams calendar background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#464775');
        gradient.addColorStop(1, '#6264a7');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawJiraBackground() {
        // Jira board background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0052cc');
        gradient.addColorStop(1, '#2684ff');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGameObjects() {
        this.blocks.forEach(block => block.draw(this.ctx));
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.restore();
        });
        
        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
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
        this.lastEventTime = 0; // Reset random events
        this.updateScore();
        this.updateLivesDisplay();
        this.updateLevelDisplay();
        this.resetBall();
        this.createBlocks();
        this.gameLoop(performance.now());
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop(performance.now());
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // Reset difficulty to normal for next game
        this.level = 1;
        this.ball.setSpeed(5); // Reset to original ball speed
        this.updateLevelDisplay();
        
        // Show random funny game over message
        const messages = this.gameOverMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('gameOverMessage').textContent = randomMessage;
        document.getElementById('finalScore').textContent = this.score;
        
        this.showScreen('game-over-screen');
    }

    levelComplete() {
        // Show level complete popup first
        const messages = this.levelCompleteMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        document.getElementById('levelCompleteMessage').textContent = randomMessage;
        document.getElementById('levelScore').textContent = this.score;
        this.showScreen('level-complete-screen');
        
        this.gameState = 'levelComplete';
    }

    proceedToNextLevel() {
        this.level++;
        this.updateLevelDisplay();
        
        // Show difficulty warning
        this.showDifficultyWarning();
    }

    showDifficultyWarning() {
        const messages = this.difficultyWarningMessages[this.dataSource];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        document.getElementById('difficultyWarningMessage').textContent = randomMessage;
        document.getElementById('newLevelNumber').textContent = this.level;
        
        // Hide level complete screen and show difficulty warning
        this.showScreen('difficulty-warning-screen');
    }

    startNextLevel() {
        // Increase difficulty - slower speed progression (x2 slower)
        const speedIncrease = 0.25 + (this.level * 0.1);
        this.ball.setSpeed(this.ball.speed + speedIncrease);
        
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
        document.getElementById('winScore').textContent = this.score;
        this.showScreen('win-screen');
    }

    resetBall() {
        this.ball.reset(this.width / 2, this.height - 50);
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

    switchDataSource(newSource) {
        this.dataSource = newSource;
        if (this.gameState === 'playing' || this.gameState === 'start') {
            this.createBlocks();
        }
        
        // Update overlays immediately
        if (newSource === 'teams') {
            this.showTeamsOverlay();
        } else {
            this.showJiraOverlay();
        }
    }

    stop() {
        this.gameState = 'stopped';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
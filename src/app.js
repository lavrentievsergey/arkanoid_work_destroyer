class ArkanoidApp {
    constructor() {
        this.game = null;
        this.currentDataSource = 'calendar';
        this.isLoading = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.game = new Game('gameCanvas');
        this.setupEventListeners();
        this.showStartScreen();
        
        // Initialize language selector and settings
        setTimeout(() => {
            LocalizationService.updateLanguageSelector();
            this.initializeSettings();
        }, 100);
    }

    setupEventListeners() {
        // Game control buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('resumeButton').addEventListener('click', () => {
            this.game.pauseGame();
            this.game.hideAllScreens();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.game.proceedToNextLevel();
        });

        document.getElementById('acceptChallengeButton').addEventListener('click', () => {
            this.game.startNextLevel();
        });

        // Data source is now automatic - no toggle needed

        // Language selector
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            LocalizationService.setLanguage(e.target.value);
        });

        // Settings
        document.getElementById('settingsButton').addEventListener('click', () => {
            this.toggleSettings();
        });

        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });

        document.getElementById('ballSpeedSlider').addEventListener('input', (e) => {
            this.setBallSpeed(parseInt(e.target.value));
        });

        // Random blocks toggle
        document.getElementById('randomBlocksToggle').addEventListener('change', (e) => {
            this.setRandomBlocksEnabled(e.target.checked);
        });

        // Power-ups toggle
        document.getElementById('powerUpsToggle').addEventListener('change', (e) => {
            this.setPowerUpsEnabled(e.target.checked);
        });

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-panel')) {
                this.hideSettings();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    async startNewGame() {
        this.showLoading();
        
        try {
            // Authenticate both services since we'll be switching between them
            if (!AuthService.isAuthenticated.calendar) {
                await AuthService.authenticateCalendar();
                await CalendarService.getMeetings();
            }
            if (!AuthService.isAuthenticated.jira) {
                await AuthService.authenticateJira();
                await JiraService.getTasks();
            }

            this.hideLoading();
            this.game.hideAllScreens();
            this.game.startGame();
            
        } catch (error) {
            this.hideLoading();
            GameHelpers.showNotification('Failed to load data. Using placeholder blocks.', 'error');
            this.game.hideAllScreens();
            this.game.startGame();
        }
    }


    showStartScreen() {
        this.game.showScreen('start-screen');
    }

    showLoading() {
        this.isLoading = true;
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    toggleSettings() {
        const dropdown = document.querySelector('.settings-dropdown');
        dropdown.classList.toggle('hidden');
    }

    hideSettings() {
        const dropdown = document.querySelector('.settings-dropdown');
        dropdown.classList.add('hidden');
    }

    setDifficulty(difficulty) {
        const speedMap = {
            'easy': 3,
            'normal': 5,
            'hard': 7
        };
        
        const speed = speedMap[difficulty] || 5;
        document.getElementById('ballSpeedSlider').value = speed;
        this.setBallSpeed(speed);
        
        GameHelpers.showNotification(`Difficulty set to ${difficulty}`, 'info');
    }

    setBallSpeed(speed) {
        if (this.game && this.game.ball) {
            this.game.ball.setSpeed(speed);
        }
    }

    setRandomBlocksEnabled(enabled) {
        if (this.game) {
            this.game.setRandomBlocksEnabled(enabled);
        }
        GameHelpers.showNotification(`Random blocks ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    setPowerUpsEnabled(enabled) {
        if (this.game) {
            this.game.setPowerUpsEnabled(enabled);
        }
        GameHelpers.showNotification(`Power-ups ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    initializeSettings() {
        // Set random blocks toggle based on saved setting
        const savedRandomBlocks = localStorage.getItem('arkanoid_randomBlocks');
        const isRandomBlocksEnabled = savedRandomBlocks !== null ? savedRandomBlocks === 'true' : true;
        document.getElementById('randomBlocksToggle').checked = isRandomBlocksEnabled;
        
        // Set power-ups toggle based on saved setting
        const savedPowerUps = localStorage.getItem('arkanoid_powerUps');
        const isPowerUpsEnabled = savedPowerUps !== null ? savedPowerUps === 'true' : true;
        document.getElementById('powerUpsToggle').checked = isPowerUpsEnabled;
    }

    handleResize() {
        // Handle responsive design if needed
        const canvas = document.getElementById('gameCanvas');
        const container = canvas.parentElement;
        
        if (window.innerWidth < 768) {
            // Mobile adjustments
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
        } else {
            // Desktop settings
            canvas.style.width = '800px';
            canvas.style.height = '600px';
        }
    }

    // Public API for external integrations
    getGameState() {
        return {
            score: this.game?.score || 0,
            level: this.game?.level || 1,
            lives: this.game?.lives || 3,
            gameState: this.game?.gameState || 'start',
            dataSource: this.currentDataSource
        };
    }

    // Method to inject real data if APIs become available
    async loadRealData(dataSource, apiData) {
        this.showLoading();
        
        try {
            let formattedData;
            
            if (dataSource === 'calendar') {
                formattedData = apiData.map(meeting => CalendarService.formatMeetingForBlock(meeting));
            } else if (dataSource === 'jira') {
                formattedData = apiData.map(task => JiraService.formatTaskForBlock(task));
            }
            
            // Update game blocks with real data
            this.game.updateBlocksWithData(formattedData, dataSource);
            this.hideLoading();
            
            GameHelpers.showNotification(`Loaded ${apiData.length} real ${dataSource} items`, 'success');
            
        } catch (error) {
            this.hideLoading();
            GameHelpers.showNotification('Failed to load real data', 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arkanoidApp = new ArkanoidApp();
    
    // Add some helpful console messages
    console.log('🎮 Arkanoid Calendar & Jira Edition loaded!');
    console.log('Game automatically alternates between Calendar and Jira modes each level');
    console.log('Use arkanoidApp.getGameState() to inspect current game state');
});
class ArkanoidApp {
    constructor() {
        this.game = null;
        this.currentDataSource = 'teams';
        this.isLoading = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.game = new Game('gameCanvas');
        this.setupEventListeners();
        this.showStartScreen();
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

        // Data source toggle
        document.getElementById('dataSourceToggle').addEventListener('change', (e) => {
            const newSource = e.target.checked ? 'jira' : 'teams';
            this.switchDataSource(newSource);
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
            // Simulate loading data (mock authentication)
            if (this.currentDataSource === 'teams' && !AuthService.isAuthenticated.teams) {
                await AuthService.authenticateTeams();
                await TeamsService.getMeetings();
            } else if (this.currentDataSource === 'jira' && !AuthService.isAuthenticated.jira) {
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

    async switchDataSource(newSource) {
        if (newSource === this.currentDataSource) return;
        
        this.currentDataSource = newSource;
        this.showLoading();
        
        try {
            // Mock authentication for the new data source
            if (newSource === 'teams' && !AuthService.isAuthenticated.teams) {
                await AuthService.authenticateTeams();
            } else if (newSource === 'jira' && !AuthService.isAuthenticated.jira) {
                await AuthService.authenticateJira();
            }

            this.game.switchDataSource(newSource);
            this.hideLoading();
            
            GameHelpers.showNotification(
                `Switched to ${newSource === 'teams' ? 'Teams' : 'Jira'} mode`, 
                'success'
            );
            
        } catch (error) {
            this.hideLoading();
            GameHelpers.showNotification('Failed to switch data source', 'error');
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
            
            if (dataSource === 'teams') {
                formattedData = apiData.map(meeting => TeamsService.formatMeetingForBlock(meeting));
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
    console.log('🎮 Arkanoid Teams & Jira Edition loaded!');
    console.log('Toggle between Teams and Jira modes using the switch in the header');
    console.log('Use arkanoidApp.getGameState() to inspect current game state');
});
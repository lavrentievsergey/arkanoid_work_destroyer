const AuthService = {
    isAuthenticated: {
        teams: false,
        jira: false
    },

    authenticateTeams() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isAuthenticated.teams = true;
                GameHelpers.showNotification('Connected to Teams (Mock)', 'success');
                resolve(true);
            }, 1000);
        });
    },

    authenticateJira() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isAuthenticated.jira = true;
                GameHelpers.showNotification('Connected to Jira (Mock)', 'success');
                resolve(true);
            }, 1000);
        });
    },

    logout(service) {
        this.isAuthenticated[service] = false;
        GameHelpers.showNotification(`Disconnected from ${service}`, 'info');
    },

    checkAuthStatus() {
        return this.isAuthenticated;
    }
};
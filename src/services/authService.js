const AuthService = {
    isAuthenticated: {
        calendar: false,
        jira: false
    },

    authenticateCalendar() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isAuthenticated.calendar = true;
                GameHelpers.showNotification('Connected to Calendar (Mock)', 'success');
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
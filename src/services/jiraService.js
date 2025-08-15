const JiraService = {
    async getTasks(boardId = 'PROJ') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const taskTypes = [
            'Bug', 'Story', 'Task', 'Epic', 'Sub-task', 'Improvement'
        ];
        
        const components = [
            'Frontend', 'Backend', 'Database', 'API', 'UI/UX', 'DevOps',
            'Testing', 'Security', 'Performance', 'Documentation'
        ];
        
        const priorities = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];
        const statuses = ['To Do', 'In Progress', 'Awaiting MR', 'Ready for Testing', 'In Testing', 'Tested', 'Done'];
        
        const summaries = [
            'Fix login authentication bug',
            'Add dark mode toggle to settings',
            'Implement user profile page',
            'Optimize database query performance',
            'Add unit tests for user service',
            'Update API documentation',
            'Refactor component architecture',
            'Implement search functionality',
            'Fix responsive design issues',
            'Add error handling for file uploads',
            'Integrate third-party payment system',
            'Improve loading states',
            'Add accessibility features',
            'Implement data export feature',
            'Fix memory leak in dashboard',
            'Add multilingual support',
            'Upgrade to latest framework version',
            'Implement real-time notifications',
            'Add advanced filtering options',
            'Optimize bundle size'
        ];
        
        const assignees = [
            'john.doe', 'jane.smith', 'mike.johnson', 'sarah.williams',
            'david.brown', 'lisa.davis', 'tom.wilson', 'amy.garcia'
        ];
        
        const tasks = [];
        
        for (let i = 0; i < 40; i++) {
            const taskNumber = 1000 + i;
            const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 3600000);
            
            tasks.push({
                id: `${boardId}-${taskNumber}`,
                key: `${boardId}-${taskNumber}`,
                summary: summaries[Math.floor(Math.random() * summaries.length)],
                description: `Detailed description for task ${boardId}-${taskNumber}`,
                issueType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                assignee: Math.random() > 0.2 ? assignees[Math.floor(Math.random() * assignees.length)] : null,
                reporter: assignees[Math.floor(Math.random() * assignees.length)],
                created: createdDate.toISOString(),
                updated: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 3600000).toISOString(),
                component: components[Math.floor(Math.random() * components.length)],
                storyPoints: Math.random() > 0.3 ? [1, 2, 3, 5, 8][Math.floor(Math.random() * 5)] : null,
                labels: Math.random() > 0.5 ? ['frontend', 'urgent', 'bug-fix'][Math.floor(Math.random() * 3)] : [],
                resolution: Math.random() > 0.7 ? 'Fixed' : null
            });
        }
        
        return tasks;
    },

    async getTasksByStatus(status) {
        const allTasks = await this.getTasks();
        return allTasks.filter(task => task.status === status);
    },

    async getTasksByAssignee(assignee) {
        const allTasks = await this.getTasks();
        return allTasks.filter(task => task.assignee === assignee);
    },

    async getTasksByPriority(priority) {
        const allTasks = await this.getTasks();
        return allTasks.filter(task => task.priority === priority);
    },

    formatTaskForBlock(task) {
        return {
            id: task.id,
            key: task.key,
            summary: task.summary,
            status: task.status,
            priority: task.priority.toLowerCase(),
            type: task.issueType,
            assignee: task.assignee,
            storyPoints: task.storyPoints,
            component: task.component
        };
    },

    getProjectInfo() {
        return {
            key: 'PROJ',
            name: 'Demo Project',
            description: 'A sample project for the Arkanoid game',
            lead: 'john.doe',
            url: 'https://demo.atlassian.net/projects/PROJ'
        };
    }
};
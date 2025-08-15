const TeamsService = {
    async getMeetings() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate more realistic mock Teams meeting data
        const meetingTypes = [
            'Daily Standup', 'Sprint Planning', 'Sprint Review', 'Retrospective',
            'Code Review', 'Architecture Discussion', '1:1 Meeting', 'Team Lunch',
            'Client Demo', 'Project Kickoff', 'Bug Triage', 'Performance Review',
            'Training Session', 'Design Review', 'Release Planning', 'All Hands',
            'Quarterly Planning', 'Technical Discussion', 'Interview', 'Onboarding'
        ];
        
        const organizers = [
            'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown',
            'David Wilson', 'Lisa Garcia', 'Tom Anderson', 'Amy Martinez'
        ];
        
        const meetings = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
        
        // Generate meetings distributed across the week
        for (let i = 0; i < 50; i++) {
            const dayOffset = Math.floor(Math.random() * 7); // 0-6 for Mon-Sun
            const hourOffset = 8 + Math.random() * 10; // 8 AM to 6 PM
            
            const startTime = new Date(startOfWeek);
            startTime.setDate(startOfWeek.getDate() + dayOffset);
            startTime.setHours(Math.floor(hourOffset), (Math.random() * 60), 0, 0);
            
            const duration = [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)];
            
            meetings.push({
                id: `meeting_${i}`,
                subject: meetingTypes[Math.floor(Math.random() * meetingTypes.length)],
                start: startTime.toISOString(),
                end: new Date(startTime.getTime() + duration * 60000).toISOString(),
                duration: duration,
                organizer: organizers[Math.floor(Math.random() * organizers.length)],
                attendeesCount: Math.floor(Math.random() * 10) + 2,
                isRecurring: Math.random() > 0.7,
                importance: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
                location: Math.random() > 0.5 ? 'Conference Room A' : 'Microsoft Teams Meeting',
                hasAttachments: Math.random() > 0.8
            });
        }
        
        return meetings.sort((a, b) => new Date(a.start) - new Date(b.start));
    },

    async getCalendarEvents(timeRange = 'today') {
        const meetings = await this.getMeetings();
        
        // Filter based on time range
        const now = new Date();
        let filteredMeetings = meetings;
        
        switch (timeRange) {
            case 'today':
                const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                const endOfDay = new Date(now.setHours(23, 59, 59, 999));
                filteredMeetings = meetings.filter(m => {
                    const meetingDate = new Date(m.start);
                    return meetingDate >= startOfDay && meetingDate <= endOfDay;
                });
                break;
            case 'week':
                const weekStart = new Date(now.getTime() - 7 * 24 * 3600000);
                const weekEnd = new Date(now.getTime() + 7 * 24 * 3600000);
                filteredMeetings = meetings.filter(m => {
                    const meetingDate = new Date(m.start);
                    return meetingDate >= weekStart && meetingDate <= weekEnd;
                });
                break;
        }
        
        return filteredMeetings;
    },

    formatMeetingForBlock(meeting) {
        return {
            id: meeting.id,
            subject: meeting.subject,
            start: new Date(meeting.start).getTime(),
            duration: meeting.duration,
            organizer: meeting.organizer,
            priority: meeting.importance,
            type: meeting.location.includes('Teams') ? 'online' : 'inperson'
        };
    }
};
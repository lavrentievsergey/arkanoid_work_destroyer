const GameHelpers = {
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    formatTime: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    getColorByPriority: function(priority, type = 'calendar') {
        const colors = {
            calendar: {
                high: '#FF6B6B',
                medium: '#4ECDC4',
                low: '#45B7D1',
                default: '#95A5A6'
            },
            jira: {
                urgent: '#FF4757',
                high: '#FF6B6B',
                medium: '#FFA726',
                low: '#66BB6A',
                lowest: '#95A5A6',
                default: '#95A5A6'
            }
        };
        
        return colors[type][priority] || colors[type].default;
    },

    getStatusColor: function(status) {
        const statusColors = {
            'To Do': '#FF6B6B',
            'In Progress': '#FFA726',
            'In Review': '#AB47BC',
            'Testing': '#29B6F6',
            'Done': '#66BB6A',
            'Cancelled': '#95A5A6'
        };
        
        return statusColors[status] || '#95A5A6';
    },

    calculateBlockStrength: function(item, type) {
        if (type === 'calendar') {
            const duration = item.duration || 30;
            if (duration >= 120) return 3;
            if (duration >= 60) return 2;
            return 1;
        } else {
            const priority = item.priority?.toLowerCase() || 'low';
            if (priority === 'urgent' || priority === 'highest') return 3;
            if (priority === 'high') return 2;
            return 1;
        }
    },

    createGradient: function(ctx, x, y, width, height, color1, color2) {
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    },

    drawRoundedRect: function(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    easeInOutQuad: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    playSound: function(frequency, duration, type = 'sine') {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    },

    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        let backgroundColor = 'rgba(0, 0, 0, 0.8)';
        let borderColor = 'transparent';
        
        if (type === 'warning') {
            backgroundColor = 'rgba(255, 165, 0, 0.9)';
            borderColor = '#FF8C00';
        } else if (type === 'error') {
            backgroundColor = 'rgba(220, 53, 69, 0.9)';
            borderColor = '#DC3545';
        } else if (type === 'success') {
            backgroundColor = 'rgba(40, 167, 69, 0.9)';
            borderColor = '#28A745';
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${backgroundColor};
            color: white;
            border-radius: 8px;
            border: 2px solid ${borderColor};
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, duration);
    }
};
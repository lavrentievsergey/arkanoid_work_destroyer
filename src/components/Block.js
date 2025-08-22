class Block {
    constructor(x, y, width, height, data, type = 'placeholder') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.data = data || {};
        this.type = type;
        this.isDestroyed = false;
        this.strength = this.calculateStrength();
        this.maxStrength = this.strength;
        this.color = this.getColor();
        this.destroyAnimation = 0;
        this.hitAnimation = 0;
        this.id = GameHelpers.generateId();
        this.isRandomEvent = false;
        this.spawnTime = 0;
        this.powerType = null; // 'good', 'bad', or null
        this.lightningEffect = null; // For chain reaction animation
    }

    calculateStrength() {
        if (this.type === 'placeholder') return 1;
        return GameHelpers.calculateBlockStrength(this.data, this.type);
    }

    getColor() {
        // Special color for random event blocks
        if (this.isRandomEvent) {
            return '#FF4757'; // Bright red for urgent/emergency blocks
        }
        
        if (this.type === 'placeholder') {
            return '#95A5A6';
        } else if (this.type === 'calendar') {
            const duration = this.data.duration || 30;
            if (duration >= 120) return '#FF6B6B';
            if (duration >= 60) return '#FFA726';
            return '#4ECDC4';
        } else if (this.type === 'jira') {
            return GameHelpers.getStatusColor(this.data.status) || 
                   GameHelpers.getColorByPriority(this.data.priority, 'jira');
        }
        return '#95A5A6';
    }

    hit() {
        if (this.isDestroyed) return false;

        this.strength--;
        this.hitAnimation = 1.0;
        
        if (this.strength <= 0) {
            this.destroy();
            return true;
        }
        
        this.color = this.getDamagedColor();
        GameHelpers.playSound(660, 0.08);
        return false;
    }

    getDamagedColor() {
        const opacity = this.strength / this.maxStrength;
        const baseColor = this.getColor();
        
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${0.3 + opacity * 0.7})`;
    }

    destroy() {
        this.isDestroyed = true;
        this.destroyAnimation = 1.0;
        GameHelpers.playSound(880, 0.2);
    }

    update() {
        if (this.hitAnimation > 0) {
            this.hitAnimation -= 0.05;
            if (this.hitAnimation < 0) this.hitAnimation = 0;
        }

        if (this.destroyAnimation > 0) {
            this.destroyAnimation -= 0.02;
            if (this.destroyAnimation <= 0) {
                this.destroyAnimation = 0;
            }
        }

        // Update lightning effect
        if (this.lightningEffect) {
            const elapsed = performance.now() - this.lightningEffect.startTime;
            if (elapsed >= this.lightningEffect.duration) {
                this.lightningEffect = null;
            }
        }
    }

    draw(ctx) {
        if (this.isDestroyed && this.destroyAnimation <= 0) return;

        ctx.save();

        let alpha = 1;
        let scale = 1;
        
        if (this.isDestroyed) {
            alpha = this.destroyAnimation;
            scale = 1 + (1 - this.destroyAnimation) * 0.5;
        }

        if (this.hitAnimation > 0) {
            const shake = Math.sin(this.hitAnimation * Math.PI * 8) * 2;
            ctx.translate(shake, 0);
        }

        // Special effect for random event blocks
        if (this.isRandomEvent && this.spawnTime > 0) {
            const elapsed = performance.now() - this.spawnTime;
            const glowIntensity = Math.sin(elapsed * 0.01) * 0.3 + 0.7;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15 * glowIntensity;
        }
        
        // Power-up glow effects
        if (this.powerType === 'good') {
            const elapsed = performance.now() - (this.spawnTime || 0);
            const glowIntensity = Math.sin(elapsed * 0.005) * 0.4 + 0.6;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 20 * glowIntensity;
        } else if (this.powerType === 'bad') {
            const elapsed = performance.now() - (this.spawnTime || 0);
            const glowIntensity = Math.sin(elapsed * 0.008) * 0.4 + 0.6;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 18 * glowIntensity;
        }

        // Lightning effect for chain reaction
        if (this.lightningEffect) {
            const elapsed = performance.now() - this.lightningEffect.startTime;
            const progress = elapsed / this.lightningEffect.duration;
            const intensity = Math.sin(progress * Math.PI * 4) * (1 - progress);
            
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 30 * intensity;
            
            // Add electric blue overlay
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.3})`;
            GameHelpers.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 6);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.globalAlpha = alpha;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        this.drawBackground(ctx);
        this.drawContent(ctx);
        this.drawBorder(ctx);

        ctx.restore();
    }

    drawBackground(ctx) {
        const gradient = GameHelpers.createGradient(
            ctx,
            this.x,
            this.y,
            this.width,
            this.height,
            this.color,
            this.getDarkerColor(this.color)
        );

        ctx.fillStyle = gradient;
        GameHelpers.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 6);
        ctx.fill();
    }

    drawContent(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.type === 'placeholder') {
            ctx.fillText('Block', centerX, centerY);
        } else if (this.type === 'calendar') {
            this.drawCalendarContent(ctx, centerX, centerY);
        } else if (this.type === 'jira') {
            this.drawJiraContent(ctx, centerX, centerY);
        }

        if (this.maxStrength > 1) {
            ctx.font = 'bold 8px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(this.strength.toString(), this.x + this.width - 8, this.y + 10);
        }
    }

    drawCalendarContent(ctx, centerX, centerY) {
        const title = GameHelpers.truncateText(this.data.subject || 'Meeting', 12);
        const time = this.data.start ? GameHelpers.formatTime(this.data.start) : '';

        ctx.font = 'bold 9px Arial';
        ctx.fillText(title, centerX, centerY - 5);
        
        if (time) {
            ctx.font = '8px Arial';
            ctx.fillStyle = '#E0E0E0';
            ctx.fillText(time, centerX, centerY + 8);
        }
    }

    drawJiraContent(ctx, centerX, centerY) {
        const key = this.data.key || 'TASK';
        const title = GameHelpers.truncateText(this.data.summary || 'Task', 16);
        const priority = this.data.priority || 'medium';
        const issueType = this.data.issueType || 'task';
        const assignee = this.data.assignee || 'UN';

        // Draw issue type icon (top-left)
        this.drawIssueTypeIcon(ctx, this.x + 6, this.y + 6, issueType);
        
        // Draw priority icon (top-right)
        this.drawPriorityIcon(ctx, this.x + this.width - 15, this.y + 6, priority);
        
        // Draw task key
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(key, this.x + 6, this.y + 24);
        
        // Draw task title (with word wrapping for longer text)
        ctx.font = '9px Arial';
        ctx.fillStyle = '#E8E8E8';
        this.drawWrappedText(ctx, title, this.x + 6, this.y + 38, this.width - 12, 12);
        
        // Draw assignee avatar (bottom-right)
        this.drawAssigneeAvatar(ctx, this.x + this.width - 18, this.y + this.height - 14, assignee);
    }

    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                
                // Stop if we're running out of space
                if (currentY > y + lineHeight) break;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    drawIssueTypeIcon(ctx, x, y, issueType) {
        ctx.save();
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        
        switch(issueType) {
            case 'story':
                ctx.fillStyle = '#65BA43';
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('S', x + 5, y + 7);
                break;
            case 'bug':
                ctx.fillStyle = '#E5493A';
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('B', x + 5, y + 7);
                break;
            case 'task':
                ctx.fillStyle = '#4BADE8';
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('T', x + 5, y + 7);
                break;
            case 'epic':
                ctx.fillStyle = '#904EE2';
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('E', x + 5, y + 7);
                break;
            case 'subtask':
                ctx.fillStyle = '#65BA43';
                ctx.fillRect(x, y, 10, 10);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('↳', x + 5, y + 7);
                break;
        }
        ctx.restore();
    }

    drawPriorityIcon(ctx, x, y, priority) {
        ctx.save();
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        // Draw priority arrow
        switch(priority) {
            case 'highest':
                ctx.fillStyle = '#CD1317';
                ctx.fillText('↑↑', x, y + 8);
                break;
            case 'high':
                ctx.fillStyle = '#E97F33';
                ctx.fillText('↑', x, y + 8);
                break;
            case 'medium':
                ctx.fillStyle = '#E2A60B';
                ctx.fillText('→', x, y + 8);
                break;
            case 'low':
                ctx.fillStyle = '#57A55A';
                ctx.fillText('↓', x, y + 8);
                break;
            case 'lowest':
                ctx.fillStyle = '#57A55A';
                ctx.fillText('↓↓', x, y + 8);
                break;
        }
        ctx.restore();
    }

    drawAssigneeAvatar(ctx, x, y, assignee) {
        ctx.save();
        // Draw circular avatar background
        ctx.fillStyle = '#0052CC';
        ctx.beginPath();
        ctx.arc(x + 4, y + 4, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw initials
        ctx.font = 'bold 7px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(assignee, x + 4, y + 7);
        ctx.restore();
    }

    drawBorder(ctx) {
        ctx.strokeStyle = this.hitAnimation > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = this.hitAnimation > 0 ? 2 : 1;
        
        GameHelpers.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 6);
        ctx.stroke();
    }

    getDarkerColor(color) {
        if (color.startsWith('rgba')) return color;
        
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 40);
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 40);
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 40);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getScore() {
        const baseScore = 10;
        const strengthMultiplier = this.maxStrength;
        const typeMultiplier = this.type === 'placeholder' ? 1 : 1.5;
        
        return Math.floor(baseScore * strengthMultiplier * typeMultiplier);
    }

    shouldRemove() {
        return this.isDestroyed && this.destroyAnimation <= 0;
    }
}
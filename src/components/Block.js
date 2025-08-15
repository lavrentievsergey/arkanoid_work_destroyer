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
        } else if (this.type === 'teams') {
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
        } else if (this.type === 'teams') {
            this.drawTeamsContent(ctx, centerX, centerY);
        } else if (this.type === 'jira') {
            this.drawJiraContent(ctx, centerX, centerY);
        }

        if (this.maxStrength > 1) {
            ctx.font = 'bold 8px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(this.strength.toString(), this.x + this.width - 8, this.y + 10);
        }
    }

    drawTeamsContent(ctx, centerX, centerY) {
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
        const title = GameHelpers.truncateText(this.data.summary || 'Task', 10);

        ctx.font = 'bold 8px Arial';
        ctx.fillText(key, centerX, centerY - 6);
        
        ctx.font = '8px Arial';
        ctx.fillStyle = '#E0E0E0';
        ctx.fillText(title, centerX, centerY + 6);
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
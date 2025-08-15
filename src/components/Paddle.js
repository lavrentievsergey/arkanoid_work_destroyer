class Paddle {
    constructor(x, y, width, height, canvasWidth) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canvasWidth = canvasWidth;
        this.speed = 8;
        this.color = '#4ECDC4';
        this.glowColor = 'rgba(78, 205, 196, 0.5)';
    }

    update(mouseX) {
        this.x = mouseX - this.width / 2;
        
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
        }
    }

    draw(ctx) {
        ctx.save();
        
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        
        const gradient = GameHelpers.createGradient(
            ctx, 
            this.x, 
            this.y, 
            this.width, 
            this.height,
            '#5DD5D9',
            '#4ECDC4'
        );
        
        ctx.fillStyle = gradient;
        GameHelpers.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 8);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.y = canvasHeight - 30;
        
        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
    }
}
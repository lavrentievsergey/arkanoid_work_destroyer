class Ball {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.velocity = { x: 0, y: 0 };
        this.isLaunched = false;
        this.color = '#FFE66D';
        this.glowColor = 'rgba(255, 230, 109, 0.8)';
        this.trail = [];
        this.maxTrailLength = 10;
    }

    launch(direction = { x: 1, y: -1 }) {
        this.velocity = Physics.normalizeSpeed(direction, this.speed);
        this.isLaunched = true;
    }

    update(canvasWidth, canvasHeight, skipNormalization = false, deltaTime = 16.67) {
        if (!this.isLaunched) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Scale movement by deltaTime for consistent speed regardless of framerate
        const timeMultiplier = Math.min(deltaTime / 16.67, 2.0); // Cap at 2x to prevent huge jumps
        
        
        const oldX = this.x;
        const oldY = this.y;
        this.x += this.velocity.x * timeMultiplier;
        this.y += this.velocity.y * timeMultiplier;

        // Improved boundary collision with clamping
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.velocity.x = Math.abs(this.velocity.x); // Ensure positive velocity
            GameHelpers.playSound(220, 0.1);
        } else if (this.x + this.radius >= canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.velocity.x = -Math.abs(this.velocity.x); // Ensure negative velocity
            GameHelpers.playSound(220, 0.1);
        }

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocity.y = Math.abs(this.velocity.y); // Ensure positive velocity
            GameHelpers.playSound(220, 0.1);
        }

        if (!skipNormalization) {
            const oldVelocity = { x: this.velocity.x, y: this.velocity.y };
            const oldSpeed = this.speed;
            this.velocity = Physics.normalizeSpeed(this.velocity, this.speed);
            const newSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (Math.abs(newSpeed - oldSpeed) > 0.01) {
                }
        } else {
        }
    }

    checkPaddleCollision(paddle) {
        const ballBounds = {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };

        if (Physics.checkCollision(ballBounds, paddle.getBounds())) {
            if (this.velocity.y > 0) {
                this.velocity = Physics.calculatePaddleBounce(
                    this.x, 
                    paddle.x, 
                    paddle.width, 
                    this.velocity
                );
                this.y = paddle.y - this.radius;
                GameHelpers.playSound(330, 0.15);
                return true;
            }
        }
        return false;
    }

    checkBlockCollision(block) {
        const collision = Physics.checkCircleRectCollision(
            { x: this.x, y: this.y, radius: this.radius },
            block.getBounds()
        );

        if (collision) {
            // Reflect velocity first
            this.velocity = Physics.reflectVelocity(this.velocity, collision);
            
            // Position ball outside the block to prevent penetration
            const blockBounds = block.getBounds();
            
            if (collision === 'horizontal') {
                // Ball hit top or bottom of block
                if (this.y < blockBounds.y + blockBounds.height / 2) {
                    // Ball hit from above
                    this.y = blockBounds.y - this.radius - 1;
                } else {
                    // Ball hit from below
                    this.y = blockBounds.y + blockBounds.height + this.radius + 1;
                }
            } else if (collision === 'vertical') {
                // Ball hit left or right side of block
                if (this.x < blockBounds.x + blockBounds.width / 2) {
                    // Ball hit from left
                    this.x = blockBounds.x - this.radius - 1;
                } else {
                    // Ball hit from right
                    this.x = blockBounds.x + blockBounds.width + this.radius + 1;
                }
            } else if (collision === 'corner') {
                // Handle corner collision - push ball away from nearest corner
                const centerX = blockBounds.x + blockBounds.width / 2;
                const centerY = blockBounds.y + blockBounds.height / 2;
                
                const dx = this.x - centerX;
                const dy = this.y - centerY;
                
                const absX = Math.abs(dx);
                const absY = Math.abs(dy);
                
                if (absX > absY) {
                    // Push horizontally
                    this.x = dx > 0 ? 
                        blockBounds.x + blockBounds.width + this.radius + 1 : 
                        blockBounds.x - this.radius - 1;
                } else {
                    // Push vertically
                    this.y = dy > 0 ? 
                        blockBounds.y + blockBounds.height + this.radius + 1 : 
                        blockBounds.y - this.radius - 1;
                }
            }

            GameHelpers.playSound(440, 0.1);
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();

        this.drawTrail(ctx);

        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            0,
            this.x, 
            this.y, 
            this.radius
        );
        gradient.addColorStop(0, '#FFF176');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#F57F17');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i + 1) / this.trail.length * 0.3;
            const size = (i + 1) / this.trail.length * this.radius * 0.8;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.isLaunched = false;
        this.trail = [];
    }

    isOutOfBounds(canvasHeight) {
        return this.y - this.radius > canvasHeight;
    }

    setSpeed(speed) {
        this.speed = speed;
        if (this.isLaunched) {
            const oldVelocity = { x: this.velocity.x, y: this.velocity.y };
            this.velocity = Physics.normalizeSpeed(this.velocity, speed);
        }
    }
}
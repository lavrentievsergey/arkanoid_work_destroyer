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

    update(canvasWidth, canvasHeight) {
        if (!this.isLaunched) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.velocity.x = -this.velocity.x;
            GameHelpers.playSound(220, 0.1);
        } else if (this.x + this.radius >= canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.velocity.x = -this.velocity.x;
            GameHelpers.playSound(220, 0.1);
        }

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocity.y = -this.velocity.y;
            GameHelpers.playSound(220, 0.1);
        }

        this.velocity = Physics.normalizeSpeed(this.velocity, this.speed);
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
            this.velocity = Physics.reflectVelocity(this.velocity, collision);
            
            if (collision === 'horizontal') {
                this.y = this.velocity.y > 0 ? 
                    block.y - this.radius : 
                    block.y + block.height + this.radius;
            } else if (collision === 'vertical') {
                this.x = this.velocity.x > 0 ? 
                    block.x - this.radius : 
                    block.x + block.width + this.radius;
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
            this.velocity = Physics.normalizeSpeed(this.velocity, speed);
        }
    }
}
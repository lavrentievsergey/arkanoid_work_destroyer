const Physics = {
    checkCollision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    checkCircleRectCollision: function(circle, rect) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + circle.radius)) return null;
        if (distY > (rect.height / 2 + circle.radius)) return null;

        if (distX <= (rect.width / 2)) return 'vertical';
        if (distY <= (rect.height / 2)) return 'horizontal';

        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius)) ? 'corner' : null;
    },

    reflectVelocity: function(velocity, collisionSide) {
        switch (collisionSide) {
            case 'horizontal':
                return { x: velocity.x, y: -velocity.y };
            case 'vertical':
                return { x: -velocity.x, y: velocity.y };
            case 'corner':
                return { x: -velocity.x, y: -velocity.y };
            default:
                return velocity;
        }
    },

    calculatePaddleBounce: function(ballX, paddleX, paddleWidth, currentVelocity) {
        const paddleCenter = paddleX + paddleWidth / 2;
        const hitPosition = (ballX - paddleCenter) / (paddleWidth / 2);
        
        const maxAngle = Math.PI / 3;
        const bounceAngle = hitPosition * maxAngle;
        
        const speed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
        
        return {
            x: Math.sin(bounceAngle) * speed,
            y: -Math.abs(Math.cos(bounceAngle)) * speed
        };
    },

    normalizeSpeed: function(velocity, targetSpeed) {
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (currentSpeed === 0) return velocity;
        
        const ratio = targetSpeed / currentSpeed;
        return {
            x: velocity.x * ratio,
            y: velocity.y * ratio
        };
    },

    keepInBounds: function(obj, bounds) {
        if (obj.x < bounds.left) {
            obj.x = bounds.left;
        } else if (obj.x + obj.width > bounds.right) {
            obj.x = bounds.right - obj.width;
        }
        
        if (obj.y < bounds.top) {
            obj.y = bounds.top;
        } else if (obj.y + obj.height > bounds.bottom) {
            obj.y = bounds.bottom - obj.height;
        }
    },

    distance: function(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
};
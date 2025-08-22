const Physics = {
    checkCollision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    checkCircleRectCollision: function(circle, rect) {
        // Find the closest point on the rectangle to the circle center
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate distance from circle center to closest point
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // No collision if distance is greater than radius
        if (distance > circle.radius) return null;
        
        // Determine collision side based on the closest point
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        
        const ballToCenterX = circle.x - centerX;
        const ballToCenterY = circle.y - centerY;
        
        // Check if it's a corner collision
        if (closestX !== circle.x && closestY !== circle.y) {
            return 'corner';
        }
        
        // Determine if it's horizontal or vertical collision
        const absX = Math.abs(ballToCenterX);
        const absY = Math.abs(ballToCenterY);
        
        // Use the ratio of distances to determine collision side more accurately
        const ratioX = absX / (rect.width / 2);
        const ratioY = absY / (rect.height / 2);
        
        if (ratioX > ratioY) {
            return 'vertical'; // Hit left or right side
        } else {
            return 'horizontal'; // Hit top or bottom
        }
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
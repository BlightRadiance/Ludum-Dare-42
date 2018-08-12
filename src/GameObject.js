//@ts-check
var GameObjectType = Object.freeze({
    "Player": 1, 
    "Building": 2, 
    "AI": 3,
})

var AiType = Object.freeze({
    "Rush": 1, 
    "Range": 2, 
})

class GameObject {
    constructor(graphics, type, aiType) {
        this.graphics = graphics;
        this.type = type;
        this.aiType = aiType;
        this.currentCell = undefined;

        this.falling = false;
        this.fallV = 0.0;
        this.fallA = 1000.0;
        this.fallingTime = 0.0;
        this.fallingTimeMax = 2.0;
    }

    setCell(row, column) {
        this.unmanage(false);
        this.currentCell = state.stage.getCell(row, column);
        this.currentCell.show(this, 2);
    }

    setFalling(x, y) {
        this.unmanage(false);
        this.graphics.x = x;
        this.graphics.y = y;
        this.falling = true;
    }

    unmanage(remove) {
        if (this.currentCell) {
            this.currentCell.unmanage(2);
        }
        if (remove) {
            app.stage.removeChild(this.graphics);
            switch (this.type) {
                case GameObjectType.Player:
                    state.onPlayerDropped();
                break;
                case GameObjectType.AI:
                    state.onEnemyDropped();
                break;
            }
        }
    }

    update(dt) {
        if (this.falling) {
            this.fallV += this.fallA * dt;
            this.graphics.y += this.fallV * dt;
            this.fallingTime += dt;
            if (this.fallingTime > this.fallingTimeMax) {
                state.onGameObjectDropped(this);
                this.falling = false;
            }
        }
    }

    onAiMove() {
        console.log("On AI move");
        var self = this;
        this.showAiOverlay();
        setTimeout(() => {
            switch (this.aiType) {
                case AiType.Rush:
                    this.rush();
                break;
            }
            this.hideAiOverlay();
            state.onAiMoveFinished();
        }, 1000 / state.level.enemyCount);
    }

    showAiOverlay() {
        this.moveOverlay = new Overlay(OverlayType.Move);
        this.attackOverlay = new Overlay(OverlayType.Attack);
        this.movePattern = undefined;
        this.attackMovePatten = undefined;
        this.attackPatten = undefined;
        switch (this.aiType) {
            case AiType.Rush:
                this.movePattern = rushAiMovePattern;
                this.attackMovePatten = rushAiAttackMovePattern;
                this.attackPatten = rushAiAttackPattern;
            break;
        }

        this.moveOverlay.drawOverlay(this.currentCell, this.movePattern, Action.None);
    }

    rush() {
        var playerCell = state.level.playerObject.currentCell;
        if (this.attackOverlay.isWithin(playerCell, this.currentCell, this.attackMovePatten)) {
            // Can attack player
            return;
        } else {
            // Try to move to player's cell
            var dirX = playerCell.column - this.currentCell.column;
            var dirY = playerCell.row - this.currentCell.row;
            if (dirX != 0) {
                dirX /= Math.abs(dirX);
            }
            if (dirY != 0) {
                dirY /= Math.abs(dirY);
            }
            var targetCell = state.stage.getCell(this.currentCell.row + dirY, this.currentCell.column + dirX);
            if (targetCell && this.moveOverlay.isWithin(targetCell, this.currentCell, this.movePattern)) {
                // Can move in player's direction
                if (!this.moveOverlay.apply(this.currentCell, targetCell, this.movePattern)) {
                    console.log("Unexpected: Ai tried to move to row: " + (this.currentCell.column + dirY) + "; column: " + (this.currentCell.row + dirX) + ". And failed!");
                }
            }
        }
    }

    hideAiOverlay() {
        this.moveOverlay.hideOverlay();
        this.attackOverlay.hideOverlay();
    }
}
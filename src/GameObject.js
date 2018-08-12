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
    }

    rush() {
        var playerCell = state.level.playerObject.currentCell;
    }

    hideAiOverlay() {
        this.moveOverlay.hideOverlay();
        this.attackOverlay.hideOverlay();
    }
}
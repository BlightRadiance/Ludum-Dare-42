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
        this.dead = false;
        this.fallV = 0.0;
        this.fallA = 3000.0;
        this.fallingTime = 0.0;
        this.fallingTimeMax = 1.0;
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
            this.dead = true;
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
                this.dead = true;
            }
        }
    }

    isMovePossible() {
        return this.currentCell.state == CellState.Ok && !this.falling && !this.dead;
    }

    onAiMove() {
        console.log("On AI move");
        if (!this.isMovePossible()) {
            state.onAiMoveFinished(false);
        } else {
            var self = this;
            this.showAiOverlay();
            switch (this.aiType) {
                case AiType.Rush:
                    this.rush();
                break;
                case AiType.Range:
                    this.range();
                break;
            }
        }
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
            case AiType.Range:
                this.movePattern = undefined;
                this.attackMovePatten = rangeAiAttackMovePattern;
                this.attackPatten = rangeAiAttackPattern;
            break;
        }
        this.moveOverlay.drawOverlay(this.currentCell, this.movePattern, Action.None);
    }

    delayedFinishAiTurn(action) {
        setTimeout(() => {
            if (this.isMovePossible()) {
                action();
            }
            this.hideAiOverlay();
            state.onAiMoveFinished(true);
        }, Math.min(state.level.enemyCount * 1000, 4000) / state.level.enemyCount);
    }

    rush() {
        var self = this;
        var playerCell = state.level.playerObject.currentCell;
        if (this.attackOverlay.isWithin(playerCell, this.currentCell, this.attackMovePatten)) {
            this.moveOverlay.drawOverlay(this.currentCell, this.attackMovePatten, Action.None);
            this.attackOverlay.drawOverlay(playerCell, this.attackPatten, Action.Fire)
            // Can attack player
            this.delayedFinishAiTurn(() => {
                if (!self.attackOverlay.apply(playerCell, playerCell, self.attackPatten, Action.Fire)) {
                    console.log("Unexpected: Ai tried to attack row: " + playerCell.column + "; column: " + playerCell.row + ". And failed!");
                }
            });
        } else {
            // Try path finding
            var grid = state.stage.getPathfindingGrid();
            var path = pathFinder.findPath(this.currentCell.column, this.currentCell.row, playerCell.column, playerCell.row, grid);
            if (path.length != 0) {
                this.delayedFinishAiTurn(() => {
                    var targetCell = state.stage.getCell(path[1][1], path[1][0]);
                    if (this.canGoTo(targetCell) && !self.moveOverlay.apply(self.currentCell, targetCell, self.movePattern, Action.None)) {
                        console.log("Unexpected: Ai tried to move to row: " + (targetCell.column) + "; column: " + (targetCell.row) + ". And failed!");
                    }
                });
            } else {
                // Try to find any random possible movement option
                console.log("There is no path to player")
                var maxRandomPickCount = 20;
                var currentPick = 0;
                var exitFound = false;
                while (currentPick < maxRandomPickCount) {
                    var dirX = getRandDir();
                    var dirY = getRandDir();
                    var targetCell = state.stage.getCell(this.currentCell.row + dirY, this.currentCell.column + dirX);
                    if (this.canGoTo(targetCell)) {
                        exitFound = true;
                        this.delayedFinishAiTurn(() => {
                            if (!self.moveOverlay.apply(self.currentCell, targetCell, self.movePattern, Action.None)) {
                                console.log("Unexpected: Ai tried to move to row: " + (self.currentCell.column + dirY) + "; column: " + (self.currentCell.row + dirX) + ". And failed!");
                            }
                        });
                    }
                    if (exitFound) {
                        break;
                    }
                    currentPick += 1;
                }
                if (!exitFound) {
                    // Self distruct
                    this.delayedFinishAiTurn(() => {
                        this.currentCell.state = CellState.Falling;
                    });
                }
            }
        }
    }

    range() {
        var self = this;
        var playerCell = state.level.playerObject.currentCell;
        if (this.attackOverlay.isWithin(playerCell, this.currentCell, this.attackMovePatten)) {
            this.moveOverlay.drawOverlay(this.currentCell, this.attackMovePatten, Action.None);
            // Can attack player
            var targetCell = playerCell;
            if (Math.random() < 0.9) {
                var dirX = getRandDir();
                var dirY = getRandDir();
                if (Math.random() < 0.8) {
                    dirX += getRandDir();
                    dirY += getRandDir();
                }
                if (Math.random() < 0.5) {
                    dirX += getRandDir();
                    dirY += getRandDir();
                }
                targetCell = state.stage.getCell(playerCell.row + dirY, playerCell.column + dirX);
            }
            this.attackOverlay.drawOverlay(targetCell, this.attackPatten, Action.Fire)
            this.delayedFinishAiTurn(() => {
                self.attackOverlay.apply(targetCell, targetCell, self.attackPatten, Action.Artillery);
            });
        } else {
            this.hideAiOverlay();
            state.onAiMoveFinished(true);
        }
    }

    canGoTo(targetCell) {
        return targetCell && this.moveOverlay.isWithin(targetCell, this.currentCell, this.movePattern)
                && targetCell.state == CellState.Ok;
    }

    hideAiOverlay() {
        this.moveOverlay.hideOverlay();
        this.attackOverlay.hideOverlay();
    }
}
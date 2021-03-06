//@ts-check
var OverlayType = Object.freeze({
    "Move": 1, 
    "Attack": 2, 
})

/*
-2 - center of action and danger
-1 - center of action
 1 - movable
 2 - attack
 3 - push left
 4 - push up
 5 - push right
 6 - push down
*/

// Player
var movePattern = [
    [1, 1, 1],
    [1, -1, 1],
    [1, 1, 1],
];
var attackPattern = [
    [2],
];
var jumpPattern = [
    [0, 4, 0],
    [3, -1, 5],
    [0, 6, 0],
];
var jumpMovePattern = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, -1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
];
var attackMovePattern = [
    [0, 0, 4, 0, 0],
    [0, 0, 4, 0, 0],
    [3, 3, -1, 5, 5],
    [0, 0, 6, 0, 0],
    [0, 0, 6, 0, 0],
];

// Rush Ai
var rushAiMovePattern = [
    [1, 1, 1],
    [1, -1, 1],
    [1, 1, 1],
];
var rushAiAttackMovePattern = [
    [1, 1, 1],
    [1, -1, 1],
    [1, 1, 1],
];
var rushAiAttackPattern = [
    [2],
];

// Range Ai
var rangeAiAttackMovePattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, -1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
];
var rangeAiAttackPattern = [
    [0, 4, 0],
    [3, -2, 5],
    [0, 6, 0],
];

class Overlay {
    constructor(type) {
        this.type = type;
        this.sprites = new Array();
    }

    drawOverlay(/** @type {Cell} */ target, pattern, action) {
        this.hideOverlay();
        if (!target || !pattern) {
            return;
        }
        // Find center
        var centerX = 0;
        var centerY = 0;
        for (var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for (var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                if (pattern[patternRow][patternColumn] < 0) {
                    centerX = patternRow;
                    centerY = patternColumn;
                    break;
                }
            }
            if (centerX && centerY) {
                break;
            }
        }

        // Draw
        var targetLayer = 1;
        for(var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for(var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                var sprite = undefined;
                switch(pattern[pattern.length - patternRow - 1][patternColumn]) {
                    case -1:
                    sprite = PIXI.Sprite.fromImage('overlay_base')
                    sprite.anchor.set(0.5);
                    targetLayer = 1;
                    break;
                    case 0:
                    break;
                    case 1:
                    sprite = PIXI.Sprite.fromImage('overlay_base')
                    sprite.anchor.set(0.5);
                    targetLayer = 1;
                    break;
                    case 3:
                    sprite = PIXI.Sprite.fromImage('overlay_r')
                    sprite.anchor.set(0.5);
                    targetLayer = 3;
                    break;
                    case 4:
                    sprite = PIXI.Sprite.fromImage('overlay_u')
                    sprite.anchor.set(0.5);
                    targetLayer = 3;
                    break;
                    case 5:
                    sprite = PIXI.Sprite.fromImage('overlay_l')
                    sprite.anchor.set(0.5);
                    targetLayer = 3;
                    break;
                    case 6:
                    sprite = PIXI.Sprite.fromImage('overlay_d')
                    sprite.anchor.set(0.5);
                    targetLayer = 3;
                    break;
                    default:
                    sprite = PIXI.Sprite.fromImage('overlay_attack')
                    sprite.anchor.set(0.5);
                    break;
                }

                if (sprite) {
                    var column = centerX - patternColumn + target.column;
                    var row = centerY - patternRow + target.row;
                    if (column >= 0 && column < state.stage.cellsColumnsCount) {
                        if (row >= 0 && row < state.stage.cellsRowsCount) {
                            var cell = state.stage.getCell(row, column);
                            if (cell.layers[2] && (this.type == OverlayType.Move)) {
                                // There is an object -> cant move
                                continue;
                            }
                            app.stage.addChild(sprite);
                            this.sprites.push(sprite);
                            cell.show(sprite, targetLayer);
                        }
                    }
                }
                sprite = undefined;
            }
        }
    }

    hideOverlay() {
        state.stage.clearLayer(1);
        for (var i = 0; i < this.sprites.length; ++i) {
            var sprite = this.sprites[i];
            app.stage.removeChild(sprite);
        }
        this.sprites = new Array();
    }

    isWithin(/** @type {Cell} */ cell, /** @type {Cell} */ target, pattern, action) {
        if (!target || !cell || !pattern) {
            return;
        }
        // Find center
        var centerX = 0;
        var centerY = 0;
        for (var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for (var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                if (pattern[patternRow][patternColumn] < 0) {
                    centerX = patternRow;
                    centerY = patternColumn;
                    break;
                }
            }
            if (centerX && centerY) {
                break;
            }
        }

        // Draw
        for(var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for(var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                var column = centerX - patternColumn + target.column;
                var row = centerY - patternRow + target.row;
                if (column >= 0 && column < state.stage.cellsColumnsCount) {
                    if (row >= 0 && row < state.stage.cellsRowsCount) {
                        var targetCell = state.stage.cells[state.stage.getIndex(row, column)];
                        var command = pattern[pattern.length - patternRow - 1][patternColumn];
                        if (targetCell.layers[2] && (this.type == OverlayType.Move || action == Action.Jump)) {
                            // There is an object -> cant move
                            continue;
                        }
                        if (cell.row == targetCell.row && cell.column == targetCell.column) {
                            if (command != 0) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    apply(/** @type {Cell} */ target, click, pattern, action) {
        if (this.sprites.length == 0 || !target || !pattern) {
            return;
        }
        // Find center
        var centerX = 0;
        var centerY = 0;
        for (var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for (var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                if (pattern[patternRow][patternColumn] < 0) {
                    centerX = patternRow;
                    centerY = patternColumn;
                    break;
                }
            }
            if (centerX && centerY) {
                break;
            }
        }

        // Draw
        for(var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for(var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                var column = centerX - patternColumn + target.column;
                var row = centerY - patternRow + target.row;
                if (column >= 0 && column < state.stage.cellsColumnsCount) {
                    if (row >= 0 && row < state.stage.cellsRowsCount) {
                        var cell = state.stage.cells[state.stage.getIndex(row, column)];
                        if (cell.layers[2] && (this.type == OverlayType.Move)) {
                            // There is an object -> cant move
                            continue;
                        }
                        if (cell.row == click.row && cell.column == click.column) {
                            var command = pattern[pattern.length - patternRow - 1][patternColumn];
                            state.applyAction(cell, command, action);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
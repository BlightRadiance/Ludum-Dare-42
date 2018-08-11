//@ts-check
var OverlayType = Object.freeze({
    "CursorGreen": 1, 
    "CursorRed": 2, 
    "CursorYellow": 3, 
})

/*
-1 - center
1 - green
*/

var movePattern = [
    [1, 0, 1],
    [1, -1, 1],
    [0, 1, 0],
]

class Overlay {
    constructor() {
        this.type = OverlayType.CursorGreen;
        this.sprites = new Array();
    }

    init() {
    }

    drawOverlay(/** @type {Cell} */ mouse, /** @type {Cell} */ selected, pattern) {
        this.hideOverlay();
        this.drawPattern(mouse, pattern);
    }

    hideOverlay() {
        state.stage.clearLayer(1);
        for (var i = 0; i < this.sprites.length; ++i) {
            var sprite = this.sprites[i];
            app.stage.removeChild(sprite);
        }
        this.sprites = new Array();
    }

    drawPattern(/** @type {Cell} */ target, pattern) {

        // Find center
        var centerX = undefined;
        var centerY = undefined;
        for (var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for (var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                if (pattern[patternRow][patternColumn] == -1) {
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
                var sprite = undefined;
                switch(pattern[pattern.length - patternRow - 1][patternColumn]) {
                    case 1:
                    sprite = PIXI.Sprite.fromImage('overlay_base')
                    sprite.anchor.set(0.5);
                    break;
                }

                if (sprite) {
                    var column = centerX - patternColumn + target.column;
                    var row = centerY - patternRow + target.row;
                    console.log(target.column + " " + target.row);
                    if (column >= 0 && column < state.stage.cellsColumnsCount) {
                        if (row >= 0 && row < state.stage.cellsRowsCount) {
                            var cell = state.stage.cells[state.stage.getIndex(row, column)];
                            app.stage.addChild(sprite);
                            this.sprites.push(sprite);
                            cell.show(sprite, 1);
                        }
                    }
                }
                sprite = undefined;
            }
        }
    }

    apply(/** @type {Cell} */ mouse, /** @type {Cell} */ selected, pattern) {
        if (this.sprites.length == 0) {
            return;
        }
        // Find center
        var centerX = undefined;
        var centerY = undefined;
        for (var patternRow = 0; patternRow < pattern.length; ++patternRow) {
            for (var patternColumn = 0; patternColumn < pattern.length; ++patternColumn) {
                if (pattern[patternRow][patternColumn] == -1) {
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
                var sprite = undefined;
                switch(pattern[pattern.length - patternRow - 1][patternColumn]) {
                    case 1:
                    sprite = PIXI.Sprite.fromImage('overlay_base')
                    sprite.anchor.set(0.5);
                    break;
                }

                if (sprite) {
                    var column = centerX - patternColumn + target.column;
                    var row = centerY - patternRow + target.row;
                    console.log(target.column + " " + target.row);
                    if (column >= 0 && column < state.stage.cellsColumnsCount) {
                        if (row >= 0 && row < state.stage.cellsRowsCount) {
                            var cell = state.stage.cells[state.stage.getIndex(row, column)];
                            app.stage.addChild(sprite);
                            this.sprites.push(sprite);
                            cell.show(sprite, 1);
                        }
                    }
                }
                sprite = undefined;
            }
        }
    }
}
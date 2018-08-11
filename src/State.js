//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "Gameover": 3, 
})

var FieldWidth = 8;
var FieldHeight = 8;

class State {
    constructor() {
        this.paused = false;
        this.state = GameStates.Play;
        this.stage = new Stage();
        
        this.moveOverlay = new Overlay(OverlayType.Move);
        this.movePattern = undefined;

        this.attackOverlay = new Overlay(OverlayType.Attack);

        this.mouseOverCell = undefined;
        this.selectedCell = undefined;
    }

    init() {
        this.setupPayingField();
        this.moveOverlay.init();
        this.attackOverlay.init();

        var playerSprite1 = PIXI.Sprite.fromImage('player')
        playerSprite1.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite1);
        var playerObject1 = new GameObject(playerSprite1, GameObjectType.Player);
        playerObject1.setCell(0, 0);

        var playerSprite2 = PIXI.Sprite.fromImage('player')
        playerSprite2.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite2);
        var playerObject2 = new GameObject(playerSprite2, GameObjectType.Player);
        playerObject2.setCell(2, 2);
    }

    update(dt) {
        this.stage.update(dt);
        if (this.selectedCell) {
            this.moveOverlay.drawOverlay(this.selectedCell, movePattern);
        } else {
            this.moveOverlay.hideOverlay();
        }
    }
    
    setupPayingField() {
        this.stage.setupPayingField(FieldWidth, FieldHeight);
    }

    onCellDropped(/** @type {Cell} */ cell) {

    }

    onCellDown(/** @type {Cell} */ cell) {
        if (cell.layers[2]) {
            if (this.selectedCell) {
                switch (cell.layers[2].type) {
                    case GameObjectType.Player:
                        // Switch to other unit
                        this.selectedCell = cell;
                    return;
                    default:
                        // Some entity, try to apply attack pattern
                        this.attackOverlay.apply(this.selectedCell, cell, this.movePattern);
                    break;
                }
            } else {
                switch (cell.layers[2].type) {
                    case GameObjectType.Player:
                        // Switch to other unit
                        this.selectedCell = cell;
                        this.movePattern = movePattern;
                    return;
                }
            }
        } else {
            // Try to apply move pattern
            var success = this.moveOverlay.apply(this.selectedCell, cell, this.movePattern);
            if (!success) {
                this.selectedCell = undefined;
            }
        }
        //this.overlay.apply(this.selectedCell, movePattern);
        //app.stage.removeChildren();
        //this.stage.setupPayingField(FieldWidth + 1, FieldHeight + 1);
        //console.log("down " + cell.row + "; " + cell.column)
    }

    applyPattern(/** @type {Cell} */ cell, command) {
        if (this.selectedCell) {
            if (command == 1) {
                this.selectedCell.layers[2].setCell(cell.row, cell.column);
                this.selectedCell = undefined;
            }
        } else {
            console.log("Player not selected -> unexpected")
        }
    }

    onCellUp(/** @type {Cell} */ cell) {
        //console.log("up " + cell.row + "; " + cell.column)
    }
    
    onCellOver(/** @type {Cell} */ cell) {
        this.currentCell = cell;
        //console.log("over " + cell.row + "; " + cell.column)
    }

    onCellOut(/** @type {Cell} */ cell) {
        this.currentCell = undefined;
        //console.log("out " + cell.row + "; " + cell.column)
    }
}
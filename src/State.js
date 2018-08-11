//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "Gameover": 3, 
})

var Action = Object.freeze({
    "None": 1,
    "Fire": 2, 
    "Jump": 3, 
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

        this.actionMode = Action.None;
        this.attackOverlay = new Overlay(OverlayType.Attack);
        this.attackPattern = undefined;
        this.attackMovePattern = attackMovePattern;

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
        var playerObject2 = new GameObject(playerSprite2, GameObjectType.AI);
        playerObject2.setCell(2, 2);

        this.initUi();
    }

    initUi() {
        var self = this;
        var action1Sprite = PIXI.Sprite.fromImage('overlay_base')
        action1Sprite.anchor.set(0.5);
        app.stage.addChild(action1Sprite);
        action1Sprite.interactive = true;
        action1Sprite.x = game.camera.targetScreenSize / 2.0 - action1Sprite.width / 2.0;
        action1Sprite.y = game.camera.targetScreenSize / 2.0 - action1Sprite.height / 2.0;
        action1Sprite.on('pointerup', () => {
            self.onAction(Action.Jump);
        });

        var action2Sprite = PIXI.Sprite.fromImage('overlay_base')
        action2Sprite.anchor.set(0.5);
        app.stage.addChild(action2Sprite);
        action2Sprite.interactive = true;
        action2Sprite.x = -game.camera.targetScreenSize / 2.0 + action1Sprite.width / 2.0;
        action2Sprite.y = game.camera.targetScreenSize / 2.0 - action1Sprite.height / 2.0;
        action2Sprite.on('pointerup', () => {
            self.onAction(Action.Fire);
        });
    }

    onAction(action) {
        if (!this.selectedCell) {
            return;
        }
        if (this.actionMode == action) {
            this.actionMode = Action.None;
        } else {
            this.actionMode = action;
            switch(action) {
                case Action.Fire:
                    this.attackPattern = attackPattern;
                break;
                case Action.Jump:
                    this.attackPattern = jumpPattern;
                break;
            }
        }
    }

    update(dt) {
        this.stage.update(dt);
        if (this.selectedCell) {
            if (this.actionMode != Action.None) {
                this.moveOverlay.type = OverlayType.Attack;
                this.moveOverlay.drawOverlay(this.selectedCell, this.attackMovePattern, this.actionMode);
                if (this.moveOverlay.isWithin(this.currentCell, this.selectedCell, this.attackMovePattern, this.actionMode)) {
                    this.attackOverlay.drawOverlay(this.currentCell, this.attackPattern, this.actionMode);
                } else {
                    this.attackOverlay.hideOverlay();
                }
            } else {
                this.moveOverlay.type = OverlayType.Move;
                this.moveOverlay.drawOverlay(this.selectedCell, movePattern, this.actionMode);
            }
        } else {
            this.moveOverlay.hideOverlay();
            this.attackOverlay.hideOverlay();
        }
    }
    
    setupPayingField() {
        this.stage.setupPayingField(FieldWidth, FieldHeight);
    }

    onCellDropped(/** @type {Cell} */ cell) {

    }

    onCellDown(/** @type {Cell} */ cell) {
        switch (this.actionMode) {
            case Action.None:
                this.tryToMove(cell);
            break;
            case Action.Fire:
            case Action.Jump:
                // Try to apply attack pattern
                if (this.moveOverlay.isWithin(this.currentCell, this.selectedCell, this.attackMovePattern)) {
                    var success = this.attackOverlay.apply(cell, cell, this.movePattern, this.actionMode);
                    if (success) {
                        this.selectedCell = undefined;
                        this.actionMode = Action.None;
                    }
                }
            break;
        }

        //this.overlay.apply(this.selectedCell, movePattern);
        //app.stage.removeChildren();
        //this.stage.setupPayingField(FieldWidth + 1, FieldHeight + 1);
        //console.log("down " + cell.row + "; " + cell.column)
    }

    tryToMove(/** @type {Cell} */ cell) {
        if (cell.layers[2]) {
            if (this.selectedCell) {
                switch (cell.layers[2].type) {
                    case GameObjectType.Player:
                        // Switch to other unit
                        this.selectedCell = cell;
                    return;
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
            var success = this.moveOverlay.apply(this.selectedCell, cell, this.movePattern, this.actionMode);
            if (!success) {
                this.selectedCell = undefined;
            }
        }
    }

    applyAction(/** @type {Cell} */ cell, command, action) {
        if (this.selectedCell) {
            if (command == 1) {
                this.selectedCell.layers[2].setCell(cell.row, cell.column);
            } else if (action == Action.Jump) {
                this.selectedCell.layers[2].setCell(cell.row, cell.column);
            } else if (action == Action.Fire) {
            console.log("Fire at " + cell.row + " " + cell.column);
            }
        } else {
            console.log("Player not selected -> unexpected")
        }
        this.selectedCell = undefined;
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
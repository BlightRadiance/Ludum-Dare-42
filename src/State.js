//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "AiTurn": 3, 
    "Gameover": 4, 
})

var Action = Object.freeze({
    "None": 1,
    "Fire": 2, 
    "Jump": 3, 
})

var FieldWidth = 5;
var FieldHeight = 5;

class State {
    constructor() {
        this.paused = false;
        this.state = GameStates.Play;
        this.stage = new Stage();
        
        this.moveOverlay = new Overlay(OverlayType.Move);
        this.movePattern = movePattern;

        this.actionMode = Action.None;
        this.attackOverlay = new Overlay(OverlayType.Attack);
        this.attackPattern = undefined;
        this.attackMovePattern = undefined;

        this.mouseOverCell = undefined;
        this.selectedCell = undefined;

        this.gameObjects = new Array();
        this.playerObject = undefined;
    }

    init() {
        this.setupPayingField();
        this.moveOverlay.init();
        this.attackOverlay.init();
        this.setupObjects();
        this.initUi();
        this.moveToState(GameStates.Play);
    }

    setupObjects() {
        var playerSprite1 = PIXI.Sprite.fromImage('player')
        playerSprite1.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite1);
        var playerObject1 = new GameObject(playerSprite1, GameObjectType.Player);
        playerObject1.setCell(0, 0);
        this.gameObjects.push(playerObject1);
        this.playerObject = playerObject1;

        var playerSprite2 = PIXI.Sprite.fromImage('player')
        playerSprite2.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite2);
        var playerObject2 = new GameObject(playerSprite2, GameObjectType.AI);
        playerObject2.setCell(2, 2);
        this.gameObjects.push(playerObject2);
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
                    this.attackMovePattern = attackMovePattern;
                break;
                case Action.Jump:
                    this.attackPattern = jumpPattern;
                    this.attackMovePattern = jumpMovePattern;
                break;
            }
        }
    }

    moveToState(state) {
        switch(this.state) {
            case GameStates.Play:
            this.moveOverlay.hideOverlay();
            this.attackOverlay.hideOverlay();
            this.actionMode = Action.None;
            this.selectedCell = undefined;
            break;
        }

        this.state = state;
        switch(this.state) {
            case GameStates.Play:
            this.selectedCell = this.playerObject.currentCell;
            break;
            case GameStates.AiTurn:
            this.moveToNextState();
            break;
        }
    }

    moveToNextState() {
        switch(this.state) {
            case GameStates.Play: this.moveToState(GameStates.AiTurn); break;
            case GameStates.AiTurn: this.moveToState( GameStates.Play); break;
            case GameStates.Tutorial: this.moveToState( GameStates.Play); break;
            case GameStates.Gameover: this.moveToState( GameStates.Play); break;
        }
    }

    update(dt) {
        this.gameObjects.forEach(o => {
            o.update(dt);
        });
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
        if (cell && cell.layers[2]) {
            console.log("Drop: " + cell.layers[2]);
            cell.layers[2].unmanage(true);
        }
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
                        this.moveToNextState();
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
        if (!cell.layers[2]) {
            // Try to apply move pattern
            var success = this.moveOverlay.apply(this.selectedCell, cell, this.movePattern, this.actionMode);
            if (success) {
                this.moveToNextState();
            }
        }
    }

    applyAction(/** @type {Cell} */ cell, command, action) {
        if (this.selectedCell) {
            if (command == 1) {
                this.selectedCell.layers[2].setCell(cell.row, cell.column);
            } else if (action == Action.Jump) {
                this.jump(cell);
            } else if (action == Action.Fire) {
                this.fire(cell);
            }
        } else {
            console.log("Player not selected -> unexpected")
        }
        this.moveToNextState();
    }

    fire(/** @type {Cell} */ cell) {
        var dirX = cell.column - this.selectedCell.column;
        var dirY = cell.row - this.selectedCell.row;
        if (Math.abs(dirY) > Math.abs(dirX)) {
            dirY /= Math.abs(dirY);
            dirX = 0;
        } else {
            dirX /= Math.abs(dirX);
            dirY = 0;
        }
        this.spash(dirX, dirY, cell);
        cell.state = CellState.Falling;
    }

    jump(/** @type {Cell} */ cell) {
        this.selectedCell.layers[2].setCell(cell.row, cell.column);
        this.spash(-1, 0, this.stage.getCell(cell.row, cell.column - 1));
        this.spash(1, 0, this.stage.getCell(cell.row, cell.column + 1));
        this.spash(0, 1, this.stage.getCell(cell.row + 1, cell.column));
        this.spash(0, -1, this.stage.getCell(cell.row - 1, cell.column));
    }

    spash(dirX, dirY, cell) {
        if (cell && cell.layers[2]) {
            switch (cell.layers[2].type) {
                case GameObjectType.AI:
                    var newColumn = cell.column + dirX;
                    var newRow = cell.row + dirY;
                    var newCell = this.stage.getCell(newRow, newColumn);
                    if (newCell && newCell.state == CellState.Ok) {
                        cell.layers[2].setCell(newRow, newColumn);
                    } else {
                        var layers = this.stage.getLayers(newRow, newColumn);
                        cell.layers[2].graphics.parentGroup = layers.layerPlayer;
                        cell.layers[2].setFalling(this.stage.getCellXPosition(newRow, newColumn), 
                                                  this.stage.getCellYPosition(newRow, newColumn));
                    }
                break;
                case GameObjectType.Building:

                break;
            }
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
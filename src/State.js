//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "AiTurn": 3, 
    "Gameover": 4, 
    "Win": 5,
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

        this.restartButton = undefined;
        this.camera = new Camera();

        this.level = new Level();
        this.currentLevel = 0;
    }

    init() {
        this.initLayers();
        this.setupText();
        this.level.setupLevel(this.currentLevel)
        this.moveOverlay.init();
        this.attackOverlay.init();
        this.initUi();
        this.moveToState(GameStates.Play);
        onResizeWindow();
    }

    setupText() {
        var style = new PIXI.TextStyle({
            fontSize: 36,
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 5,
        });
        this.text = new PIXI.Text('TESETETSTSET', style);
        this.text.x = 0;
        this.text.y = 0;
        this.text.anchor.set(0);
        this.text.parentGroup = this.layerUi;
        this.text.y = -this.camera.targetScreenSize / 2.0 + 50;
        this.text.x = this.camera.targetScreenSize / 2.0 - 350;
        app.stage.addChild(this.text);
    }

    setupObjects() {

    }

    initUi() {
        var self = this;
        var action1Sprite = PIXI.Sprite.fromImage('overlay_base')
        action1Sprite.anchor.set(0.5);
        app.stage.addChild(action1Sprite);
        action1Sprite.interactive = true;
        action1Sprite.x = this.camera.targetScreenSize / 2.0 - action1Sprite.width / 2.0;
        action1Sprite.y = this.camera.targetScreenSize / 2.0 - action1Sprite.height / 2.0;
        action1Sprite.on('pointerup', () => {
            self.onAction(Action.Jump);
        });

        var action2Sprite = PIXI.Sprite.fromImage('overlay_base')
        action2Sprite.anchor.set(0.5);
        app.stage.addChild(action2Sprite);
        action2Sprite.interactive = true;
        action2Sprite.x = -this.camera.targetScreenSize / 2.0 + action1Sprite.width / 2.0;
        action2Sprite.y = this.camera.targetScreenSize / 2.0 - action1Sprite.height / 2.0;
        action2Sprite.on('pointerup', () => {
            self.onAction(Action.Fire);
        });

        this.restartButton = PIXI.Sprite.fromImage('overlay_base')
        this.restartButton.anchor.set(0.5);
        app.stage.addChild(this.restartButton);
        this.restartButton.x = -this.camera.targetScreenSize / 2.0 + action1Sprite.width / 2.0;
        this.restartButton.y = -this.camera.targetScreenSize / 2.0 + action1Sprite.height / 2.0;
        this.restartButton.interactive = true;
        this.restartButton.parentGroup =  this.layerUi;
        this.restartButton.on('pointerup', () => {
            self.moveToState(GameStates.Gameover);
            self.moveToNextState();
        });
    }

    initLayers() {
        app.stage = new PIXI.display.Stage();
        app.stage.group.enableSort = true;

        this.layerUi = new PIXI.display.Group(1000, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerUi));

        this.layerBackground = new PIXI.display.Group(-1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerBackground));
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

    reinit() {
        app.stage.removeChildren();
        this.level.setupLevel(this.currentLevel);
        this.init();
    }

    moveToState(state) {
        console.log("Move to state: " + state);
        var oldState = this.state;
        this.state = state;
        switch(oldState) {
            case GameStates.Play:
                this.moveOverlay.hideOverlay();
                this.attackOverlay.hideOverlay();
                this.actionMode = Action.None;
                this.selectedCell = undefined;
            break;
            case GameStates.Win:
            case GameStates.Gameover:
                this.reinit();
            break;
        }

        switch(this.state) {
            case GameStates.Play:
                this.text.text = "Player's turn";
                this.selectedCell = this.level.playerObject.currentCell;
            break;
            case GameStates.AiTurn:
                this.text.text = "Enemy's turn";
                this.moveToNextState();
            break;

            case GameStates.Win:
                this.text.text = "You have won!";
            break;
            case GameStates.Gameover:
                this.text.text = "Game over!\nPress restart button";
            break;
        }
    }

    moveToNextState() {
        switch(this.state) {
            case GameStates.Play: this.moveToState(GameStates.AiTurn); break;
            case GameStates.AiTurn: this.moveToState( GameStates.Play); break;
            case GameStates.Tutorial: this.moveToState( GameStates.Play); break;
            case GameStates.Gameover: this.moveToState( GameStates.Play); break;
            case GameStates.Win: this.moveToState( GameStates.Play); break;
        }
    }

    update(dt) {
        if (this.state == GameStates.Gameover 
            || this.state == GameStates.Win) {
                return;
        }
        this.level.gameObjects.forEach(o => {
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

    onCellDropped(/** @type {Cell} */ cell) {
        if (cell && cell.layers[2]) {
            this.onGameObjectDropped(cell.layers[2]);
        }
    }

    onGameObjectDropped(/** @type {GameObject} */ obj) {
        console.log("Drop: " + obj);
        obj.unmanage(true);
    }

    onPlayerDropped() {
        state.moveToState(GameStates.Gameover);
    }

    onEnemyDropped() {
        this.level.enemyCount -= 1;
        if (this.level.enemyCount <= 0) {
            this.moveToState(GameStates.Win);
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
                    this.attackOverlay.apply(cell, cell, this.movePattern, this.actionMode);
                }
            break;
        }

        //this.overlay.apply(this.selectedCell, movePattern);
        //console.log("down " + cell.row + "; " + cell.column)
    }

    tryToMove(/** @type {Cell} */ cell) {
        if (!cell.layers[2]) {
            // Try to apply move pattern
            this.moveOverlay.apply(this.selectedCell, cell, this.movePattern, this.actionMode);
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
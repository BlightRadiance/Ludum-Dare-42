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
    "Artillery": 4, 
})

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

        this.reseting = false;
    }

    init() {
        this.initLayers();
        this.setupText();
        this.level.setupLevel(this.currentLevel)
        this.initUi();
        this.moveToState(GameStates.Play);
        onResizeWindow();
    }

    setupText() {
        var style = new PIXI.TextStyle({
            fontSize: 30,
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
        this.text.x = this.camera.targetScreenSize / 2.0 - 300;
        app.stage.addChild(this.text);
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
            if (this.state == GameStates.Win) {
                this.currentLevel += 1;
                self.moveToNextState();
            } else {
                self.moveToState(GameStates.Gameover);
                self.moveToNextState();
            }
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
        this.reseting = true;
        this.nextEnemyObjectIndex = 0;
        this.level.gameObjects.forEach(o => {
            o.unmanage(true);
        });
        app.stage.removeChildren();
        this.level.setupLevel(this.currentLevel);
        this.reseting = false;
        this.init();
    }

    moveToState(state) {
        if (this.reseting) {
            return;
        }
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
                this.aiTurnsLeft = this.level.enemyCount;
                this.nextEnemyObjectIndex = 0;
                this.text.text = "Enemy's turn";
                this.doAiMove();
            break;

            case GameStates.Win:
                this.text.text = "You have won!";
            break;
            case GameStates.Gameover:
                this.text.text = "Game over!\nPress restart button";
            break;
        }
    }

    doAiMove() {
        for (var i = this.nextEnemyObjectIndex; i < this.level.gameObjects.length; ++i) {
            var obj = this.level.gameObjects[i];
            if (obj.type == GameObjectType.AI) {
                this.lastSelectedAi = obj;
                this.nextEnemyObjectIndex = i + 1;
                obj.onAiMove();
                return;
            }
        }
        // No more enemies
        this.moveToNextState();
    }

    onAiMoveFinished(success) {
        console.log("onAiMoveFinished")
        if (success) {
            this.aiTurnsLeft -= 1;
        }
        if (this.aiTurnsLeft <= 0) {
            // Player might lose already
            if (this.state == GameStates.AiTurn) {
                this.moveToNextState();
            }
        } else {
            this.doAiMove();
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
        this.aiTurnsLeft -= 1;
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
        // If player's turn
        if (this.selectedCell) {
            if (command == 1) {
                this.selectedCell.layers[2].setCell(cell.row, cell.column);
            } else if (action == Action.Jump) {
                this.aoeSplash(cell, false);
            } else if (action == Action.Fire) {
                this.fire(this.selectedCell, cell);
            }
            this.moveToNextState();
        } else if (this.state == GameStates.AiTurn) {
            if (command == 1) {
                this.lastSelectedAi.currentCell.layers[2].setCell(cell.row, cell.column);
            } else if (action == Action.Fire) {
                this.fire(this.lastSelectedAi.currentCell, cell);
            } else if (action == Action.Artillery) {
                this.fire(this.lastSelectedAi.currentCell, cell);
                this.aoeSplash(cell, true);
            }
        } else {
            console.log("Player not selected -> unexpected")
        }
    }

    fire(/** @type {Cell} */ fromCell, /** @type {Cell} */ toCell) {
        var dirX = toCell.column - fromCell.column;
        var dirY = toCell.row - fromCell.row;
        if (dirX != 0) {
            dirX /= Math.abs(dirX);
        }
        if (dirY != 0) {
            dirY /= Math.abs(dirY);
        }
        this.splash(dirX, dirY, toCell);
        toCell.state = CellState.Falling;
    }

    aoeSplash(/** @type {Cell} */ cell, isArtillery) {
        if (!isArtillery) {
            this.selectedCell.layers[2].setCell(cell.row, cell.column);
        }
        this.splash(-1, 0, this.stage.getCell(cell.row, cell.column - 1));
        this.splash(1, 0, this.stage.getCell(cell.row, cell.column + 1));
        this.splash(0, 1, this.stage.getCell(cell.row + 1, cell.column));
        this.splash(0, -1, this.stage.getCell(cell.row - 1, cell.column));
    }

    splash(dirX, dirY, cell) {
        if (cell && cell.layers[2]) {
            switch (cell.layers[2].type) {
                case GameObjectType.Player:
                case GameObjectType.AI:
                    var newColumn = cell.column + dirX;
                    var newRow = cell.row + dirY;
                    var newCell = this.stage.getCell(newRow, newColumn);
                    if (newCell && newCell.state == CellState.Ok) {
                        if (!newCell.layers[2]) {
                            cell.layers[2].setCell(newRow, newColumn);
                        } else {
                            this.splash(dirX, dirY, newCell);
                        }
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
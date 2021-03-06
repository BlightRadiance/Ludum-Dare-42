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
        this.state = GameStates.Tutorial;
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
        this.tutorialShown = false;
    }

    init() {
        this.initLayers();
        this.setupText();
        this.level.setupLevel(this.currentLevel)
        this.initUi();
        if (!this.tutorialShown) {
            this.moveToState(GameStates.Tutorial);
        } else {
            this.moveToState(GameStates.Play);
        }
        onResizeWindow();
    }

    setupText() {
        var style = new PIXI.TextStyle({
            fontSize: 50,
            fontWeight: 'bold',
            stroke: '#AAAAAA',
            strokeThickness: 2,
            align: 'center',
        });
        this.text = new PIXI.Text('', style);
        this.text.x = 0;
        this.text.y = 0;
        this.text.anchor.set(0);
        this.text.parentGroup = this.layerUi;
        this.text.y = -this.camera.targetScreenSize / 2.0 + 100;
        this.text.x = this.camera.targetScreenSize / 2.0 - 330;
        app.stage.addChild(this.text);
    }

    initUi() {
        var self = this;

        this.jumpTexture = PIXI.Texture.fromImage('button_jump');
        this.fireTexture = PIXI.Texture.fromImage('button_fire');
        this.cancelTexture = PIXI.Texture.fromImage('button_cancel');

        this.tutorial = PIXI.Sprite.fromImage('tut')
        this.tutorial.anchor.set(0.5);
        app.stage.addChild(this.tutorial);
        this.tutorial.interactive = true;
        this.tutorial.buttonMode = true;
        this.tutorial.parentGroup =  this.layerTutorial;
        this.tutorial.scale.x = this.camera.targetScreenSize / this.tutorial.width;
        this.tutorial.scale.y = this.camera.targetScreenSize / this.tutorial.height;
        this.tutorial.visible = !this.tutorialShown;
        this.tutorial.on('pointerup', () => {
            this.tutorialShown = true;
            self.moveToState(GameStates.Play)
            this.tutorial.visible = false;
        });

        this.jumpButton = new PIXI.Sprite(this.jumpTexture);
        this.jumpButton.anchor.set(0.5);
        app.stage.addChild(this.jumpButton);
        this.jumpButton.interactive = true;
        this.jumpButton.buttonMode = true;
        this.jumpButton.parentGroup =  this.layerUi;
        this.jumpButton.x = this.camera.targetScreenSize / 2.0 - this.jumpButton.width / 2.0;
        this.jumpButton.y = this.camera.targetScreenSize / 2.0 - this.jumpButton.height / 2.0;
        this.jumpButton.on('pointerup', () => {
            self.onAction(Action.Jump);
        });

        this.fireButton = new PIXI.Sprite(this.fireTexture);
        this.fireButton.anchor.set(0.5);
        app.stage.addChild(this.fireButton);
        this.fireButton.interactive = true;
        this.fireButton.parentGroup =  this.layerUi;
        this.fireButton.buttonMode = true;
        this.fireButton.x = -this.camera.targetScreenSize / 2.0 + this.jumpButton.width / 2.0;
        this.fireButton.y = this.camera.targetScreenSize / 2.0 - this.jumpButton.height / 2.0;
        this.fireButton.on('pointerup', () => {
            self.onAction(Action.Fire);
        });

        this.restartButton = PIXI.Sprite.fromImage('button_restart');
        this.restartButton.anchor.set(0.5);
        app.stage.addChild(this.restartButton);
        this.restartButton.x = -this.camera.targetScreenSize / 2.0 + this.jumpButton.width / 1.5;
        this.restartButton.buttonMode = true;
        this.restartButton.y = -this.camera.targetScreenSize / 2.0 + this.jumpButton.height / 2.0;
        this.restartButton.interactive = true;
        this.restartButton.parentGroup =  this.layerUi;
        this.restartButton.on('pointerup', () => {
            if (this.state == GameStates.Win) {
                this.currentLevel += 1;
                self.moveToNextState();
            } else {
                self.moveToState(GameStates.Gameover);
                self.moveToState(GameStates.Play);
            }
        });

        this.nextButton = PIXI.Sprite.fromImage('button_next')
        this.nextButton.anchor.set(0.5);
        app.stage.addChild(this.nextButton);
        this.nextButton.x = -this.camera.targetScreenSize / 2.0 + this.jumpButton.width / 2.0;
        this.nextButton.y = -this.camera.targetScreenSize / 2.0 + this.jumpButton.height / 2.0;
        this.nextButton.buttonMode = true;
        this.nextButton.interactive = false;
        this.nextButton.visible = false;
        this.nextButton.parentGroup =  this.layerUi;
        this.nextButton.on('pointerup', () => {
            if (this.state == GameStates.Win) {
                this.currentLevel += 1;
                self.moveToNextState();
            } else {
                self.moveToState(GameStates.Gameover);
                self.moveToNextState();
            }
        });

        this.helpButton = PIXI.Sprite.fromImage('button_help');
        this.helpButton.anchor.set(0.5);
        app.stage.addChild(this.helpButton);
        this.helpButton.x = -this.camera.targetScreenSize / 2.0 + this.jumpButton.width / 2.8;
        this.helpButton.buttonMode = true;
        this.helpButton.y = -this.camera.targetScreenSize / 2.0 + this.jumpButton.height * 0.8;
        this.helpButton.interactive = true;
        this.helpButton.parentGroup =  this.layerUi;
        this.helpButton.scale.x = 0.5;
        this.helpButton.scale.y = 0.5;
        this.helpButton.on('pointerup', () => {
            self.moveToState(GameStates.Tutorial);
            self.tutorial.visible = true;
        });

    }

    initLayers() {
        app.stage = new PIXI.display.Stage();
        app.stage.group.enableSort = true;

        this.layerUi = new PIXI.display.Group(1000, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerUi));

        this.layerTutorial = new PIXI.display.Group(1001, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerTutorial));

        this.layerBackground = new PIXI.display.Group(-1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerBackground));
    }

    onAction(action) {
        if (!this.selectedCell) {
            return;
        }
        if (this.actionMode == action) {
            switch (action) {
                case Action.Fire:
                    this.fireButton.texture = this.fireTexture;
                break;
                case Action.Jump:
                    this.jumpButton.texture = this.jumpTexture;
                break;
            }
            this.actionMode = Action.None;
        } else {
            this.actionMode = action;
            switch(action) {
                case Action.Fire:
                    this.attackPattern = attackPattern;
                    this.attackMovePattern = attackMovePattern;
                    this.fireButton.texture = this.cancelTexture;
                    this.jumpButton.texture = this.jumpTexture;
                break;
                case Action.Jump:
                    this.attackPattern = jumpPattern;
                    this.attackMovePattern = jumpMovePattern;
                    this.jumpButton.texture = this.cancelTexture;
                    this.fireButton.texture = this.fireTexture;
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
                this.fireButton.interactive = false;
                this.fireButton.visible = false;
                this.jumpButton.interactive = false;
                this.jumpButton.visible = false;
                this.helpButton.visible = false;
            break;
            case GameStates.Win:
                this.restartButton.interactive = true;
                this.restartButton.visible = true;
                this.nextButton.interactive = false;
                this.nextButton.visible = false;
                this.reinit();
            break;
            case GameStates.Gameover:
                this.reinit();
            break;
        }

        switch(this.state) {
            case GameStates.Play:
                this.text.text = "Player's turn";
                this.selectedCell = this.level.playerObject.currentCell;
                this.fireButton.interactive = true;
                this.fireButton.visible = true;
                this.jumpButton.interactive = true;
                this.jumpButton.visible = true;
                this.fireButton.texture = this.fireTexture;
                this.jumpButton.texture = this.jumpTexture;
                this.helpButton.visible = true;
            break;
            case GameStates.AiTurn:
                this.aiTurnsLeft = this.level.enemyCount;
                this.nextEnemyObjectIndex = 0;
                this.text.text = "Enemy's turn";
                this.doAiMove();
            break;

            case GameStates.Win:
                this.nextButton.interactive = true;
                this.nextButton.visible = true;
                this.restartButton.interactive = false;
                this.restartButton.visible = false;
                this.text.text = "You have won!";
            break;
            case GameStates.Gameover:
                this.text.text = "Game over!";
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
            case GameStates.AiTurn: this.moveToState(GameStates.Play); break;
            case GameStates.Tutorial: this.moveToState(GameStates.Tutorial); break; // Allow only manual change
            case GameStates.Gameover: this.moveToState(GameStates.Play); break;
            case GameStates.Win: this.moveToState(GameStates.Play); break;
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
        this.currentCell = cell;
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
                            if (dirX != 0 && dirY != 0) {
                                this.splash(dirX, dirY, newCell);
                            }
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
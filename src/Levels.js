//@ts-check
class Level {
    constructor() {
        this.gameObjects = new Array();
        this.playerObject = undefined;
        this.enemyCount = 0;
    }
 
    setupLevel(id) {
        this.enemyCount = 0;
        this.gameObjects = new Array();

        switch (id) {
            case 0:
            state.stage.setupPayingField(4, 4);
            this.setupPlayer(1, 1);
            this.setupAi(3, 3, AiType.Rush);
            break;
            case 1:
            state.stage.setupPayingField(4, 4);
            this.setupPlayer(1, 1);
            this.setupAi(2, 3, AiType.Rush);
            this.setupAi(3, 2, AiType.Rush);
            break;
            case 2:
            state.stage.setupPayingField(6, 6);
            this.setupPlayer(1, 1);
            this.setupAi(5, 5, AiType.Range);
            break;
            case 3:
            state.stage.setupPayingField(10, 10);
            this.setupPlayer(2, 2);
            this.setupAi(8, 4, AiType.Range);
            this.setupAi(4, 8, AiType.Range);
            break;
            case 4:
            state.stage.setupPayingField(10, 10);
            this.setupPlayer(2, 2);
            this.setupAi(2, 3, AiType.Rush);
            this.setupAi(3, 2, AiType.Rush);
            this.setupAi(8, 4, AiType.Range);
            this.setupAi(4, 8, AiType.Range);
            break;
            case 5:
            state.stage.setupPayingField(6, 6);
            this.setupPlayer(1, 1);
            this.setupAi(2, 2, AiType.Rush);
            this.setupAi(2, 4, AiType.Rush);
            this.setupAi(5, 5, AiType.Rush);
            this.setupAi(4, 2, AiType.Rush);
            this.setupAi(4, 4, AiType.Range);
            break;
            default:
            this.setupRadndom();
            break;
        }
        this.remomoveRandomCells(state.stage.cellsColumnsCount * state.stage.cellsColumnsCount * 0.5 * Math.random());
    }

    setupPlayer(row, column) {
        var factory = dragonBones.PixiFactory.factory;
        factory.parseDragonBonesData(game.pixiResources["resource/player/ld_player_ske.json"].data);
        factory.parseTextureAtlasData(game.pixiResources["resource/player/ld_player_tex.json"].data, game.pixiResources["resource/player/ld_player_tex.png"].texture);

        this.armatureDisplay = factory.buildArmatureDisplay("Armature", "ld_player");
        this.armatureDisplay.animation.play("idle", 0);
        this.armatureDisplay.x = 0.0;
        this.armatureDisplay.y = 0.0;
        this.armatureDisplay.scale.x = 0.8;
        this.armatureDisplay.scale.y = 0.8;
        app.stage.addChild(this.armatureDisplay);
        var playerObject1 = new GameObject(this.armatureDisplay, GameObjectType.Player);
        playerObject1.setCell(row, column);
        this.gameObjects.push(playerObject1);
        this.playerObject = playerObject1;
    }

    setupAi(row, column, aiType) {
        this.enemyCount += 1;
        var playerSprite2 = PIXI.Sprite.fromImage('player')
        playerSprite2.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite2);
        var playerObject2 = new GameObject(playerSprite2, GameObjectType.AI, aiType);
        playerObject2.setCell(row, column);
        this.gameObjects.push(playerObject2);
    }

    setupRadndom() {

    }

    remomoveRandomCells(count) {
        while(count >= 0) {
            var x = getRandBetween(state.stage.cellsColumnsCount);
            var y = getRandBetween(state.stage.cellsRowsCount);
            var cell = state.stage.getCell(y, x);
            if (cell && !cell.layers[2]) {
                cell.state = CellState.Falling;
            }
            count -= 1;
        }
    }
}
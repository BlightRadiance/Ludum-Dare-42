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
        var armatureDisplay = factory.buildArmatureDisplay("Armature", "ld_player");
        armatureDisplay.animation.play("idle", 0);
        armatureDisplay.x = 0.0;
        armatureDisplay.y = 0.0;
        armatureDisplay.scale.x = 0.8;
        armatureDisplay.scale.y = 0.8;
        app.stage.addChild(armatureDisplay);
        var playerObject1 = new GameObject(armatureDisplay, GameObjectType.Player);
        playerObject1.setCell(row, column);
        this.gameObjects.push(playerObject1);
        this.playerObject = playerObject1;
    }

    setupAi(row, column, aiType) {
        this.enemyCount += 1;
        var armatureDisplay = undefined;
        switch (aiType) {
            case AiType.Rush:
                var factory = dragonBones.PixiFactory.factory;      
                armatureDisplay = factory.buildArmatureDisplay("Rush", "ld_rush");
                armatureDisplay.animation.play("idle", 0);
                armatureDisplay.x = 0.0;
                armatureDisplay.y = 0.0;
                armatureDisplay.scale.x = 0.8;
                armatureDisplay.scale.y = 0.8;
            break;
            case AiType.Range:
                var factory = dragonBones.PixiFactory.factory;
                armatureDisplay = factory.buildArmatureDisplay("Range", "ld_range");
                armatureDisplay.animation.play("idle", 0);
                armatureDisplay.x = 0.0;
                armatureDisplay.y = 0.0;
                armatureDisplay.scale.x = 0.8;
                armatureDisplay.scale.y = 0.8;
            break;
        }
        app.stage.addChild(armatureDisplay);
        var enemy = new GameObject(armatureDisplay, GameObjectType.AI, aiType);
        enemy.setCell(row, column);
        this.gameObjects.push(enemy);
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
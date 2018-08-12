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
        state.stage.setupPayingField(10, 10);
        this.setupPlayer(2, 2);
        this.setupAi(5, 5, AiType.Range);
        /*this.setupAi(5, 6, AiType.Rush);
        this.setupAi(5, 7, AiType.Rush);
        this.setupAi(6, 5, AiType.Rush);
        this.setupAi(7, 5, AiType.Rush);*/
        this.remomoveRandomCells(10);
    }

    setupPlayer(row, column) {
        var playerSprite1 = PIXI.Sprite.fromImage('player')
        playerSprite1.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite1);
        var playerObject1 = new GameObject(playerSprite1, GameObjectType.Player);
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
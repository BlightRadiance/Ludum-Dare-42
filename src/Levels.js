//@ts-check
class Level {
    constructor() {
        this.gameObjects = new Array();
        this.playerObject = undefined;
        this.enemyCount = 0;
    }
 
    setupLevel(id) {
        this.gameObjects = new Array();
        state.stage.setupPayingField(FieldWidth, FieldHeight);
        this.setupPlayer(0, 0);
        this.setupAi(2, 2);
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

    setupAi(row, column) {
        this.enemyCount += 1;
        var playerSprite2 = PIXI.Sprite.fromImage('player')
        playerSprite2.anchor.set(0.5, 0.7);
        app.stage.addChild(playerSprite2);
        var playerObject2 = new GameObject(playerSprite2, GameObjectType.AI);
        playerObject2.setCell(row, column);
        this.gameObjects.push(playerObject2);
    }

    setupRadndom() {

    }
}
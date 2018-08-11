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
        this.overlay = new Overlay();
        this.mouseOverCell = undefined;
        this.selectedCell = undefined;
    }

    init() {
        this.setupPayingField();
        this.overlay.init();

        var player = PIXI.Sprite.fromImage('player')
        player.anchor.set(0.5, 0.7);
        app.stage.addChild(player);
        this.player = new GameObject(player, GameObjectType.Player);
        this.player.setCell(0, 0);
    }

    update(dt) {
        this.stage.update(dt);
        if (this.currentCell) {
            this.overlay.drawOverlay(this.currentCell, this.selectedCell, movePattern);
        } else {
            this.overlay.hideOverlay();
        }
    }
    
    setupPayingField() {
        this.stage.setupPayingField(FieldWidth, FieldHeight);
    }

    onCellDropped(/** @type {Cell} */ cell) {

    }

    onCellDown(/** @type {Cell} */ cell) {
        if (cell.layers[2]) {
            this.selectedCell = cell;
        }
        this.overlay.apply(this.currentCell, this.selectedCell, movePattern);
        //app.stage.removeChildren();
        //this.stage.setupPayingField(FieldWidth + 1, FieldHeight + 1);
        //console.log("down " + cell.row + "; " + cell.column)
    }

    onCellUp(/** @type {Cell} */ cell) {
        //console.log("up " + cell.row + "; " + cell.column)
    }
    
    onCellOver(/** @type {Cell} */ cell) {
        this.currentCell = cell;
        console.log("over " + cell.row + "; " + cell.column)
    }

    onCellOut(/** @type {Cell} */ cell) {
        this.currentCell = undefined;
        //console.log("out " + cell.row + "; " + cell.column)
    }
}
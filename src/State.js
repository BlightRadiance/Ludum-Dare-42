//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "Gameover": 3, 
})

var FieldWidth = 6;
var FieldHeight = 9;

class State {
    constructor() {
        this.paused = false;
        this.state = GameStates.Play;
        this.stage = new Stage();
        this.overlay = new Overlay();
        this.currentCell = undefined;
    }

    init() {
        this.setupPayingField();
        this.overlay.init();
    }

    update(dt) {
        this.stage.update(dt);

        this.stage.clearLayer(1);
        if (this.currentCell) {
            this.overlay.drawOverlay(this.currentCell);
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
        //app.stage.removeChildren();
        //this.stage.setupPayingField(FieldWidth + 1, FieldHeight + 1);
        //console.log("down " + cell.row + "; " + cell.column)
    }

    onCellUp(/** @type {Cell} */ cell) {
        //console.log("up " + cell.row + "; " + cell.column)
    }
    
    onCellOver(/** @type {Cell} */ cell) {
        this.currentCell = cell;
        this.overlay.onCellOver(cell);
        //console.log("over " + cell.row + "; " + cell.column)
    }

    onCellOut(/** @type {Cell} */ cell) {
        this.currentCell = undefined;
        this.overlay.onCellOut(cell);
        //console.log("out " + cell.row + "; " + cell.column)
    }
}
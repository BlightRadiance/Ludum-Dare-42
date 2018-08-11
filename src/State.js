//@ts-check
var GameStates = Object.freeze({
    "Tutorial": 1, 
    "Play": 2, 
    "Gameover": 3, 
})

var FieldWidth = 5;
var FieldHeight = 5;

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
    }
    
    setupPayingField() {
        this.stage.setupPayingField(FieldWidth, FieldHeight);
    }

    onCellDropped(/** @type {Cell} */ cell) {

    }

    onCellDown(/** @type {Cell} */ cell) {
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
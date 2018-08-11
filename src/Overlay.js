//@ts-check
var OverlayType = Object.freeze({
    "CursorGreen": 1, 
    "CursorRed": 2, 
})

class Overlay {
    constructor() {
        this.type = OverlayType.CursorGreen;
    }

    init() {
        this.cursor = PIXI.Sprite.fromImage('overlay_base')
        this.cursor.anchor.set(0.5);
        this.cursor.visible = false;
        app.stage.addChild(this.cursor);
        if (state.currentCell) {
            this.onCellOver(state.currentCell);
        }
    }

    onCellOver(/** @type {Cell} */ cell) {
        this.cursor.visible = true;
        cell.show(this.cursor, 1);
    }

    onCellOut(/** @type {Cell} */ cell) {
        this.cursor.visible = false;
        cell.unmanage(1);
    }
}
//@ts-check
var GameObjectType = Object.freeze({
    "Player": 1, 
    "Building": 2, 
    "AI": 3,
})

class GameObject {
    constructor(graphics, type) {
        this.graphics = graphics;
        this.type = type;
        this.currentCell = undefined;
    }

    setCell(row, column) {
        if (this.currentCell) {
            this.currentCell.unmanage(2);
        }
        this.currentCell = state.stage.getCell(row, column);
        this.currentCell.show(this, 2);
    }
}
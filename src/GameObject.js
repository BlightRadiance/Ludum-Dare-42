//@ts-check
var GameObjectType = Object.freeze({
    "Player": 1, 
    "Building": 2, 
})

class GameObject {
    constructor(graphics, type) {
        this.graphics = graphics;
        this.type = type;
    }

    setCell(row, column) {
        state.stage.getCell(row, column).show(this.graphics, 2);
    }
}
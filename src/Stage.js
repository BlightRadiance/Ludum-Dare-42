//@ts-check

class LayerGroup {
    constructor(base) {
        this.layerStage = new PIXI.display.Group(base, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerStage));

        this.layerPlayer = new PIXI.display.Group(base + 2, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerPlayer));

        this.layerOverlay = new PIXI.display.Group(base + 1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerOverlay));

        this.layerHelp = new PIXI.display.Group(base + 3, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerHelp));
    }
}

class Stage {

    setupPayingField(width, height) {
        this.cells = new Array(width * height);
        this.targetFieldSize = game.camera.targetScreenSize * .8;
        this.targetHalfFieldSize = this.targetFieldSize / 2.0;
        this.cellsColumnsCount = width;
        this.cellsRowsCount = height;

        if (height > width) {
            this.targetCellSize = this.targetFieldSize / height;
        } else {
            this.targetCellSize = this.targetFieldSize / width;
        }
        
        for (var row = 0; row < height; ++row) {
            var layers = new LayerGroup(row * 4);
            for (var column = 0; column < width; ++column) {
                var land1 = PIXI.Sprite.fromImage('land1')
                land1.anchor.set(0.5);
                app.stage.addChild(land1);

                var index = this.getIndex(row, column);
                this.cells[index] = new Cell(column, row, land1, layers);
                this.cells[index].setPosition(this.getCellXPosition(column), this.getCellYPosition(row));
                this.cells[index].setSize(this.targetCellSize);
            }
        }
    }

    setupLayers() {

    }

    update(dt) {
        for (var row = 0; row < this.cellsRowsCount; ++row) {
            for (var column = 0; column < this.cellsColumnsCount; ++column) {
                this.cells[this.getIndex(row, column)].update(dt);
            }
        }
    }

    getIndex(row, column) {
        return row * this.cellsColumnsCount + column;
    }

    getCellXPosition(column) {
        return column * this.targetCellSize 
        - (this.cellsColumnsCount * this.targetCellSize / 2.0)
        + this.targetCellSize / 2.0;
    }

    getCellYPosition(row) {
        return row * this.targetCellSize 
        - (this.cellsRowsCount * this.targetCellSize / 2.0)
        + this.targetCellSize / 2.0;
    }
}
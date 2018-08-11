//@ts-check

class LayerGroup {
    constructor(base) {
        this.layerStage = new PIXI.display.Group(base, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerStage));

        this.layerPlayer = new PIXI.display.Group(base + 3, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerPlayer));

        this.layerOverlay = new PIXI.display.Group(base + 1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerOverlay));

        this.layerHelp = new PIXI.display.Group(base + 2, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerHelp));
    }
}

class Stage {

    setupPayingField(width, height) {
        this.cells = new Array(width * height);
        this.targetFieldSize = game.camera.targetScreenSize;
        this.targetHalfFieldSize = this.targetFieldSize / 2.0;
        this.cellsColumnsCount = width;
        this.cellsRowsCount = height;

        if (height > width) {
            this.targetCellSize = this.targetFieldSize / Math.sqrt(2) / height;
        } else {
            this.targetCellSize = this.targetFieldSize / Math.sqrt(2) / width;
        }
        
        var lrs = Array();
        for (var i = 0; i < this.cellsRowsCount * 2; ++i) {
            lrs.push(new LayerGroup(i * 4))
        }

        for (var row = 0; row < height; ++row) {
            for (var column = 0; column < width; ++column) {
                var land1 = PIXI.Sprite.fromImage('land1')
                land1.anchor.set(0.5);
                land1.rotation = -Math.PI / 4.0;
                app.stage.addChild(land1);

                var index = this.getIndex(row, column);
                this.cells[index] = new Cell(row, column, land1, lrs[7 + row - column]);
                this.cells[index].setPosition(this.getCellXPosition(row, column),
                                              this.getCellYPosition(row, column));
                this.cells[index].setSize(this.targetCellSize);
            }
        }
    }

    setupLayers() {

    }

    clearLayer(layer) {
        for (var i = 0; i < this.cells.length; ++i) {
            this.cells[i].layers[layer] = undefined;
        }
    }

    getCell(row, column) {
        return this.cells[this.getIndex(row, column)];
    }

    update(dt) {
        for (var row = 0; row < this.cellsRowsCount; ++row) {
            for (var column = 0; column < this.cellsColumnsCount; ++column) {
                this.getCell(row, column).update(dt);
            }
        }
    }

    getIndex(row, column) {
        return row * this.cellsColumnsCount + column;
    }

    getCellXPosition(row, column) {
        var overridenSize = this.targetCellSize * 1.3;
        var offset = (-overridenSize * this.cellsColumnsCount / Math.sqrt(2)) / 2.0;
        return column * (overridenSize / 2.0) + overridenSize / 2.0 * row + offset;
    }

    getCellYPosition(row, column) {
        var overridenSize = this.targetCellSize * 1.3;
        return row * (overridenSize / 2.0)  - column * overridenSize / 2.0;
    }
}
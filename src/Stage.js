//@ts-check

class Stage {

    setupPayingField(width, height) {
        this.cells = new Array(width * height);
        this.targetFieldSize = game.camera.targetScreenSize * .6;
        this.targetHalfFieldSize = this.targetFieldSize / 2.0;
        this.cellsColumnsCount = width;
        this.cellsRowsCount = height;

        if (height > width) {
            this.targetCellSize = this.targetFieldSize / height;
        } else {
            this.targetCellSize = this.targetFieldSize / width;
        }
        
        for (var row = 0; row < height; ++row) {
            for (var column = 0; column < width; ++column) {
                var land1 = PIXI.Sprite.fromImage('land1')
                land1.anchor.set(0.5);
                app.stage.addChild(land1);

                var cell = this.cells[row * width + column];
                cell = new Cell(column, row, land1);
                cell.setPosition(this.getCellXPosition(column), this.getCellYPosition(row));
                cell.setSize(this.targetCellSize);
            }
        }
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
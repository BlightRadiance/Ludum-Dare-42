//@ts-check
var CellState = Object.freeze({
    "Ok": 1, 
    "Falling": 2, 
    "Gone": 3, 
})

class Cell {
    constructor(row, column, sprite, /** @type {LayerGroup} */ layerGroup) {
        this.row = row;
        this.column = column;
        this.layers = new Array(4);
        this.layers[0] = sprite;
        this.layerGroup = layerGroup;
        this.currentX = 0.0;
        this.currentY = 0.0;
        this.targetSize = 1024;
        
        this.fallV = 0.0;
        this.fallA = 3000.0;
        this.fallingTime = 0.0;
        this.fallingTimeMax = 1.0;

        this.state = CellState.Ok;

        this.wobbleFactor = (1 + Math.random()) / 1.5;
        this.wobbleHeightFactor = 10;
        this.offsetY = 0.0;        

        sprite.interactive = true;
        sprite.parentGroup = this.layerGroup.layerStage;

        var self = this;
        sprite.on('pointerdown', () => {
                state.onCellDown(self);
            })
            .on('pointerup', () => {
                state.onCellUp(self);
            })
            .on('pointerover', () => {
                state.onCellOver(self);
            })
            .on('pointerout', () => {
                state.onCellOut(self);
            });
    }

    update(dt) {
        switch (this.state) {
            case CellState.Ok:
                this.offsetY = Math.sin(time / this.wobbleFactor) * this.wobbleHeightFactor;
                this.updatePosition();
            break;
            case CellState.Falling:
                this.fallV += this.fallA * dt;
                this.offsetY += this.fallV * dt;
                this.updatePosition();
                this.fallingTime += dt;
                if (this.fallingTime > this.fallingTimeMax) {
                    this.state = CellState.Gone;
                    state.onCellDropped(this);
                }
            break;
            case CellState.Gone:
                this.layers[0].visible = false;
            break;
        }
    }

    setSize(size) {
        this.targetSize = size;
        this.wobbleHeightFactor = this.targetSize / 40.0;
        for (var i = 0; i < this.layers.length; ++i) {
            var element = this.layers[i];
            if (element) {
                element.scale.x = this.targetSize / element.texture.width;
                element.scale.y = this.targetSize / element.texture.height;
            }
        }
    }

    setPosition(x, y) {
        this.currentX = x;
        this.currentY = y;
    }

    getX() {
        return this.currentX;
    }

    getY() {
        return this.currentY + this.offsetY;
    }

    updatePosition() {
        for (var i = 0; i < this.layers.length; ++i) {
            var element;
            if (i == 2 && this.layers[i]) {
                element = this.layers[i].graphics;
            } else {
                element = this.layers[i];
            }
            if (element) {
                element.x = this.getX();
                element.y = this.getY();;
            }
        }
    }

    show(object, layer) {
        var graphics;
        if (layer == 2) {
            graphics = object.graphics;
        } else {
            graphics = object;
        }

        graphics.x = this.getX();
        graphics.y = this.getY();
        var aspectRatio = graphics.texture.height / graphics.texture.width;
        graphics.scale.x = this.targetSize / graphics.texture.width;
        graphics.scale.y = this.targetSize * aspectRatio / graphics.texture.height;
        switch (layer) {
            case 1:
            graphics.parentGroup = this.layerGroup.layerHelp;
            break;
            case 2:
            graphics.parentGroup = this.layerGroup.layerPlayer;
            break;
            case 3:
            graphics.parentGroup = this.layerGroup.layerOverlay;
            break;
        }
        this.layers[layer] = object;
    }

    unmanage(layer) {
        this.layers[layer] = undefined;
    }
}
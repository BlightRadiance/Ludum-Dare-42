//@ts-check
class Cell {
    constructor(row, column, sprite) {
        this.row = row;
        this.column = column;
        this.layers = new Array(3);
        this.layers[0] = sprite;
        this.currentX = 0.0;
        this.currentY = 0.0;
        this.targetSize = 124;
        sprite.interactive = true;
        sprite.parentGroup = game.layerStage;

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

    setSize(size) {
        this.targetSize = size;
        for (var i = 0; i < this.layers.length; ++i) {
            var element = this.layers[i];
            if (element) {
                element.scale.x = size / element.width;
                element.scale.y = size / element.height;
            }
        }
    }

    setPosition(x, y) {
        this.currentX = x;
        this.currentY = y;
        for (var i = 0; i < this.layers.length; ++i) {
            var element = this.layers[i];
            if (element) {
                element.x = x;
                element.y = y;
            }
        }
    }

    showHelp(sprite) {
        sprite.x = this.currentX;
        sprite.y = this.currentY;
        sprite.parentGroup = game.layerHelp;
    }

    showPlayer(player) {
        player.x = this.currentX;
        player.y = this.currentY;
        player.parentGroup = game.layerPlayer;
    }
}
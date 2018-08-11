//@ts-check
class Camera {

    constructor() {
        this.targetScreenSize = 1024;
        this.targetAspectRatio = 1920.0 / 1080.0;
        this.aspectRatio = 1;

        this.drawBorder = true;
        this.border = undefined;

        this.x = 0;
        this.y = 0;
        this.screenCenterAdjustmentX = 0;
        this.screenCenterAdjustmentY = 0;
    }

    getRealWidth() {
        return app.screen.width / app.stage.scale.x;
    }

    getRealHeight() {
        return app.screen.height / app.stage.scale.x;
    }

    move(xOffset, yOffset) {
        this.setPosition(this.x + xOffset, this.y + yOffset);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        app.stage.position.x = this.screenCenterAdjustmentX - this.x * app.stage.scale.x;
        app.stage.position.y = this.screenCenterAdjustmentY - this.y * app.stage.scale.x;
    }

    resize() {
        var scaleFactor;
        if (app.screen.width > app.screen.height) {
            this.aspectRatio = app.screen.width / app.screen.height;
        } else {
            this.aspectRatio = app.screen.height / app.screen.width;
        }
        if (app.screen.width > app.screen.height) {
            scaleFactor = app.screen.height / this.targetScreenSize;
        } else {
            scaleFactor = app.screen.width / this.targetScreenSize;
        }
        app.stage.scale.x = scaleFactor;
        app.stage.scale.y = scaleFactor;

        this.screenCenterAdjustmentX = app.screen.width / 2.0;
        this.screenCenterAdjustmentY = app.screen.height / 2.0;
        this.setPosition(this.x, this.y);

        if (this.drawBorder) {
            this.doDrawBorder();
        }
    }

    doDrawBorder() {
        if (this.border) {
            app.stage.removeChild(this.border);
        }
        this.border = new PIXI.Graphics();

        var lineWidth = 1.0;
        var halfLineWidth = lineWidth / 2.0;
        var halfTarget = this.targetScreenSize / 2.0;
        var width = this.getRealWidth();
        var height = this.getRealHeight();
        this.border.parentGroup = state.layerUi;
        this.border.lineStyle(lineWidth, 0x000000, 1);

        this.border.beginFill(0x000000);
        this.border.moveTo(-width - halfLineWidth, -halfTarget);
        this.border.lineTo(-width - halfLineWidth, -height);
        this.border.lineTo(width + halfLineWidth, -height);
        this.border.lineTo(width + halfLineWidth, -halfTarget);
        this.border.endFill();

        this.border.beginFill(0x000000);
        this.border.moveTo(-width - halfLineWidth, halfTarget);
        this.border.lineTo(-width - halfLineWidth, height);
        this.border.lineTo(width + halfLineWidth, height);
        this.border.lineTo(width + halfLineWidth, halfTarget);
        this.border.endFill();

        app.stage.addChild(this.border);
    }
}

class DragonBonesBase extends PIXI.Container {
    constructor() {
        super();
        this.resources = [];
    }
    renderHandler(deltaTime) {
        app.renderer.render(this);
    };
    startRenderTick() {
        PIXI.ticker.shared.add(this.renderHandler, this);
    };
    loadResources() {
        var binaryOptions = {
            loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR,
            xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER
        };
        for (var _i = 0; _i < this.resources.length; _i++) {
            var resource = this.resources[_i];
            if (PIXI.loader.resources[resource] === undefined) {
                if (resource.indexOf("dbbin") > 0) {
                    PIXI.loader.add(resource, binaryOptions);
                }
                else {
                    PIXI.loader.add(resource);
                }
            }
        }
    };
};

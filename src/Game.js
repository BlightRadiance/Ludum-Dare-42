//@ts-check
class Game extends DragonBonesBase {
    constructor() {
        super();
        this.pixiResources = undefined;
        this.camera = new Camera();        
        this.pushDragonBonesResources();
    }

    pushDragonBonesResources() {
        /*this.resources.push(
            "resource/dragon/1.json", "resource/dragon/2.json", "resource/dragon/3.png");*/
    }

    init() {
        this.initLayers();

        this.camera.init();
        this.loadResources();
        this.preloadOtherResources();

        this.ceterText = new PIXI.Text('Loading');
        this.ceterText.x = 0;
        this.ceterText.y = 0;
        this.ceterText.parentGroup = this.layerUi;
        this.ceterText.anchor.set(0.5);
        app.stage.addChild(this.ceterText);

        var self = this;
        PIXI.loader.on("progress", function (loader, resource) {
            self.ceterText.text = "Loading:" + loader.progress + "%";
        });
        PIXI.loader.once("complete", function (loader, resources) {
            app.stage.removeChild(self.ceterText);
            self.pixiResources = resources;
            self.onLoaded();
            self.startRenderTick(); // Make sure render after dragonBones update.
        });
        PIXI.loader.load();
    }

    initLayers() {
        app.stage = new PIXI.display.Stage();
        app.stage.group.enableSort = true;

        this.layerUi = new PIXI.display.Group(10, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerUi));

        this.layerBackground = new PIXI.display.Group(-1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerBackground));

        this.layerStage = new PIXI.display.Group(0, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerStage));

        this.layerPlayer = new PIXI.display.Group(2, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerPlayer));

        this.layerHelp = new PIXI.display.Group(1, false);
        app.stage.addChild(new PIXI.display.Layer(this.layerHelp));
    }

    preloadOtherResources() {
        PIXI.loader.add('land1', "resource/land.png");
        PIXI.loader.add('player', "resource/player.png");
        PIXI.loader.add('overlay_base', "resource/overlay_base.png");
    }

    resize() {
        this.camera.resize();
    }

    collides(/** @type {PIXI.Rectangle} */ a, /** @type {PIXI.Rectangle} */ b) {
        return !(a.x + a.width < b.x ||
            a.y + a.height < b.y ||
            a.x > b.x + b.width ||
            a.y > b.y + b.height)
    }

    onLoaded() {
        state.init();

        PIXI.ticker.shared.add((dt) => {
            time += dt;
            this.update(dt);
        });
    };

    update(dt) {
        state.update(dt);
    }

    onSoundToggled() {
        PIXI.sound.toggleMuteAll();
    }
}

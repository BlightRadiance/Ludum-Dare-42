//@ts-check
class Game extends DragonBonesBase {
    constructor() {
        super();
        this.pixiResources = undefined;
        this.pushDragonBonesResources();
    }

    pushDragonBonesResources() {
        /*this.resources.push(
            "resource/dragon/1.json", "resource/dragon/2.json", "resource/dragon/3.png");*/
    }

    init() {
        this.loadResources();
        this.preloadOtherResources();

        this.ceterText = new PIXI.Text('Loading');
        this.ceterText.x = 0;
        this.ceterText.y = 0;
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

    preloadOtherResources() {
        PIXI.loader.add('land1', "resource/land.png");
        PIXI.loader.add('player', "resource/player.png");
        PIXI.loader.add('overlay_base', "resource/overlay_base.png");
        PIXI.loader.add('overlay_attack', "resource/overlay_attack.png");
    }

    resize() {
        state.camera.resize();
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
            var realDt = PIXI.ticker.shared.elapsedMS / 1000.0;
            time += realDt;
            this.update(realDt);
        });
    };

    update(dt) {
        state.update(dt);
    }

    onSoundToggled() {
        PIXI.sound.toggleMuteAll();
    }
}

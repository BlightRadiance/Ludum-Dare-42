//@ts-check
class Game extends DragonBonesBase {
    constructor() {
        super();
        this.pixiResources = undefined;
        this.pushDragonBonesResources();
    }

    pushDragonBonesResources() {
        this.resources.push(
            "resource/player/ld_player_ske.json", "resource/player/ld_player_tex.json", "resource/player/ld_player_tex.png");
        this.resources.push(
            "resource/rush/ld_rush_ske.json", "resource/rush/ld_rush_tex.json", "resource/rush/ld_rush_tex.png");
        this.resources.push(
            "resource/range/ld_range_ske.json", "resource/range/ld_range_tex.json", "resource/range/ld_range_tex.png");
    }

    init() {
        this.loadResources();
        this.preloadOtherResources();

        this.ceterText = new PIXI.Text('Loading');
        this.ceterText.x = window.innerWidth / 2.0;
        this.ceterText.y = window.innerHeight / 2.0;
        this.ceterText.anchor.set(0.5);
        app.stage.addChild(this.ceterText);

        var self = this;
        PIXI.loader.on("progress", function (loader, resource) {
            self.ceterText.text = "Loading: " + Math.round(loader.progress) + "%";
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
        PIXI.loader.add('overlay_d', "resource/overlay_d.png");
        PIXI.loader.add('overlay_l', "resource/overlay_l.png");
        PIXI.loader.add('overlay_r', "resource/overlay_r.png");
        PIXI.loader.add('overlay_u', "resource/overlay_u.png");
        PIXI.loader.add('button_cancel', "resource/button_cancel.png");
        PIXI.loader.add('button_fire', "resource/button_fire.png");
        PIXI.loader.add('button_help', "resource/button_help.png");
        PIXI.loader.add('button_jump', "resource/button_jump.png");
        PIXI.loader.add('button_next', "resource/button_next.png");
        PIXI.loader.add('button_restart', "resource/button_restart.png");
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
        var factory = dragonBones.PixiFactory.factory;
        factory.parseDragonBonesData(game.pixiResources["resource/player/ld_player_ske.json"].data);
        factory.parseTextureAtlasData(game.pixiResources["resource/player/ld_player_tex.json"].data, game.pixiResources["resource/player/ld_player_tex.png"].texture);
        factory.parseDragonBonesData(game.pixiResources["resource/rush/ld_rush_ske.json"].data);
        factory.parseTextureAtlasData(game.pixiResources["resource/rush/ld_rush_tex.json"].data, game.pixiResources["resource/rush/ld_rush_tex.png"].texture);
        factory.parseDragonBonesData(game.pixiResources["resource/range/ld_range_ske.json"].data);
        factory.parseTextureAtlasData(game.pixiResources["resource/range/ld_range_tex.json"].data, game.pixiResources["resource/range/ld_range_tex.png"].texture);

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

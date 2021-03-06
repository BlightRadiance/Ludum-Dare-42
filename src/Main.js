/// <reference path="../libs/dragonBones/dragonBones.d.ts" />

let app = new PIXI.Application(1920, 1080, { antialias: true, backgroundColor: "0xFFFFFF" })
var time = 0;
var state = new State();
var game = new Game();
var pathFinder = new PF.AStarFinder({
    allowDiagonal: true
});

window.onload = function () {
    document.body.appendChild(app.renderer.view);

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    game.init();
}

window.onresize = onResizeWindow;

function onResizeWindow() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    game.resize();
}

function getRandDir() {
    return Math.floor(Math.random() * 3) + -1;
}

function getRandBetween(end) {
    return Math.floor(Math.random() * (end + 1));
}
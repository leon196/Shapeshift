var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();
var background = new PIXI.Graphics();
background.beginFill(0x000000, 1);
background.drawRect(0, 0, window.innerWidth, window.innerHeight);
stage.addChild(background);

function CustomFilter(fragmentSource)
{
    PIXI.Filter.call(this, null, fragmentSource);
}

CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
CustomFilter.prototype.constructor = CustomFilter;

PIXI.loader.add('shader','shader.frag');
PIXI.loader.once('complete', onLoaded);
PIXI.loader.load();

var filter;

function onLoaded (loader,res) 
{
    var fragmentSrc = res.shader.data;
    filter = new CustomFilter(fragmentSrc);
    console.log(filter.uniforms);
    filter.uniforms.uResolution = { x: window.innerWidth, y: window.innerHeight };
    background.filters = [filter];
    animate();
}

function animate () 
{
    filter.uniforms.customUniform += 0.04;
    renderer.render(stage);
    requestAnimationFrame( animate );
}
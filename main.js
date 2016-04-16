
var width, height;
var renderer, stage, background, filter;
var mouseData;
var mouseDragOrigin;
var isDragging = false;

function CustomFilter(fragmentSource) { PIXI.Filter.call(this, null, fragmentSource); }
CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
CustomFilter.prototype.constructor = CustomFilter;

window.onload = function () 
{
	width = window.innerWidth;
	height = window.innerHeight;
	renderer = PIXI.autoDetectRenderer(width, height, { resolution: 0.5 });
	document.body.appendChild(renderer.view);
	stage = new PIXI.Container();
	background = new PIXI.Graphics();
	background.beginFill(0x000000, 1);
	background.drawRect(0, 0, width, height);
	background.endFill();
	background.interactive = true;
	background.buttonMode = true;
	background.on('mousedown', onMouseDown).on('touchstart', onMouseDown);
	background.on('mouseup', onMouseUp).on('mouseupoutside', onMouseUp).on('touchend', onMouseUp).on('touchendoutside', onMouseUp);
	background.on('mousemove', onMouseMove).on('touchmove', onMouseMove);
	stage.addChild(background);

	PIXI.loader.add('shader','shader.frag');
	PIXI.loader.once('complete', onLoaded);
	PIXI.loader.load();
}

function onLoaded (loader,res) 
{
	var fragmentSrc = res.shader.data;
	filter = new CustomFilter(fragmentSrc);
	filter.uniforms.uResolution = { x: width, y: height };
	filter.uniforms.uMouse = { x: 0, y: 0 };
	background.filters = [filter];
	animate();
}

function onMouseDown (e)
{
	mouseData = e.data;
	mouseDragOrigin = mouseData.getLocalPosition(this.parent);
	isDragging = true;
}

function onMouseUp (e)
{
	mouseData = null;
	isDragging = false;
}

function onMouseMove (e)
{
	if (isDragging) {
		var mousePos = mouseData.getLocalPosition(this.parent);
    	filter.uniforms.uMouse.x += mousePos.x - mouseDragOrigin.x;
    	filter.uniforms.uMouse.y += mousePos.y - mouseDragOrigin.y;
    	mouseDragOrigin = mousePos;
    	// filter.uniforms.uMouse.x = mousePos.x;
    	// filter.uniforms.uMouse.y = mousePos.y;
    }
}

function animate () 
{
	renderer.render(stage);
	requestAnimationFrame( animate );
}
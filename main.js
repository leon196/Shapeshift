
var renderer, stage, background, filter, width, height;
var mouseData, mouseDragOrigin;
var isDragging = false;
var timeStart, timeElapsed;

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
	filter.uniforms.uTime = 0;
	filter.uniforms.uResolution = { x: width, y: height };
	filter.uniforms.uMouse = { x: 0, y: 0 };
	filter.uniforms.uPanorama1 = PIXI.Texture.fromImage("PANO_20160409_121110_0.jpg");
	filter.uniforms.uPanorama2 = PIXI.Texture.fromImage("PANO_20160409_125038_0.jpg");
	filter.uniforms.uPanorama3 = PIXI.Texture.fromImage("RoomSpace.png");
	background.filters = [filter];
	timeStart = new Date() / 1000.0;
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
	filter.uniforms.uTime = new Date() / 1000.0 - timeStart;
	renderer.render(stage);
	requestAnimationFrame( animate );
}
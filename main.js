
var renderer, stage, background, filter, width, height;
var mouseDragOrigin, mouseOffset;
var isDragging = false;
var timeStart, timeElapsed;

function CustomFilter(fragmentSource) { 
	PIXI.AbstractFilter.call(this, null, fragmentSource, {
		time : { type : '1f', value : 0 },
		resolution : { type : '1f', value : 0 },
		dimension : { type : '2f', value : new Float32Array([0, 0]) },
		mouseDrag : { type : '2f', value : new Float32Array([0, 0]) },
		mouse : { type : '2f', value : new Float32Array([0, 0]) },
		panorama : { type : 'sampler2D', value : 0}
	});
}

CustomFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
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
	filter.uniforms.dimension.value[0] = width;
	filter.uniforms.dimension.value[1] = height;
	filter.uniforms.resolution.value = renderer.resolution;
	filter.uniforms.mouse.value[0] = 0;
	filter.uniforms.mouse.value[1] = 0;
	filter.uniforms.mouseDrag.value[0] = 0;
	filter.uniforms.mouseDrag.value[1] = 0;
	filter.uniforms.panorama.value = PIXI.Texture.fromImage('PANO_20160409_121110_0.jpg');
	background.filters = [filter];
	mouseDragOrigin = { x: 0, y: 0 };
	mouseOffset = { x: 0, y: 0 };
	timeStart = new Date() / 1000.0;
	animate();
}

function onMouseDown (e)
{
	mouseDragOrigin = e.data.getLocalPosition(this.parent);
	isDragging = true;
}

function onMouseUp (e)
{
	isDragging = false;
}

function onMouseMove (e)
{
	var mousePos = e.data.getLocalPosition(this.parent);
	if (isDragging) {
  	filter.uniforms.mouseDrag.value[0] += mousePos.x - mouseDragOrigin.x;
  	filter.uniforms.mouseDrag.value[1] += mousePos.y - mouseDragOrigin.y;

  	// filter.uniforms.mouse.value[0] = Math.abs(filter.uniforms.mouse.value[0] + mousePos.x - mouseDragOrigin.x) % width;
  	// filter.uniforms.mouse.value[1] = Math.abs(filter.uniforms.mouse.value[1] + mousePos.y - mouseDragOrigin.y) % height;
  	mouseOffset.x += (mousePos.x - mouseDragOrigin.x) % width;
  	mouseOffset.y += (mousePos.y - mouseDragOrigin.y) % height;

  	mouseDragOrigin = mousePos;
  } else {
  	filter.uniforms.mouse.value[0] = Math.abs(mousePos.x - mouseOffset.x) % width;
  	filter.uniforms.mouse.value[1] = Math.abs(mousePos.y - mouseOffset.y) % height;
  }
}

function animate () 
{
	filter.uniforms.time.value = new Date() / 1000.0 - timeStart;
	renderer.render(stage);
	requestAnimationFrame( animate );
}
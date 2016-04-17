
var renderer, stage, background, filter, width, height;
var mousePos, mouseDragOrigin, mouseOffset;
var isDragging = false;
var timeStart, timeElapsed;
var text;
var textCenter;
var gameState = 0;
var STATE_INTRO = 0;
var STATE_PLAYING = 1;
var STATE_TRANSITION = 2;
var cooldownIntro = new Cooldown(5);
var cooldownTransition = new Cooldown(1);

window.onload = function () 
{
	width = window.innerWidth;
	height = window.innerHeight;
	renderer = PIXI.autoDetectRenderer(width, height, { resolution: 1 });
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

	text = new PIXI.Text('Find the initial shape by moving the mouse. Click to orbit camera.', {
    font : '16px Arial',
    fill : '#ffffff',
    stroke : '#000000',
    strokeThickness : 5,
    wordWrap : true,
    wordWrapWidth : width
	});

	text.anchor.y = 1.0;
	text.x = 0;
	text.y = height;
	stage.addChild(text);

	textCenter = new PIXI.Text('Memorize this shape',{
    font : '26px Arial',
    fill : '#ffffff',
    stroke : '#000000',
    strokeThickness : 5
	});
	textCenter.anchor.x = 0.5;
	textCenter.anchor.y = 0.5;
	textCenter.x = width / 2;
	textCenter.y = height / 2;
	stage.addChild(textCenter);

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
	filter.uniforms.panorama.value = PIXI.Texture.fromImage('panorama.jpg');
	background.filters = [filter];
	mousePos = { x: 0, y: 0 };
	mouseDragOrigin = { x: 0, y: 0 };
	mouseOffset = { x: 0, y: 0 };
	timeStart = new Date() / 1000.0;
	timeElapsed = 0;

	gameState = STATE_INTRO;
	cooldownIntro.Start();
	cooldownTransition.Start();
	mouseOffset.x = Math.round(Math.random() * width);
	mouseOffset.y = Math.round(Math.random() * height);

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
	mousePos = e.data.getLocalPosition(this.parent);
	if (isDragging) {
  	filter.uniforms.mouseDrag.value[0] += mousePos.x - mouseDragOrigin.x;
  	filter.uniforms.mouseDrag.value[1] += mousePos.y - mouseDragOrigin.y;
  	if (gameState == STATE_PLAYING) {
	  	mouseOffset.x += (mousePos.x - mouseDragOrigin.x) % width;
	  	mouseOffset.y += (mousePos.y - mouseDragOrigin.y) % height;
	  }
  	mouseDragOrigin = mousePos;
  } else {
  	if (gameState == STATE_PLAYING) {
	  	filter.uniforms.mouse.value[0] = Math.abs(mousePos.x - mouseOffset.x) % width;
	  	filter.uniforms.mouse.value[1] = Math.abs(mousePos.y - mouseOffset.y) % height;
	  }
  }
}

function mix (a, b, t)
{
	return a * (1.0 - t) + b * t;
}

function animate () 
{
 	timeElapsed = new Date() / 1000.0 - timeStart;
 	filter.uniforms.time.value = timeElapsed;

	switch (gameState) 
	{
		case STATE_INTRO: {
			cooldownIntro.Update();

			if (cooldownIntro.IsOver()) {
				gameState = STATE_TRANSITION;
				cooldownTransition.Start();
			}
			break;
		}
		case STATE_TRANSITION: {
			cooldownTransition.Update();

	  	filter.uniforms.mouse.value[0] = mix(0, Math.abs(mousePos.x - mouseOffset.x) % width, cooldownTransition.ratio);
	  	filter.uniforms.mouse.value[1] = mix(0, Math.abs(mousePos.y - mouseOffset.y) % height, cooldownTransition.ratio);

	  	textCenter.alpha = 1.0 - cooldownTransition.ratio;

			if (cooldownTransition.IsOver()) {
				gameState = STATE_PLAYING;
			}
			break;
		}
	}

	renderer.render(stage);
	requestAnimationFrame( animate );
}
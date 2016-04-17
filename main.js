
var renderer, stage, background, filter, width, height;
var mousePos, mouseDragOrigin, mouseOffset;
var timeStart, timeElapsed, text, textCenter;
var isDragging = false;
var gameState = 0;
var STATE_INTRO = 0;
var STATE_PLAYING = 1;
var STATE_TRANSITION = 2;
var STATE_WINNING = 3;
var STATE_FINISH = 4;
var cooldownIntro = new Cooldown(5);
var cooldownTransition = new Cooldown(1);
var cooldownWin = new Cooldown(3);
var winTreshold = 10;
var filters = [];
var filter, gridFilter;
var currentFilter = 0;
var totalFilter = 3;

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

	text = new PIXI.Text('Find the initial shape by moving the mouse. Click to orbit camera.\nMade by Leon Denise with Pixi.js for Ludum Dare #35 \'Shapeshifting\'\nEffects are made with raymarching shaders', {
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

	textCenter = new PIXI.Text('Memorize this shape\nand move your mouse to the right pixel.',{
    font : '26px Arial',
    fill : '#ffffff',
    stroke : '#000000',
    align: 'center',
    strokeThickness : 5
	});
	textCenter.anchor.x = 0.5;
	textCenter.anchor.y = 0.5;
	textCenter.x = width / 2;
	textCenter.y = height / 2;
	stage.addChild(textCenter);

	for (var i = 1; i <= totalFilter; ++i) {
		PIXI.loader.add('shader' + i,'shader' + i + '.frag');
	}
	PIXI.loader.add('grid', 'grid.shader');
	PIXI.loader.once('complete', onLoaded);
	PIXI.loader.load();
}

function setupFilter (filter)
{
	filter.uniforms.dimension.value[0] = width;
	filter.uniforms.dimension.value[1] = height;
	filter.uniforms.resolution.value = renderer.resolution;
	filter.uniforms.mouse.value[0] = 0;
	filter.uniforms.mouse.value[1] = 0;
	filter.uniforms.mouseDrag.value[0] = width / 4;
	filter.uniforms.mouseDrag.value[1] = height / 8;
}

function onLoaded (loader,res) 
{
	filters = [];
	for (var i = 1; i <= totalFilter; ++i) {
		filters.push(new CustomFilter(res['shader' + i].data));
	}
	for (var i = 0; i < filters.length; ++i) {
		setupFilter(filters[i]);
		filters[i].uniforms.panorama.value = PIXI.Texture.fromImage('panorama' + (i+1) + '.jpg');
	}

	gridFilter = new CustomFilter(res.grid.data);
	setupFilter(gridFilter);

	filter = filters[currentFilter];

	background.filters = [gridFilter, filter];
	mousePos = { x: 0, y: 0 };
	mouseDragOrigin = { x: 0, y: 0 };
	mouseOffset = { x: 0, y: 0 };
	timeStart = new Date() / 1000.0;
	timeElapsed = 0;

	gameState = STATE_INTRO;
	cooldownIntro.Start();
	cooldownTransition.Start();

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
		gridFilter.uniforms.mouseDrag.value[0] = filter.uniforms.mouseDrag.value[0];
		gridFilter.uniforms.mouseDrag.value[1] = filter.uniforms.mouseDrag.value[1];
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

function mix (a, b, t) {	return a * (1.0 - t) + b * t; }
function clamp (x, min, max) { return Math.max(Math.min(x, max), min); }

function animate () 
{
 	timeElapsed = new Date() / 1000.0 - timeStart;

 	filter.uniforms.time.value = timeElapsed;

	switch (gameState) 
	{
		case STATE_INTRO: {
			cooldownIntro.Update();

	  	textCenter.alpha = clamp(cooldownIntro.ratio * 2, 0, 1);

			if (cooldownIntro.IsOver()) {
				gameState = STATE_TRANSITION;
				cooldownTransition.Start();
				mouseOffset.x = Math.round(Math.random() * width);
				mouseOffset.y = Math.round(Math.random() * height);
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
		case STATE_PLAYING: {

			if (filter.uniforms.mouse.value[0] < winTreshold && filter.uniforms.mouse.value[1] < winTreshold) {
				gameState = STATE_WINNING;
				cooldownWin.Start();
				textCenter.text = "You found the right pixel :)";
			}

			break;
		}
		case STATE_WINNING: {
			cooldownWin.Update();

	  	filter.uniforms.mouse.value[0] = mix(filter.uniforms.mouse.value[0], 0, clamp(cooldownWin.ratio * 3, 0, 1));
	  	filter.uniforms.mouse.value[1] = mix(filter.uniforms.mouse.value[1], 0, clamp(cooldownWin.ratio * 3, 0, 1));

	  	textCenter.alpha = Math.sin(cooldownWin.ratio * Math.PI);

			if (cooldownWin.IsOver()) {

				currentFilter = currentFilter + 1;
				if (currentFilter < filters.length) {
					filter = filters[currentFilter];
					background.filters = [gridFilter, filter];
					gameState = STATE_INTRO;
					cooldownIntro.Start();
					textCenter.text = "Memorize this shape";
		  		textCenter.alpha = 0.0;
		  	} else {
					gameState = STATE_FINISH;
		  		cooldownTransition.Start();
					textCenter.text = 'You have finished the game.\nI\'ve started the Ludum Dare super late, so there is only ' + filters.length + ' levels :3\nThanks for playing :D';
		  		textCenter.alpha = 0.0;
		  	}
			}
			break;
		}
		case STATE_FINISH: {

			cooldownTransition.Update();

	  	textCenter.alpha = clamp(cooldownTransition.ratio * 2, 0, 1);

			if (cooldownTransition.IsOver()) {

			}

			break;
		}
	}

	renderer.render(stage);
	requestAnimationFrame( animate );
}
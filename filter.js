
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
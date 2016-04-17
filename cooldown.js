
var Cooldown = function (duration)
{
	this.delay = duration || 1.0;
	this.start = timeElapsed;
	this.ratio = 0;

	this.Start = function ()
	{
		this.ratio = 0;
		this.start = timeElapsed;
	}

	this.Update = function ()
	{
		this.ratio = Math.max(Math.min((timeElapsed - this.start) / this.delay, 1.0), 0.0);
	}

	this.IsOver = function ()
	{
		return this.ratio >= 1.0;
	}
}
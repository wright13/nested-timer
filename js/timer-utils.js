(function (global) {
	// Timer utilities object that will be exposed to the global scope
	var timerUtil = {};

	// Timer object constructor
	function Timer(id, name, time, description, autoStart, repeat, subTimers) {
		this.timerId = id;	// Unique ID for this timer object
		this.name = name;		// Friendly name/label for the timer
		this.timeStart = time;	// Time that the timer is originally set to (integer seconds)
		this.description = description;	//Description of what the timer is for (string)
		this.timeCurrent = time;	// Keeps track of where the timer ended (integer seconds)
		this.autoStart = autoStart;	// Whether the timer should auto-start at end of previous timer (boolean)
		this.nRepeat = repeat;	// Number of times the timer should repeat (integer)
		this.subTimers = subTimers;	// List of sub-timers (Timer list)
	};

	// Getters for current time in h, m, and s
	var t = Timer.prototype;
	Object.defineProperty(t, "h", {
		get: function() {
			var hours = Math.floor(this.timeCurrent / 3600);
			return(hours);	
		}
	});

	Object.defineProperty(t, "m", {
		get: function() {
			var minutes = Math.floor((this.timeCurrent % 3600)/60);
			return(minutes);
		}
	});

	Object.defineProperty(t, "s", {
		get: function() {
			var seconds = this.timeCurrent % 60;
			return(seconds);
		}
	});

	// Start the timer
	Timer.prototype.start = function() {
		var self = this;
		
		this.intervalID = window.setInterval(function() {
									// Decrement the timer's end time every second but don't let it go negative
									if (self.timeCurrent >= 1) {
										self.timeCurrent--;
									} else {
										self.pause();
									}
									// Update timer display
									updateHMS(self.h, self.m, self.s);
								}, 1000);
	}

	// Pause the timer but don't reset the end time
	Timer.prototype.pause = function() {
		window.clearInterval(this.intervalID);
	}

	// Stop the timer and reset the end time
	Timer.prototype.reset = function() {
		window.clearInterval(this.intervalID);
		this.timeCurrent = this.timeStart;
	}

	// Update timer display
	// TODO: implement this with a unique timer ID
	function updateHMS(h, m, s){
		var hTarget = document.querySelector(".clock .h");
		var mTarget = document.querySelector(".clock .m");
		var sTarget = document.querySelector(".clock .s");

		hTarget.innerHTML = padTime(h);
		mTarget.innerHTML = padTime(m);
		sTarget.innerHTML = padTime(s);
	}

	// Pads single digit hour, minute, or second values with a leading zero
	function padTime(time) {
		var textTime = time + "";
		if (textTime.length < 2) {
			textTime = "0" + textTime;
		}
		return textTime;
	}

	timerUtil.Timer = Timer;
	timerUtil.padTime = padTime;

	// Expose timerUtil to the global scope
	global.timerUtil = timerUtil;
})(window);


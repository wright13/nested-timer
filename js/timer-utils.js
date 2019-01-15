(function (global) {
	// Timer utilities object that will be exposed to the global scope
	var timerUtil = {};

	// Controller constructor
	function Controller() {
		this.timers = [];
	}
	Controller.prototype.addTimer = function(timer) {
		var self = this;
		this.timers.push(timer);
		timer.addListener({
			onStart: function() {
				// Start child timers if they are set to auto-start
				self.startSubTimer(timer);
			},
			onComplete: function() {
				self.startNext(timer);
			},
			onPause: function() {
				// Pause child timers
			},
			onReset: function() {
				// Reset child timers
			},
			onTick: function() {

			}
		});
	};
	Controller.prototype.getFirst = function() {
		return this.timers[0];
	}
	Controller.prototype.startNext = function(timer) {
		// Start next timer if it is set to auto-start
		var next = false;
		for (let i = 0; i < this.timers.length; i++) {
			if (next === true) {
				if (this.timers[i].autoStart === true) {
					this.timers[i].start();
				}
				return;
			}
			if (this.timers[i] === timer) {
				next = true;
			}
		}
	};
	Controller.prototype.startSubTimer = function(timer) {
		if (timer.subTimers.getFirst().autoStart) {
			timer.subTimers.getFirst().start();
		}
	}

	// Given a list of listeners and a type, execute all callbacks of that type
	function executeCallbacks(listeners, type) {
		for (let i = 0; i < listeners.length; i++) {
			try {
				listeners[i][type]();
			}
			catch(err) {
				console.log(err);
			}
		}
	}

	// Timer object constructor
	function Timer(id, name, time, description, autoStart, repeat) {
		this.timerId = id;	// Unique ID for this timer object
		this.name = name;		// Friendly name/label for the timer
		this.timeStart = time;	// Time that the timer is originally set to (integer seconds)
		this.description = description;	//Description of what the timer is for (string)
		this.timeCurrent = time;	// Keeps track of where the timer ended (integer seconds)
		this.autoStart = autoStart;	// Whether the timer should auto-start at end of previous timer (boolean)
		this.nRepeat = repeat;	// Number of times the timer should repeat (integer)
		this.subTimers = new Controller();	// Controller for subTimers
		this.running = false;	// Keep track of whether timer is currently running
		this.listeners = [];
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
		if (!this.running) {	// Don't start another interval if the timer is already running
			executeCallbacks(this.listeners, "onStart");
			this.intervalID = window.setInterval(function() {
										self.running = true;
										// Decrement the timer's end time every second but don't let it go negative
										if (self.timeCurrent >= 1) {
											executeCallbacks(self.listeners, "onTick");
											self.timeCurrent--;
										} else {
											self.pause();
											executeCallbacks(self.listeners, "onComplete");
										}
										// Update timer display
										updateHMS(self.timerId, self.h, self.m, self.s);
									}, 1000);
		}
	}

	// Pause the timer but don't reset the end time
	Timer.prototype.pause = function() {
		window.clearInterval(this.intervalID);
		this.running = false;
		executeCallbacks(this.listeners, "onPause");
	};

	// Stop the timer and reset the end time
	Timer.prototype.reset = function() {
		window.clearInterval(this.intervalID);
		this.running = false;
		this.timeCurrent = this.timeStart;
		executeCallbacks(this.listeners, "onReset");
		// Update timer display
		updateHMS(this.timerId, this.h, this.m, this.s);
	};

	// Add a listener
	Timer.prototype.addListener = function(listener) {
		this.listeners.push(listener);
	};

	// Add subtimers
	Timer.prototype.addSubTimer = function(timer) {
		this.subTimers.addTimer(timer);
	}

	// Update timer display
	function updateHMS(timerId, h, m, s){
		var hTarget = document.querySelector("#timer-" + timerId + " .clock .h");
		var mTarget = document.querySelector("#timer-" + timerId + " .clock .m");
		var sTarget = document.querySelector("#timer-" + timerId + " .clock .s");

		hTarget.innerHTML = padTime(h);
		mTarget.innerHTML = padTime(m);
		sTarget.innerHTML = padTime(s);
	};

	// Pads single digit hour, minute, or second values with a leading zero
	function padTime(time) {
		var textTime = time + "";
		if (textTime.length < 2) {
			textTime = "0" + textTime;
		}
		return textTime;
	};

	timerUtil.Timer = Timer;
	timerUtil.padTime = padTime;
	timerUtil.Controller = Controller;

	// Expose timerUtil to the global scope
	global.timerUtil = timerUtil;
})(window);


(function (global) {
	// Timer utilities object that will be exposed to the global scope
	var timerUtil = {};

	// Timer object constructor
	function Timer(name, time, description, autoStart, repeat, subTimers) {
		this.name = name;		// Friendly name/label for the timer
		this.timeTotal = time;	// Time that the timer is originally set to (integer seconds)
		this.description = description;	//Description of what the timer is for (string)
		this.timeLast = time;	// Keeps track of where the timer ended (integer seconds)
		this.autoStart = autoStart;	// Whether the timer should auto-start at end of previous timer (boolean)
		this.repeat = repeat;	// Number of times the timer should repeat (integer)
		this.subTimers = subTimers;	// List of sub-timers (Timer list)
		this.intervalID = null;

		// Start the timer
		this.start = function() {
			var self = this;
			this.intervalID = window.setInterval(function() {
										// Decrement the timer's end time every second but don't let it go negative
										if (self.timeLast >= 1) {
											self.timeLast--;
										} else {
											self.pause();
										}
										console.log(self.name + " " + self.timeLast);
									}, 1000);
		}

		// Pause the timer but don't reset the end time
		this.pause = function() {
			window.clearInterval(this.intervalID);
		}

		// Stop the timer and reset the end time
		this.reset = function() {
			window.clearInterval(this.intervalID);
			this.timeLast = this.timeTotal;
		}

	};

	timerUtil.Timer = Timer;

	// Expose timerUtil to the global scope
	global.timerUtil = timerUtil;
})(window);


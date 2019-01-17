var timers = new timerUtil.Controller();
var currentId = 0;

document.addEventListener("DOMContentLoaded", function (event) {
  // When new timer form is shown, add onclick event handler for create timer button
  $("#timer-new-form").on("shown.bs.dropdown", function(){
    var addMainTimerButton = document.getElementById("timer-main-add");
    addMainTimerButton.onclick = function(){
      addTimer("#timer", null);
    };
  });
});

// Snippet URLs
var timerURL = "html-snippets/timer-snippet.html";

// Takes an HTML snippet with named "properties" surrounded by double curly
// braces and replaces the specified property with a value
function insertIntoSnippet(snippet, property, value) {
  var propertyToReplace = "{{" + property + "}}";
  var newSnippet = snippet;
  newSnippet = newSnippet.replace(new RegExp(propertyToReplace, "g"), value);
  return newSnippet;
}

// Fill in the properties of a timer HTML snippet and insert it into the element
// identified by selector
function buildAndShowTimerHTML(timer, selector) {
  var hours = timerUtil.padTime(timer.h);
  var minutes = timerUtil.padTime(timer.m);
  var seconds = timerUtil.padTime(timer.s);
  var target = document.querySelector(selector);
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    // If the request has completed and is successful, fill in the retrieved HTML
    // snippet with values from the timer
    if ((request.readyState == 4) && (request.status == 200)) {
      var timerHTML = request.responseText;
      timerHTML = insertIntoSnippet(timerHTML, "timerId", timer.timerId);
      timerHTML = insertIntoSnippet(timerHTML, "h", hours);
      timerHTML = insertIntoSnippet(timerHTML, "m", minutes);
      timerHTML = insertIntoSnippet(timerHTML, "s", seconds);
      timerHTML = insertIntoSnippet(timerHTML, "timerName", timer.name);
      timerHTML = insertIntoSnippet(timerHTML, "timerDescription", timer.description);

      target.insertAdjacentHTML("beforeend", timerHTML);

      // Add onclick event handlers for Start/Pause/Reset/Add Child/Delete buttons
      var startButton = document.querySelector("#timer-" + timer.timerId + " .timer-start");
      startButton.onclick = function(){
        timer.start();
      };
      var pauseButton = document.querySelector("#timer-" + timer.timerId + " .timer-pause");
      pauseButton.onclick = function(){
        timer.pause();
      };
      var resetButton = document.querySelector("#timer-" + timer.timerId + " .timer-reset");
      resetButton.onclick = function(){
        timer.reset();
      };
      var addChildButton = document.querySelector("#timer-" + timer.timerId + " .timer-child-add");
      addChildButton.onclick = function(){
        addTimer("#timer-" + timer.timerId + " .timer-child", timer);
      };
      var deleteButton = document.querySelector("#timer-" + timer.timerId + " .timer-delete");
      deleteButton.onclick = function() {
        var timerToDelete = document.querySelector("#timer-" + timer.timerId);
        timerToDelete.parentNode.removeChild(timerToDelete);
        timers.deleteTimer(timer);
      };                          
    }
  };

  request.open("GET", timerURL, true);
  request.send(null); 
}

function addTimer(selector, parent) {
  var h = document.querySelector("#timer-main-set .timer-h").value || 0;
  var m = document.querySelector("#timer-main-set .timer-m").value || 0;
  var s = document.querySelector("#timer-main-set .timer-s").value || 0;
  var name = document.querySelector("#timer-main-name").value || "Timer";
  var description = document.querySelector("#timer-main-description").value || "";
  // TODO: set these through the create timer form
  var autoStart = true;
  var repeat = 1;
  var subTimers = {};

  // Clear form
  document.getElementById("timer-main-set").reset();

  // Create new timer object from values provided in the form
  var timer = new timerUtil.Timer(currentId,
                        name,
                        (3600 * h) + (60 * m) + (1*s),
                        description,
                        autoStart,
                        repeat,
                        subTimers);

  // UI listener
  uiListener = {
    onStart: function() {
      // Disable start button
    },
    onComplete: function() {

    },
    onPause: function() {
      // Enable start button

      // Disable pause button
    },
    onReset: function() {
      // Update timer display
      updateHMS(timer.timerId, timer.h, timer.m, timer.s);
      // Enable start button

      // Disable reset button

    },
    onTick: function() {
      // Update timer display
      updateHMS(timer.timerId, timer.h, timer.m, timer.s);
    }
  };

  timer.addListener(uiListener);

  // Add timer to timer list
  // TODO: make sure total times for child timers are less than the parent time
  if (parent) {
    parent.addSubTimer(timer);
  } else {
    timers.addTimer(timer);
  }
  currentId++;

  // Add timer to page
  buildAndShowTimerHTML(timer, selector);

}

// Update timer display
function updateHMS(timerId, h, m, s){
  var hTarget = document.querySelector("#timer-" + timerId + " .clock .h");
  var mTarget = document.querySelector("#timer-" + timerId + " .clock .m");
  var sTarget = document.querySelector("#timer-" + timerId + " .clock .s");

  hTarget.innerHTML = timerUtil.padTime(h);
  mTarget.innerHTML = timerUtil.padTime(m);
  sTarget.innerHTML = timerUtil.padTime(s);
};

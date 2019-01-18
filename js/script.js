var timers = new timerUtil.Controller();
var currentId = 0;

document.addEventListener("DOMContentLoaded", function (event) {
  // When new timer form is shown, add onclick event handler for create timer button
  $("#timer-new-modal").on("shown.bs.modal", function(){
    timerCreateHandler("#timer", null);
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
      timerHTML = insertIntoSnippet(timerHTML, "autoStart", timer.autoStart ? "On" : "Off");
      timerHTML = insertIntoSnippet(timerHTML, "repeat", (timer.nRepeat > 1) ? timer.nRepeat + " times" : "Off");

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
        $("#timer-new-modal").on("shown.bs.modal", function(){
          timerCreateHandler("#timer-" + timer.timerId + " .timer-child", timer);
        });
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
  var h = document.querySelector("#timer-h").value || 0;
  var m = document.querySelector("#timer-m").value || 0;
  var s = document.querySelector("#timer-s").value || 0;
  var name = document.querySelector("#timer-name").value || "Timer";
  var description = document.querySelector("#timer-description").value || "";
  // TODO: set these through the create timer form
  var autoStart = document.getElementById("timer-autostart-on").checked;
  var repeat = document.querySelector("#timer-repeat").value || 1;
  var subTimers = {};
  // Clear form
  document.getElementById("timer-new-form").reset();

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
      updateHMS(timer);
      // Enable start button

      // Disable reset button

    },
    onTick: function() {
      // Update timer display
      updateHMS(timer);
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
function updateHMS(timer){
  var hTarget = document.querySelector("#timer-" + timer.timerId + " .clock .h");
  var mTarget = document.querySelector("#timer-" + timer.timerId + " .clock .m");
  var sTarget = document.querySelector("#timer-" + timer.timerId + " .clock .s");
  var repeatTarget = document.querySelector("#timer-" + timer.timerId + " .repeat-indicator");

  hTarget.innerHTML = timerUtil.padTime(timer.h);
  mTarget.innerHTML = timerUtil.padTime(timer.m);
  sTarget.innerHTML = timerUtil.padTime(timer.s);
  if (timer.nRepeat > 1) {
    repeatTarget.innerHTML = timer.repeatsLeft + " times";
  }
  
};

function timerCreateHandler(timerParentElement, timer) {
  var createAndCloseButton = document.getElementById("timer-create-close");
  var createButton = document.getElementById("timer-create");

  createAndCloseButton.onclick = function(){
    addTimer(timerParentElement, timer);
  };
  createButton.onclick = function(){
    addTimer(timerParentElement, timer);
  };
}

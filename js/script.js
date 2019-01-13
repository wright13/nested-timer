var timers = {};
var currentId = 0;

document.addEventListener("DOMContentLoaded", function (event) {
  // On click event for create timer button
  var addMainTimerButton = document.getElementById("timer-main-add");
  addMainTimerButton.onclick = addMainTimer;
})


// Snippet URLs
var timerURL = "html-snippets/timer-snippet.html";

// Takes an HTML snippet with named "properties" surrounded by double curly
// braces and replaces the specified property with a value
function insertIntoSnippet(snippet, property, value) {
  var propertyToReplace = "{{" + property + "}}";
  var newSnippet = snippet;
  newSnippet = newSnippet.replace(new RegExp(propertyToReplace, "g"), value);
  return newSnippet;
};

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

      // Add onclick events for Start/Pause/Reset buttons
      var startButton = document.querySelector("#timer-" + timer.timerId + " .timer-start");
      startButton.onclick = function(){
                              timers[timer.timerId].start();
                            }
      var pauseButton = document.querySelector("#timer-" + timer.timerId + " .timer-pause");
      pauseButton.onclick = function(){
                              timers[timer.timerId].pause();
                            }
      var resetButton = document.querySelector("#timer-" + timer.timerId + " .timer-reset");
      resetButton.onclick = function(){
                              timers[timer.timerId].reset();
                            }
    }
  };

  request.open("GET", timerURL, true);
  request.send(null); 
}

function addMainTimer() {
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

  // Add timer to timer list
  timers[currentId] = timer;
  currentId++;

  // Add timer to page
  buildAndShowTimerHTML(timer, "#timer");

}
var timers = [];

document.addEventListener("DOMContentLoaded", function (event) {
  // On click event for create timer button
  var addMainTimerButton = document.getElementById("timer-main-add");
  addMainTimerButton.onclick = addMainTimer;

  // Testing
  var testTimer = new timerUtil.Timer("My timer",
                                        40,
                                        "A timer that I made");
  buildAndShowTimerHTML(testTimer, 3, "#timer");
  testTimer.start();
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
function buildAndShowTimerHTML(timer, timerID, selector) {
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
      timerHTML = insertIntoSnippet(timerHTML, "timerID", timerID);
      timerHTML = insertIntoSnippet(timerHTML, "h", hours);
      timerHTML = insertIntoSnippet(timerHTML, "m", minutes);
      timerHTML = insertIntoSnippet(timerHTML, "s", seconds);
      timerHTML = insertIntoSnippet(timerHTML, "timerName", timer.name);
      timerHTML = insertIntoSnippet(timerHTML, "timerDescription", timer.description);

      target.insertAdjacentHTML("beforeend", timerHTML);
    }
  };

  request.open("GET", timerURL, true);
  request.send(null); 
}

function addMainTimer() {
  var h = document.querySelector(".timer-main-set .timer-h").value || 0;
  var m = document.querySelector(".timer-main-set .timer-m").value || 0;
  var s = document.querySelector(".timer-main-set .timer-s").value || 0;
  var name = "placeholder";
  var description = "placeholder";
  var autoStart = true;
  var repeat = 1;
  var subTimers = {};

  // Create new timer object from values provided in the form
  var timer = new timerUtil.Timer(name,
                        (3600 * h) + (60 * m) + (1*s),
                        description,
                        autoStart,
                        repeat,
                        subTimers);

  // Add timer to timer array
  timers.push(timer);

  // Add timer to page
  buildAndShowTimerHTML(timer, timers.length, "#timer");

}
document.addEventListener("DOMContentLoaded", function (event) {
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

      target.innerHTML = timerHTML;
    }
  };

  request.open("GET", timerURL, true);
  request.send(null);
  
}
document.addEventListener("DOMContentLoaded", function (event) {
  // Testing
  var testTimer = new timerUtil.Timer("My timer",
                                        40,
                                        "A timer that I made");
  buildAndShowTimerHTML(testTimer, 3, "#timer");
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
  var hours = Math.floor(timer.timeStart / 3600);
  var minutes = Math.floor((timer.timeStart % 3600)/60);
  var seconds = timer.timeStart % 60;
  var target = document.querySelector(selector);
  var request = new XMLHttpRequest();

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  
  request.onreadystatechange = function() {
    var timerHTML = request.responseText;

    if ((request.readyState == 4) && (request.status == 200)) {
      timerHTML = insertIntoSnippet(timerHTML, "timerID", timerID);
      timerHTML = insertIntoSnippet(timerHTML, "h", hours);
      timerHTML = insertIntoSnippet(timerHTML, "m", minutes);
      timerHTML = insertIntoSnippet(timerHTML, "s", seconds);
      timerHTML = insertIntoSnippet(timerHTML, "timerName", timer.name);
      timerHTML = insertIntoSnippet(timerHTML, "timerDescription", timer.description);

      target.innerHTML = timerHTML;
      console.log("readyState: " + request.readyState + " status: " + request.status);
    } else {
      console.log("readyState: " + request.readyState + " status: " + request.status);
    }
  };

  request.open("GET", timerURL, true);
  request.send(null);
  
}
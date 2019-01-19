var timers = new timerUtil.Controller();
var currentId = 0;

document.addEventListener("DOMContentLoaded", function (event) {
  // When new timer button is clicked and after form is shown, add onclick event handler for create timer button
  var addMainTimerButton = document.getElementById("timer-main-add");
  addMainTimerButton.onclick = function() {
    $("#timer-new-modal").off("show.bs.modal");
    $("#timer-new-modal").on("show.bs.modal", function(){
      modalSetup("#timer", null, false);
    });
  }
  
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
        $("#timer-new-modal").off("show.bs.modal");
        $("#timer-new-modal").on("show.bs.modal", function(){
          modalSetup("#timer-" + timer.timerId + " .timer-child", timer, false);
        });
      };
      var deleteButton = document.querySelector("#timer-" + timer.timerId + " .timer-delete");
      deleteButton.onclick = function() {
        var timerToDelete = document.querySelector("#timer-" + timer.timerId);
        timerToDelete.parentNode.removeChild(timerToDelete);
        timers.deleteTimer(timer);
      };
      var editButton = document.querySelector("#timer-" + timer.timerId + " .timer-edit");
      editButton.onclick = function() {
        $("#timer-new-modal").off("show.bs.modal");
        $("#timer-new-modal").on("show.bs.modal", function() {
          modalSetup("", timer, true);
        })
      }                         
    }
  };

  request.open("GET", timerURL, true);
  request.send(null); 
}

function resetModal() {
  // Clear form
  document.getElementById("timer-new-form").reset();
  setAutoStart(false);
}

function setAutoStart(isOn) {
  if (isOn) {
    document.getElementById("timer-autostart-on").checked = true;
    document.getElementById("timer-autostart-on-label").classList.add("active");
    document.getElementById("timer-autostart-on").setAttribute("aria-pressed", true);
    document.getElementById("timer-autostart-off").checked = false;
    document.getElementById("timer-autostart-off-label").classList.remove("active");
    document.getElementById("timer-autostart-off").setAttribute("aria-pressed", false);
  } else {
    document.getElementById("timer-autostart-on").checked = false;
    document.getElementById("timer-autostart-on-label").classList.remove("active");
    document.getElementById("timer-autostart-on").setAttribute("aria-pressed", false);
    document.getElementById("timer-autostart-off").checked = true;
    document.getElementById("timer-autostart-off-label").classList.add("active");
    document.getElementById("timer-autostart-off").setAttribute("aria-pressed", true);
  }
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

// Update the parts of the timer display that change when the timer counts down
function updateHMS(timer) {
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
// Update the parts of the timer display that only change when timer is edited
function updateEdited(timer) {
  var titleTarget = document.querySelector("#timer-" + timer.timerId + " .timer-name h3");
  var descriptionTarget = document.querySelector("#timer-" + timer.timerId + " .timer-description p");
  var autostartTarget = document.querySelector("#timer-" + timer.timerId + " .autostart-indicator");

  titleTarget.innerHTML = timer.name;
  descriptionTarget.innerHTML = timer.description;
  autostartTarget.innerHTML = timer.autoStart ? "On" : "Off";
}

// Set up timer create/edit modal
function modalSetup(timerParentElement, timer, edit) {
  var cancelButtonHTML = '<button type="button" class="btn btn-secondary" id="timer-cancel" data-dismiss="modal">Cancel</button>';
  var saveCloseButtonHTML = '<button type="button" class="btn btn-primary" data-dismiss="modal" id="timer-save-close">Save & Close</button>';
  var createButtonsHTML = '<button type="button" class="btn btn-primary" id="timer-create">Create</button>' +
            '<button type="button" class="btn btn-primary" data-dismiss="modal" id="timer-create-close">Create & Close</button>';
  var nameInput = document.getElementById("timer-name");
  var descriptionInput = document.getElementById("timer-description");
  var hInput = document.getElementById("timer-h");
  var mInput = document.getElementById("timer-m");
  var sInput = document.getElementById("timer-s");
  var autoStartInput = document.getElementById("timer-autostart-on");
  var autoStartInputLabel = document.getElementById("timer-autostart-on-label");
  var repeatInput = document.getElementById("timer-repeat");
  var buttonFooter = document.querySelector("#timer-new-modal .modal-footer");
  

  // Edit mode
  if (edit) {
    // Set modal title to indicate edit mode
    document.getElementById("timer-modal-title").innerHTML = "Edit existing timer";
    // Populate inputs from the properties of timer
    nameInput.value = timer.name;
    descriptionInput.value = timer.description;
    // TODO: change timer properties to just store hms
    hInput.value = timer.hStart;
    mInput.value = timer.mStart;
    sInput.value = timer.sStart;
    setAutoStart(timer.autoStart);
    repeatInput.value = timer.nRepeat;
    // Insert cancel and save & close buttons
    buttonFooter.innerHTML = cancelButtonHTML + saveCloseButtonHTML;
    var saveAndCloseButton = document.getElementById("timer-save-close");
    saveAndCloseButton.onclick = function() {
      // Update timer properties
      timer.name = nameInput.value || "Timer";
      timer.description = descriptionInput.value || "";
      timer.hStart = hInput.value || 0;
      timer.mStart = mInput.value || 0;
      timer.sStart = sInput.value || 0;
      timer.autoStartInput = autoStartInput.checked;
      timer.nRepeat = repeatInput.value || 1;
      // Reset timer and update timer HTML with new properties
      timer.reset();
      updateEdited(timer);
      // Clear inputs
      resetModal();
    }
  } else {
  // Create mode
    // Set modal title to indicate create mode
    document.getElementById("timer-modal-title").innerHTML = "Create new timer";

    // Insert cancel, create, and create & close button
    buttonFooter.innerHTML = cancelButtonHTML + createButtonsHTML;
    var createAndCloseButton = document.getElementById("timer-create-close");
    var createButton = document.getElementById("timer-create");

    createAndCloseButton.onclick = function() {
      addTimer(timerParentElement, timer, false);
      // Clear form
      resetModal();
    };
    createButton.onclick = function() {
      addTimer(timerParentElement, timer, false);
      // Clear form
      resetModal();
    };
  }
  var cancelButton = document.getElementById("timer-cancel");
  cancelButton.onclick = function() {
    resetModal();
  };
}

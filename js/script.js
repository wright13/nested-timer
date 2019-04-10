var timers = new timerUtil.Controller();
var currentId = 0;

document.addEventListener("DOMContentLoaded", function (event) {
  // When new timer button is clicked and after form is shown, add onclick event handler for create timer button
  var addMainTimerButton = document.getElementById("timer-main-add");
  addMainTimerButton.onclick = function() {
    $("#timer-modal").off("show.bs.modal"); // Remove existing event handlers
    $("#timer-modal").on("show.bs.modal", function(){
      modalSetup(null, false);
    });
  }

  // Field-level validation
  document.addEventListener('blur', function (event) {

    // Only run if the field is in a form to be validated
    if (!event.target.form || !event.target.form.classList.contains('unvalidated')) return;

    // Validate the field
    window.validationUtil.validateField(event.target);

  }, true);
  
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
function buildAndShowTimerHTML(timer) {
  var hours = timerUtil.padTime(timer.h);
  var minutes = timerUtil.padTime(timer.m);
  var seconds = timerUtil.padTime(timer.s);
  var selector = timer.parent ? "#timer-" + timer.parent.timerId + " .timer-child" : "#timer";
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
        $("#timer-modal").off("show.bs.modal"); // Remove existing event handlers
        $("#timer-modal").on("show.bs.modal", function(){
          modalSetup(timer, false);
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
        $("#timer-modal").off("show.bs.modal"); // Remove existing event handlers
        $("#timer-modal").on("show.bs.modal", function() {
          modalSetup(timer, true);
        })
      }                         
    }
  };

  request.open("GET", timerURL, true);
  request.send(null); 
}

function resetModal() {
  var form = document.getElementById("timer-form");
  var autoStartSwitch = document.getElementById("timer-autostart");
  // Clear form
  form.reset();
  // Enable autostart switch
  autoStartSwitch.disabled = false;
  // Reset validation
  validationUtil.resetValidation(form);
}

function addTimer(parent) {
  var h = document.querySelector("#timer-h").value || 0;
  var m = document.querySelector("#timer-m").value || 0;
  var s = document.querySelector("#timer-s").value || 0;
  var name = document.querySelector("#timer-name").value || "Timer";
  var description = document.querySelector("#timer-description").value || "";
  var autoStart = document.getElementById("timer-autostart").checked;
  var repeat = document.querySelector("#timer-repeat").value || 1;

  // Create new timer object from values provided in the form
  var timer = new timerUtil.Timer(currentId,
                        name,
                        h,
                        m,
                        s,
                        description,
                        autoStart,
                        repeat);
  var startPauseRepeatSelctors = ["#timer-" + timer.timerId + ">div.row>div.timer-controls>.timer-start",
                                  "#timer-" + timer.timerId + ">div.row>div.timer-controls>.timer-pause",
                                  "#timer-" + timer.timerId + ">div.row>div.timer-controls>.timer-reset"];

  // UI listener
  uiListener = {
    onStart: function() {
      updateTimerStateClasses("running", startPauseRepeatSelctors);
    },
    onComplete: function() {
      updateTimerStateClasses("complete", startPauseRepeatSelctors);
    },
    onPause: function() {
      updateTimerStateClasses("paused", startPauseRepeatSelctors);
    },
    onReset: function() {
      // Update timer display
      updateHMS(timer);
      updateTimerStateClasses("reset", startPauseRepeatSelctors);
    },
    onTick: function() {
      // Update timer display
      updateHMS(timer);
    }
  };

  timer.addListener(uiListener);

  // Add timer to timer list
  if (parent) {
    parent.addSubTimer(timer);
  } else {
    timers.addTimer(timer);
  }
  currentId++;

  // Add timer to page
  buildAndShowTimerHTML(timer);

}

// Given a list of selectors, assign and remove timer state classes
function updateTimerStateClasses(newState, selectors) {
  var states = ["running", "paused", "reset", "complete", "new"];
  var element;
  // Check if selectors is a single string or an array
  if (selectors.constructor === Array) {
    // Iterate through array of selectors
    for (let i = 0; i < selectors.length; i++) {
      element = document.querySelector(selectors[i]);
      // Add the new state and remove the others
      for (let i = 0; i < states.length; i++) {
        if (states[i] == newState) {
          element.classList.add(states[i]);
        } else {
          element.classList.remove(states[i]);
        }
      }
    }
  } else if (typeof(selectors) === "string") {
    element = document.querySelector(selectors);
    // Add the new state and remove the others
    for (let i = 0; i < states.length; i++) {
        if (states[i] == newState) {
          element.classList.add(states[i]);
        } else {
          element.classList.remove(states[i]);
        }
      }
  }

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
  var titleTarget = document.querySelector("#timer-" + timer.timerId + " .timer-name");
  var descriptionTarget = document.querySelector("#timer-" + timer.timerId + " .timer-description");
  var autostartTarget = document.querySelector("#timer-" + timer.timerId + " .autostart-indicator");

  titleTarget.innerHTML = timer.name;
  descriptionTarget.innerHTML = timer.description;
  autostartTarget.innerHTML = timer.autoStart ? "On" : "Off";
}

// Set up timer create/edit modal
function modalSetup(timer, edit) {
  var form = document.getElementById("timer-form");
  var cancelButtonHTML = '<button type="button" class="btn btn-secondary" id="timer-cancel" data-dismiss="modal">Cancel</button>';
  var saveCloseButtonHTML = '<button type="button" class="btn btn-primary" data-dismiss="modal" id="timer-save-close">Save & Close</button>';
  var createButtonsHTML = '<button type="button" class="btn btn-primary" id="timer-create">Create</button>' +
            '<button type="button" class="btn btn-primary" data-dismiss="modal" id="timer-create-close">Create & Close</button>';
  var nameInput = document.getElementById("timer-name");
  var descriptionInput = document.getElementById("timer-description");
  var hInput = document.getElementById("timer-h");
  var mInput = document.getElementById("timer-m");
  var sInput = document.getElementById("timer-s");
  var autoStartInput = document.getElementById("timer-autostart");
  var repeatInput = document.getElementById("timer-repeat");
  var buttonFooter = document.querySelector("#timer-modal .modal-footer");
  var isFirstTimer = (timers.count() === 0) || (timer === timers.getFirst() && edit);

  resetModal();

  // Edit mode
  if (edit) {
    // Set modal title to indicate edit mode
    document.getElementById("timer-modal-title").innerHTML = "Edit existing timer";
    // Populate inputs from the properties of timer
    nameInput.value = timer.name;
    descriptionInput.value = timer.description;
    hInput.value = timer.hStart;
    mInput.value = timer.mStart;
    sInput.value = timer.sStart;
    autoStartInput.checked = timer.autoStart;
    repeatInput.value = timer.nRepeat;
    // Insert cancel and save & close buttons
    buttonFooter.innerHTML = cancelButtonHTML + saveCloseButtonHTML;
    var saveAndCloseButton = document.getElementById("timer-save-close");
    saveAndCloseButton.onclick = function(event) {
      // Don't do anything if there are invalid inputs
      if (validationUtil.validateForm(form, event, function(form) {
        customFormValidation(form, timer.parent, timer);
      })) {
        // Update timer properties
        timer.name = nameInput.value || "Timer";
        timer.description = descriptionInput.value || "";
        timer.hStart = hInput.value || 0;
        timer.mStart = mInput.value || 0;
        timer.sStart = sInput.value || 0;
        timer.autoStart = autoStartInput.checked;
        timer.nRepeat = repeatInput.value || 1;
        // Reset timer and update timer HTML with new properties
        timer.reset();
        updateEdited(timer);
        // Clear inputs
        resetModal();
      } 
    }
  } else {
  // Create mode
    // Set modal title to indicate create mode
    document.getElementById("timer-modal-title").innerHTML = "Create new timer";

    // Insert cancel, create, and create & close button
    buttonFooter.innerHTML = cancelButtonHTML + createButtonsHTML;
    var createAndCloseButton = document.getElementById("timer-create-close");
    var createButton = document.getElementById("timer-create");

    createAndCloseButton.onclick = function(event) {
      if (validationUtil.validateForm(form, event, function(form) {
        customFormValidation(form, timer, null);
      })) {
        // Insert the new timer into the page
        addTimer(timer, false);
        // Clear form
        resetModal();
      }
    };
    createButton.onclick = function(event) {
      if (validationUtil.validateForm(form, event, function(form) {
        customFormValidation(form, timer, null);
      })) {
        // Insert the new timer into the page
        addTimer(timer, false);
        // Clear form
        resetModal();
      }
    };
  }
  
  // Reset the form when cancel button is clicked
  var cancelButton = document.getElementById("timer-cancel");
  cancelButton.onclick = function() {
    resetModal();
  };

  // Disable auto-start toggle for the first timer
  autoStartInput.disabled = isFirstTimer;
}

function customFormValidation(form, timerParent, timerToEdit) {
    if (form.id == "timer-form") {
      var h = document.getElementById("timer-h");
      var m = document.getElementById("timer-m");
      var s = document.getElementById("timer-s");
      var newRepeats = document.getElementById("timer-repeat").value || 1;
      var oldRepeats;
      var newTime;
      var oldTime;
      var timeIsZero;
      var timerExceedsParent;
      var subtimersExceedTimer;
      var parentTime;
      var childTime;

      // Make sure h, m, and s aren't all blank or 0
      timeIsZero = (h.value == 0) && (m.value == 0) && (s.value == 0);

      // Make sure parent timer can contain the new time
      newTime = newRepeats*(3600*h.value + 60*m.value + 1*s.value);
      if (timerParent) {
        parentTime = 3600*timerParent.hStart + 60*timerParent.mStart + 1*timerParent.sStart;
        childTime = 0;
        if (timerParent.subTimers) {
          childTime = timerParent.subTimers.totalTime();
          // If we're in edit mode, we have to subtract the original time from childTime
          if (timerToEdit) {
            oldRepeats = timerToEdit.nRepeat;
            oldTime = oldRepeats*(3600*timerToEdit.hStart + 60*timerToEdit.mStart + 1*timerToEdit.sStart);
            childTime -= oldTime;
          }
        }
        timerExceedsParent = ((newTime + childTime) > parentTime);
      }

      // Make sure new time can contain subtimers
      if (timerToEdit) {
        subtimersExceedTimer = newTime < timerToEdit.subTimers.totalTime();
      }

      // Set field validity
      if (timeIsZero || timerExceedsParent || subtimersExceedTimer) {
        h.setCustomValidity("hide");
        m.setCustomValidity("hide");
        s.setCustomValidity("hide");
      } else {
        h.setCustomValidity("");
        m.setCustomValidity("");
        s.setCustomValidity("");
        
      }

      // Show/hide error messages
      if (!(timeIsZero || timerExceedsParent || subtimersExceedTimer)) {
        validationUtil.hideError(null, "invalid-hms");
        return;
      }

      if (timeIsZero) {
        validationUtil.showError(null, "Total time must be greater than 0.", "invalid-hms");
      } else if (timerExceedsParent) {
        validationUtil.showError(null, "Selected time is too long for containing timer.", "invalid-hms");
      } else if (subtimersExceedTimer) {
        validationUtil.showError(null, "Selected time is shorter than subtimers.", "invalid-hms");
      }
    }
  }

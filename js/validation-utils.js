(function (global) {
	var validationUtil = {};
	var errorMessageClass = "invalid-message";
	var errorMessageHTML = '<div class="' + errorMessageClass + '"></div>';
	var errorReminderClass = "invalid-feedback-reminder";
	var formValidatedClass = "validated";
	

	function customFormValidation(form) {
		if (form.id == "timer-form") {
			var h = document.getElementById("timer-h");
			var m = document.getElementById("timer-m");
			var s = document.getElementById("timer-s");
			
			// Make sure h, m, and s aren't all blank or 0
			if (!(1*h.value) && !(1*m.value) && !(1*s.value)) {
			  h.setCustomValidity("hide");
			  m.setCustomValidity("hide");
			  s.setCustomValidity("hide");
			  // Show error message
			  showError(null, "Total time must be greater than 0.", "invalid-hms");
			} else {
			  h.setCustomValidity("");
			  m.setCustomValidity("");
			  s.setCustomValidity("");
			  // Hide error message
			  hideError(null, "invalid-hms");
			}
		}
	}

	// Given a form and the event that triggers form submission, validates the entire form
	function validateForm(form, event) {
	var fields;
	var invalidInputReminders = form.getElementsByClassName(errorReminderClass);
	var formIsValid;
		// Form-level validation
		customFormValidation(form);

		// Validate individual fields
		fields = form.elements;
		for (let i = 0; i < fields.length; i++) {
			validateField(fields[i]);
		}

		// Check form-level validity
		formIsValid = form.checkValidity();

		if (!formIsValid) {
			// Prevent default action and stop propagation of the event.
			event.preventDefault();
			event.stopPropagation();
		}

		// Mark form as having been validated
		form.classList.add(formValidatedClass);

		return formIsValid;
	}

	function validateField(field) {
		// Get field validity
		var fieldValidity = field.validity;
		var message = [];
		var finalMessage;

		// Re-check custom form validity if form-level validation has already occurred
		if (field.form.classList.contains(formValidatedClass)) {
			customFormValidation(field.form);
		}

		// Don't validate submits, buttons, file and reset inputs, and disabled fields
		if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

		// Return null if field is valid
		if (fieldValidity.valid) {
			hideError(field);
			return true;
		}

		// Custom validity message has been set to a non-empty string
		if (fieldValidity.customError) {
			// If validation message is set to "hide", don't display it
			if (field.validationMessage != "hide") {
				message.push(field.validationMessage);
			}
		}

		// Input is not a number
		if (fieldValidity.badInput) {
			message.push("Must be a number.");
		}
		// Input does not match specified pattern
		if (fieldValidity.patternMismatch) {
			message.push("Input does not match specified format.");
		}
		// Input value greater than allowed
		if (fieldValidity.rangeOverflow) {
			message.push("Cannot exceed " + field.getAttribute("max") + ".");
		}
		// Input value smaller than allowed
		if (fieldValidity.rangeUnderflow) {
			message.push("Must be at least " + field.getAttribute("min") + ".");
		}
		// Input is not divisible by step value
		if (fieldValidity.stepMismatch) {
			if (!field.getAttribute("step") || field.getAttribute("step") == 1) {
				message.push("Must be an integer.");
			} else {
				message.push("Must be in increments of " + field.getAttribute("step") + ".");
			}
		}
		// Input is too long
		if (fieldValidity.tooLong) {
			message.push("Cannot exceed " + field.getAttribute("maxlength") + "characters.");
		}
		// Input is too short
		if (fieldValidity.tooShort) {
			message.push("Must be at least" + field.getAttribute("minlength") + "characters.");
		}
		// Input not in required url or email syntax
		if (fieldValidity.typeMismatch) {
			if (field.type === "email") {
				message.push("Invalid email.");
			} else if (field.type === "url") {
				message.push("Invalid URL.");
			} else {
				message.push("Invalid syntax.");
			}
		}
		// Input is missing from required field
		if (fieldValidity.valueMissing) {
			message.push("Required field.");
		}

		// Show error message
		finalMessage = message[0];
		for (let i = 1; i < message.length; i++) {
			finalMessage += (" " + message[i]);
		}
		showError(field, finalMessage);
	}

	// Given a form field, an error message, and an optional element id, inserts the error message into 
	// the element with id messageElementId if provided and directly after the form field otherwise.
	function showError(field, message, messageElementId) {
		var messageElement;
		message = message || "";

		// TODO: fix this so that it works with checkboxes and radio buttons

		// If field is specified, mark it as validated
		if (field) {
			field.classList.add(formValidatedClass);
		}
		
		// If messageElementId is not specified, put the error message right after the field
		if (field && !messageElementId) {
			// Check if the field already has an error message after it
			if (!field.nextElementSibling || !field.nextElementSibling.classList.contains(errorMessageClass)) {
				field.insertAdjacentHTML("afterend", errorMessageHTML);
			}
			messageElement = field.nextElementSibling;
		} else if (messageElementId) {
			messageElement = document.getElementById(messageElementId);
		}
		if (messageElement) {
			// Insert the error message
			messageElement.innerHTML = message;
			// Mark it as validated
			messageElement.classList.add(formValidatedClass);
		}
	}

	// Given a form field, and/or an optional element id, hides the element with the error message. If messageElementId
	// not provided, hides the next sibling of the field if its class indicates that it is an error message. If messageElementId is
	// provided, hides the element specified by messageElementId as long as it has the class .validation-error.
	function hideError(field, messageElementId) {
		var messageElement;

		// Mark the field as not validated
		if (field) {
			field.classList.remove(formValidatedClass);
		}
		
		// Mark the error message as not validated
		if (field && !messageElementId) {
			if (field.nextElementSibling && field.nextElementSibling.classList.contains(errorMessageClass)) {
				messageElement = field.nextElementSibling;
			}
		} else if (messageElementId) {
			messageElement = document.getElementById(messageElementId);
		}
		if (messageElement) {
			messageElement.classList.remove(formValidatedClass);
		}
		
		
	}

	function resetValidation(form) {
		// Mark everything as not validated
		var validatedElements = form.querySelectorAll("." + formValidatedClass);
		for (let i = 0; i < validatedElements.length; i++) {
			validatedElements[i].classList.remove(formValidatedClass);
		}
		form.classList.remove(formValidatedClass);

		// Reset custom validation
		fields = form.elements;
		for (let i = 0; i < fields.length; i++) {
			fields[i].setCustomValidity("");
		}
	}

	validationUtil.validateField = validateField;
	validationUtil.validateForm = validateForm;
	validationUtil.resetValidation = resetValidation;

	global.validationUtil = validationUtil;

})(window);
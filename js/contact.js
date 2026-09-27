// contact.js
// Front-end validation for the contact form. There is no backend, so a valid
// submission opens the visitor's email client with the message pre-filled
// (a mailto link) and shows a confirmation message.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_ADDRESS = "rishabhtiwari877@gmail.com";

// Show an error message under a field and mark the input invalid.
function setError(form, field, message) {
  const input = form.querySelector(`#${field}`);
  const error = form.querySelector(`[data-error-for="${field}"]`);
  if (input) {
    input.classList.add("form-input-invalid");
  }
  if (error) {
    error.textContent = message;
  }
}

// Clear the error message for a field.
function clearError(form, field) {
  const input = form.querySelector(`#${field}`);
  const error = form.querySelector(`[data-error-for="${field}"]`);
  if (input) {
    input.classList.remove("form-input-invalid");
  }
  if (error) {
    error.textContent = "";
  }
}

// Validate all fields. Returns true when the form is valid.
function validate(form) {
  let valid = true;
  const name = form.querySelector("#name").value.trim();
  const email = form.querySelector("#email").value.trim();
  const message = form.querySelector("#message").value.trim();

  if (name === "") {
    setError(form, "name", "Please enter your name.");
    valid = false;
  } else {
    clearError(form, "name");
  }

  if (!EMAIL_PATTERN.test(email)) {
    setError(form, "email", "Please enter a valid email address.");
    valid = false;
  } else {
    clearError(form, "email");
  }

  if (message === "") {
    setError(form, "message", "Please enter a message.");
    valid = false;
  } else {
    clearError(form, "message");
  }

  return valid;
}

// Handle submission: validate, then open the email client.
function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".form-status");

  if (!validate(form)) {
    if (status) {
      status.textContent = "";
    }
    return;
  }

  const name = form.querySelector("#name").value.trim();
  const email = form.querySelector("#email").value.trim();
  const message = form.querySelector("#message").value.trim();

  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
  window.location.href = `mailto:${CONTACT_ADDRESS}?subject=${subject}&body=${body}`;

  if (status) {
    status.textContent = "Thanks! Your email client should now be open.";
  }
  form.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

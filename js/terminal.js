// terminal.js
// Original component: a typewriter that "types out" a shell session on the
// home page. Each line is either a command (typed one character at a time
// after a green "$" prompt) or output (printed instantly). When all lines
// are done, a blinking cursor is left on the last prompt.

// The script sequence shown in the terminal.
const SESSION = [
  { type: "command", text: "whoami" },
  { type: "output", text: "rishabh_tiwari" },
  { type: "command", text: "cat bio.txt" },
  { type: "output", text: "MS CS @ Northeastern - Backend & infra engineer" },
  { type: "output", text: "Go / Java / Python / Kafka / Kubernetes / AWS" },
  { type: "command", text: "ls projects/" },
  { type: "output", text: "SecureCheck   TransactIQ   PromptRelay   HelmWarden" },
];

const TYPE_SPEED_MS = 45; // delay between typed characters
const LINE_PAUSE_MS = 350; // pause after each finished line

// Small promise-based delay helper so the typing reads sequentially.
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Type a single command line character by character into the output element.
async function typeCommand(output, text) {
  const prompt = document.createElement("span");
  prompt.className = "terminal-prompt";
  prompt.textContent = "$ ";
  output.appendChild(prompt);

  const line = document.createElement("span");
  output.appendChild(line);

  for (const char of text) {
    line.textContent += char;

    await wait(TYPE_SPEED_MS);
  }
  output.appendChild(document.createTextNode("\n"));
}

// Print an output line instantly.
function printOutput(output, text) {
  output.appendChild(document.createTextNode(`${text}\n`));
}

// Add the blinking cursor at the end.
function addCursor(output) {
  const prompt = document.createElement("span");
  prompt.className = "terminal-prompt";
  prompt.textContent = "$ ";
  output.appendChild(prompt);

  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";
  cursor.setAttribute("aria-hidden", "true");
  output.appendChild(cursor);
}

// Run the whole session.
async function runSession() {
  const output = document.querySelector(".terminal-output");
  if (!output) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const entry of SESSION) {
    if (entry.type === "command" && !reduceMotion) {
      await typeCommand(output, entry.text);
    } else if (entry.type === "command") {
      printOutput(output, `$ ${entry.text}`);
    } else {
      printOutput(output, entry.text);
    }

    await wait(reduceMotion ? 0 : LINE_PAUSE_MS);
  }

  addCursor(output);
}

document.addEventListener("DOMContentLoaded", runSession);

"use strict";

let promptId = null;
let resolved = false;

window.ull.onMovieFormatPrompt((message) => {
  if (!message || typeof message.promptId !== "string" ||
      !Number.isFinite(message.aspectRatio) || message.aspectRatio < 1.78 ||
      message.aspectRatio > 2.6) return;
  promptId = message.promptId;
  resolved = false;
  const ratio = message.aspectRatio.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  document.querySelector("#prompt-copy").textContent =
    `Use the ${ratio}:1 picture area for Screen Sync?`;
});

function choose(choice) {
  if (!promptId || resolved) return;
  resolved = true;
  window.ull.chooseMovieFormat(promptId, choice);
}

document.querySelector("#use-format").addEventListener("click", () => choose("use"));
document.querySelector("#keep-current").addEventListener("click", () => choose("keep"));

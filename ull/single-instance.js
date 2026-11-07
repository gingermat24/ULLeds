"use strict";

function acquireSingleInstanceLock(app, onSecondInstance) {
  if (!app || typeof app.requestSingleInstanceLock !== "function" ||
      typeof app.quit !== "function" || typeof app.on !== "function" ||
      typeof app.whenReady !== "function" || typeof onSecondInstance !== "function") {
    throw new TypeError("Electron app and a second-instance handler are required.");
  }
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return false;
  }
  app.on("second-instance", () => {
    app.whenReady().then(onSecondInstance).catch((error) => {
      console.error("Could not focus the existing ULLeds window:", error);
    });
  });
  return true;
}

module.exports = { acquireSingleInstanceLock };

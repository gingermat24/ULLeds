// Worker entry point resolved at runtime by main/runtime.js.
// Source lives in src/main/workers/screen-capture-worker.js.
module.exports = (module, exports, __webpack_require__) => {
  module.exports = __webpack_require__.p + "screen-capture-worker.js";
};

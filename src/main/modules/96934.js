module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.getElectronBinding = void 0),
    (t.getElectronBinding = (e) =>
      process._linkedBinding
        ? process._linkedBinding("electron_common_" + e)
        : process.electronBinding
          ? process.electronBinding(e)
          : null));
};

module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.ElectronAppAdapter = void 0));
  const n = r(16928),
    i = r(27349);
  t.ElectronAppAdapter = class {
    constructor(e = r(84157).app) {
      this.app = e;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return !0 === this.app.isPackaged;
    }
    get appUpdateConfigPath() {
      return this.isPackaged
        ? n.join(process.resourcesPath, "app-update.yml")
        : n.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, i.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(e) {
      this.app.once("quit", (t, r) => e(r));
    }
  };
};

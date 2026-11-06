module.exports = (e, t, r) => {
  "use strict";
  const n = r(35317),
    i = r(70857),
    o = r(16928),
    s = r(25397);
  e.exports = class {
    appName = void 0;
    appPackageJson = void 0;
    platform = process.platform;
    getAppLogPath(e = this.getAppName()) {
      return "darwin" === this.platform
        ? o.join(this.getSystemPathHome(), "Library/Logs", e)
        : o.join(this.getAppUserDataPath(e), "logs");
    }
    getAppName() {
      const e = this.appName || this.getAppPackageJson()?.name;
      if (!e)
        throw new Error(
          "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()",
        );
      return e;
    }
    getAppPackageJson() {
      return (
        "object" != typeof this.appPackageJson &&
          (this.appPackageJson = s.findAndReadPackageJson()),
        this.appPackageJson
      );
    }
    getAppUserDataPath(e = this.getAppName()) {
      return e ? o.join(this.getSystemPathAppData(), e) : void 0;
    }
    getAppVersion() {
      return this.getAppPackageJson()?.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const e = Number(i.release().split(".")[0]);
      return e <= 19 ? "10." + (e - 4) : e - 9;
    }
    getOsVersion() {
      let e = i.type().replace("_", " "),
        t = i.release();
      return ("Darwin" === e && ((e = "macOS"), (t = this.getMacOsVersion())), `${e} ${t}`);
    }
    getPathVariables() {
      const e = this.getAppName(),
        t = this.getAppVersion(),
        r = this;
      return {
        appData: this.getSystemPathAppData(),
        appName: e,
        appVersion: t,
        get electronDefaultDir() {
          return r.getElectronLogPath();
        },
        home: this.getSystemPathHome(),
        libraryDefaultDir: this.getAppLogPath(e),
        libraryTemplate: this.getAppLogPath("{appName}"),
        temp: this.getSystemPathTemp(),
        userData: this.getAppUserDataPath(e),
      };
    }
    getSystemPathAppData() {
      const e = this.getSystemPathHome();
      switch (this.platform) {
        case "darwin":
          return o.join(e, "Library/Application Support");
        case "win32":
          return process.env.APPDATA || o.join(e, "AppData/Roaming");
        default:
          return process.env.XDG_CONFIG_HOME || o.join(e, ".config");
      }
    }
    getSystemPathHome() {
      return i.homedir?.() || process.env.HOME;
    }
    getSystemPathTemp() {
      return i.tmpdir();
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: void 0,
        os: this.getOsVersion(),
      };
    }
    isDev() {
      return "1" === process.env.ELECTRON_IS_DEV;
    }
    isElectron() {
      return Boolean(process.versions.electron);
    }
    onAppEvent(e, t) {}
    onAppReady(e) {
      e();
    }
    onEveryWebContentsEvent(e, t) {}
    onIpc(e, t) {}
    onIpcInvoke(e, t) {}
    openUrl(e, t = console.error) {
      const r =
        { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
      n.exec(`${r} ${e}`, {}, (e) => {
        e && t(e);
      });
    }
    setAppName(e) {
      this.appName = e;
    }
    setPlatform(e) {
      this.platform = e;
    }
    setPreloadFileForSessions({
      filePath: e,
      includeFutureSession: t = !0,
      getSessions: r = () => [],
    }) {}
    sendIpc(e, t) {}
    showErrorBox(e, t) {}
  };
};

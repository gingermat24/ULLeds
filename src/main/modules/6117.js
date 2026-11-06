module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    i = r(20010);
  e.exports = class extends i {
    electron = void 0;
    constructor({ electron: e } = {}) {
      (super(), (this.electron = e));
    }
    getAppName() {
      let e;
      try {
        e = this.appName || this.electron.app?.name || this.electron.app?.getName();
      } catch {}
      return e || super.getAppName();
    }
    getAppUserDataPath(e) {
      return this.getPath("userData") || super.getAppUserDataPath(e);
    }
    getAppVersion() {
      let e;
      try {
        e = this.electron.app?.getVersion();
      } catch {}
      return e || super.getAppVersion();
    }
    getElectronLogPath() {
      return this.getPath("logs") || super.getElectronLogPath();
    }
    getPath(e) {
      try {
        return this.electron.app?.getPath(e);
      } catch {
        return;
      }
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: `Electron ${process.versions.electron}`,
        os: this.getOsVersion(),
      };
    }
    getSystemPathAppData() {
      return this.getPath("appData") || super.getSystemPathAppData();
    }
    isDev() {
      return void 0 !== this.electron.app?.isPackaged
        ? !this.electron.app.isPackaged
        : "string" == typeof process.execPath
          ? n.basename(process.execPath).toLowerCase().startsWith("electron")
          : super.isDev();
    }
    onAppEvent(e, t) {
      return (
        this.electron.app?.on(e, t),
        () => {
          this.electron.app?.off(e, t);
        }
      );
    }
    onAppReady(e) {
      this.electron.app?.isReady()
        ? e()
        : this.electron.app?.once
          ? this.electron.app?.once("ready", e)
          : e();
    }
    onEveryWebContentsEvent(e, t) {
      return (
        this.electron.webContents?.getAllWebContents()?.forEach((r) => {
          r.on(e, t);
        }),
        this.electron.app?.on("web-contents-created", r),
        () => {
          (this.electron.webContents?.getAllWebContents().forEach((r) => {
            r.off(e, t);
          }),
            this.electron.app?.off("web-contents-created", r));
        }
      );
      function r(r, n) {
        n.on(e, t);
      }
    }
    onIpc(e, t) {
      this.electron.ipcMain?.on(e, t);
    }
    onIpcInvoke(e, t) {
      this.electron.ipcMain?.handle?.(e, t);
    }
    openUrl(e, t = console.error) {
      this.electron.shell?.openExternal(e).catch(t);
    }
    setPreloadFileForSessions({
      filePath: e,
      includeFutureSession: t = !0,
      getSessions: r = () => [this.electron.session?.defaultSession],
    }) {
      for (const e of r().filter(Boolean)) n(e);
      function n(t) {
        t.setPreloads([...t.getPreloads(), e]);
      }
      t &&
        this.onAppEvent("session-created", (e) => {
          n(e);
        });
    }
    sendIpc(e, t) {
      this.electron.BrowserWindow?.getAllWindows()?.forEach((r) => {
        !1 === r.webContents?.isDestroyed() && r.webContents.send(e, t);
      });
    }
    showErrorBox(e, t) {
      this.electron.dialog?.showErrorBox(e, t);
    }
  };
};

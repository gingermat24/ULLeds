module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.BaseUpdater = void 0));
  const n = r(35317),
    i = r(75807);
  class o extends i.AppUpdater {
    constructor(e, t) {
      (super(e, t), (this.quitAndInstallCalled = !1), (this.quitHandlerAdded = !1));
    }
    quitAndInstall(e = !1, t = !1) {
      (this._logger.info("Install on explicit quitAndInstall"),
        this.install(e, e ? t : this.autoRunAppAfterInstall)
          ? setImmediate(() => {
              (r(84157).autoUpdater.emit("before-quit-for-update"), this.app.quit());
            })
          : (this.quitAndInstallCalled = !1));
    }
    executeDownload(e) {
      return super.executeDownload({
        ...e,
        done: (e) => (this.dispatchUpdateDownloaded(e), this.addQuitHandler(), Promise.resolve()),
      });
    }
    install(e = !1, t = !1) {
      if (this.quitAndInstallCalled)
        return (this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1);
      const r = this.downloadedUpdateHelper,
        n =
          r && r.file
            ? "linux" === process.platform
              ? r.file.replace(/ /g, "\\ ")
              : r.file
            : null,
        i = null == r ? null : r.downloadedFileInfo;
      if (null == n || null == i)
        return (
          this.dispatchError(new Error("No valid update available, can't quit and install")),
          !1
        );
      this.quitAndInstallCalled = !0;
      try {
        return (
          this._logger.info(`Install: isSilent: ${e}, isForceRunAfter: ${t}`),
          this.doInstall({
            installerPath: n,
            isSilent: e,
            isForceRunAfter: t,
            isAdminRightsRequired: i.isAdminRightsRequired,
          })
        );
      } catch (e) {
        return (this.dispatchError(e), !1);
      }
    }
    addQuitHandler() {
      !this.quitHandlerAdded &&
        this.autoInstallOnAppQuit &&
        ((this.quitHandlerAdded = !0),
        this.app.onQuit((e) => {
          this.quitAndInstallCalled
            ? this._logger.info(
                "Update installer has already been triggered. Quitting application.",
              )
            : this.autoInstallOnAppQuit
              ? 0 === e
                ? (this._logger.info("Auto install update on quit"), this.install(!0, !1))
                : this._logger.info(
                    `Update will be not installed on quit because application is quitting with exit code ${e}`,
                  )
              : this._logger.info(
                  "Update will not be installed on quit because autoInstallOnAppQuit is set to false.",
                );
        }));
    }
    wrapSudo() {
      const { name: e } = this.app,
        t = `"${e} would like to update"`,
        r = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"),
        n = [r];
      return (
        /kdesudo/i.test(r)
          ? (n.push("--comment", t), n.push("-c"))
          : /gksudo/i.test(r)
            ? n.push("--message", t)
            : /pkexec/i.test(r) && n.push("--disable-internal-agent"),
        n.join(" ")
      );
    }
    spawnSyncLog(e, t = [], r = {}) {
      return (
        this._logger.info(`Executing: ${e} with args: ${t}`),
        (0, n.spawnSync)(e, t, {
          env: { ...process.env, ...r },
          encoding: "utf-8",
          shell: !0,
        }).stdout.trim()
      );
    }
    async spawnLog(e, t = [], r = void 0, i = "ignore") {
      return (
        this._logger.info(`Executing: ${e} with args: ${t}`),
        new Promise((o, s) => {
          try {
            const a = { stdio: i, env: r, detached: !0 },
              c = (0, n.spawn)(e, t, a);
            (c.on("error", (e) => {
              s(e);
            }),
              c.unref(),
              void 0 !== c.pid && o(!0));
          } catch (e) {
            s(e);
          }
        })
      );
    }
  }
  t.BaseUpdater = o;
};

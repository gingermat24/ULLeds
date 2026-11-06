module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.RpmUpdater = void 0));
  const n = r(43245),
    i = r(60630),
    o = r(29721);
  class s extends n.BaseUpdater {
    constructor(e, t) {
      super(e, t);
    }
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider,
        r = (0, o.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "rpm", [
          "AppImage",
          "deb",
        ]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: r,
        downloadUpdateOptions: e,
        task: async (e, t) => {
          (this.listenerCount(i.DOWNLOAD_PROGRESS) > 0 &&
            (t.onProgress = (e) => this.emit(i.DOWNLOAD_PROGRESS, e)),
            await this.httpExecutor.download(r.url, e, t));
        },
      });
    }
    doInstall(e) {
      const t = e.installerPath,
        r = this.wrapSudo(),
        n = /pkexec/i.test(r) ? "" : '"',
        i = this.spawnSyncLog("which zypper");
      let o;
      return (
        (o = i
          ? [i, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", t]
          : [this.spawnSyncLog("which dnf || which yum"), "-y", "install", t]),
        this.spawnSyncLog(r, [`${n}/bin/bash`, "-c", `'${o.join(" ")}'${n}`]),
        e.isForceRunAfter && this.app.relaunch(),
        !0
      );
    }
  }
  t.RpmUpdater = s;
};

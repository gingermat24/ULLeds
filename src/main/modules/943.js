module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.DebUpdater = void 0));
  const n = r(43245),
    i = r(60630),
    o = r(29721);
  class s extends n.BaseUpdater {
    constructor(e, t) {
      super(e, t);
    }
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider,
        r = (0, o.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "deb", [
          "AppImage",
          "rpm",
        ]);
      return this.executeDownload({
        fileExtension: "deb",
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
      const t = this.wrapSudo(),
        r = /pkexec/i.test(t) ? "" : '"',
        n = ["dpkg", "-i", e.installerPath, "||", "apt-get", "install", "-f", "-y"];
      return (
        this.spawnSyncLog(t, [`${r}/bin/bash`, "-c", `'${n.join(" ")}'${r}`]),
        e.isForceRunAfter && this.app.relaunch(),
        !0
      );
    }
  }
  t.DebUpdater = s;
};

module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.AppImageUpdater = void 0));
  const n = r(23108),
    i = r(35317),
    o = r(45768),
    s = r(79896),
    a = r(16928),
    c = r(43245),
    l = r(16635),
    u = r(60630),
    p = r(29721);
  class d extends c.BaseUpdater {
    constructor(e, t) {
      super(e, t);
    }
    isUpdaterActive() {
      return null == process.env.APPIMAGE
        ? (null == process.env.SNAP
            ? this._logger.warn(
                "APPIMAGE env is not defined, current application is not an AppImage",
              )
            : this._logger.info("SNAP env is defined, updater is disabled"),
          !1)
        : super.isUpdaterActive();
    }
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider,
        r = (0, p.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "AppImage", [
          "rpm",
          "deb",
        ]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: r,
        downloadUpdateOptions: e,
        task: async (i, s) => {
          const a = process.env.APPIMAGE;
          if (null == a)
            throw (0, n.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          let c = !1;
          try {
            const n = {
              newUrl: r.url,
              oldFile: a,
              logger: this._logger,
              newFile: i,
              isUseMultipleRangeRequest: t.isUseMultipleRangeRequest,
              requestHeaders: e.requestHeaders,
              cancellationToken: e.cancellationToken,
            };
            (this.listenerCount(u.DOWNLOAD_PROGRESS) > 0 &&
              (n.onProgress = (e) => this.emit(u.DOWNLOAD_PROGRESS, e)),
              await new l.FileWithEmbeddedBlockMapDifferentialDownloader(
                r.info,
                this.httpExecutor,
                n,
              ).download());
          } catch (e) {
            (this._logger.error(
              `Cannot download differentially, fallback to full download: ${e.stack || e}`,
            ),
              (c = "linux" === process.platform));
          }
          (c && (await this.httpExecutor.download(r.url, i, s)), await (0, o.chmod)(i, 493));
        },
      });
    }
    doInstall(e) {
      const t = process.env.APPIMAGE;
      if (null == t)
        throw (0, n.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      let r;
      (0, s.unlinkSync)(t);
      const o = a.basename(t);
      ((r =
        a.basename(e.installerPath) !== o && /\d+\.\d+\.\d+/.test(o)
          ? a.join(a.dirname(t), a.basename(e.installerPath))
          : t),
        (0, i.execFileSync)("mv", ["-f", e.installerPath, r]),
        r !== t && this.emit("appimage-filename-updated", r));
      const c = { ...process.env, APPIMAGE_SILENT_INSTALL: "true" };
      return (
        e.isForceRunAfter
          ? this.spawnLog(r, [], c)
          : ((c.APPIMAGE_EXIT_AFTER_INSTALL = "true"), (0, i.execFileSync)(r, [], { env: c })),
        !0
      );
    }
  }
  t.AppImageUpdater = d;
};

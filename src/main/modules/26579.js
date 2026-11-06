module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.NsisUpdater = void 0));
  const n = r(23108),
    i = r(16928),
    o = r(43245),
    s = r(16635),
    a = r(60630),
    c = r(29721),
    l = r(45768),
    u = r(79931),
    p = r(87016);
  class d extends o.BaseUpdater {
    constructor(e, t) {
      (super(e, t),
        (this._verifyUpdateCodeSignature = (e, t) => (0, u.verifySignature)(e, t, this._logger)));
    }
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(e) {
      e && (this._verifyUpdateCodeSignature = e);
    }
    doDownloadUpdate(e) {
      const t = e.updateInfoAndProvider.provider,
        r = (0, c.findFile)(t.resolveFiles(e.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: e,
        fileInfo: r,
        task: async (i, o, s, a) => {
          const c = r.packageInfo,
            u = null != c && null != s;
          if (u && e.disableWebInstaller)
            throw (0, n.newError)(
              `Unable to download new version ${e.updateInfoAndProvider.info.version}. Web Installers are disabled`,
              "ERR_UPDATER_WEB_INSTALLER_DISABLED",
            );
          (u ||
            e.disableWebInstaller ||
            this._logger.warn(
              "disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version.",
            ),
            (u ||
              e.disableDifferentialDownload ||
              (await this.differentialDownloadInstaller(
                r,
                e,
                i,
                t,
                n.CURRENT_APP_INSTALLER_FILE_NAME,
              ))) &&
              (await this.httpExecutor.download(r.url, i, o)));
          const d = await this.verifySignature(i);
          if (null != d)
            throw (
              await a(),
              (0, n.newError)(
                `New version ${e.updateInfoAndProvider.info.version} is not signed by the application owner: ${d}`,
                "ERR_UPDATER_INVALID_SIGNATURE",
              )
            );
          if (u && (await this.differentialDownloadWebPackage(e, c, s, t)))
            try {
              await this.httpExecutor.download(new p.URL(c.path), s, {
                headers: e.requestHeaders,
                cancellationToken: e.cancellationToken,
                sha512: c.sha512,
              });
            } catch (e) {
              try {
                await (0, l.unlink)(s);
              } catch (e) {}
              throw e;
            }
        },
      });
    }
    async verifySignature(e) {
      let t;
      try {
        if (((t = (await this.configOnDisk.value).publisherName), null == t)) return null;
      } catch (e) {
        if ("ENOENT" === e.code) return null;
        throw e;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(t) ? t : [t], e);
    }
    doInstall(e) {
      const t = ["--updated"];
      (e.isSilent && t.push("/S"),
        e.isForceRunAfter && t.push("--force-run"),
        this.installDirectory && t.push(`/D=${this.installDirectory}`));
      const n =
        null == this.downloadedUpdateHelper ? null : this.downloadedUpdateHelper.packageFile;
      null != n && t.push(`--package-file=${n}`);
      const o = () => {
        this.spawnLog(
          i.join(process.resourcesPath, "elevate.exe"),
          [e.installerPath].concat(t),
        ).catch((e) => this.dispatchError(e));
      };
      return e.isAdminRightsRequired
        ? (this._logger.info(
            "isAdminRightsRequired is set to true, run installer using elevate.exe",
          ),
          o(),
          !0)
        : (this.spawnLog(e.installerPath, t).catch((t) => {
            const n = t.code;
            (this._logger.info(
              `Cannot run installer: error code: ${n}, error message: "${t.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`,
            ),
              "UNKNOWN" === n || "EACCES" === n
                ? o()
                : "ENOENT" === n
                  ? r(84157)
                      .shell.openPath(e.installerPath)
                      .catch((e) => this.dispatchError(e))
                  : this.dispatchError(t));
          }),
          !0);
    }
    async differentialDownloadWebPackage(e, t, r, o) {
      if (null == t.blockMapSize) return !0;
      try {
        const c = {
          newUrl: new p.URL(t.path),
          oldFile: i.join(this.downloadedUpdateHelper.cacheDir, n.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: r,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: o.isUseMultipleRangeRequest,
          cancellationToken: e.cancellationToken,
        };
        (this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 &&
          (c.onProgress = (e) => this.emit(a.DOWNLOAD_PROGRESS, e)),
          await new s.FileWithEmbeddedBlockMapDifferentialDownloader(
            t,
            this.httpExecutor,
            c,
          ).download());
      } catch (e) {
        return (
          this._logger.error(
            `Cannot download differentially, fallback to full download: ${e.stack || e}`,
          ),
          "win32" === process.platform
        );
      }
      return !1;
    }
  }
  t.NsisUpdater = d;
};

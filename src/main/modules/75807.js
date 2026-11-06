module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.NoOpLogger = t.AppUpdater = void 0));
  const n = r(23108),
    i = r(76982),
    o = r(70857),
    s = r(24434),
    a = r(45768),
    c = r(81827),
    l = r(89712),
    u = r(16928),
    p = r(63752),
    d = r(25863),
    f = r(51275),
    h = r(55036),
    m = r(93702),
    g = r(60630),
    v = r(4382),
    y = r(43106),
    w = r(74451),
    b = r(24781);
  class x extends s.EventEmitter {
    get channel() {
      return this._channel;
    }
    set channel(e) {
      if (null != this._channel) {
        if ("string" != typeof e)
          throw (0, n.newError)(
            `Channel must be a string, but got: ${e}`,
            "ERR_UPDATER_INVALID_CHANNEL",
          );
        if (0 === e.length)
          throw (0, n.newError)(
            "Channel must be not an empty string",
            "ERR_UPDATER_INVALID_CHANNEL",
          );
      }
      ((this._channel = e), (this.allowDowngrade = !0));
    }
    addAuthHeader(e) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, { authorization: e });
    }
    get netSession() {
      return (0, h.getNetSession)();
    }
    get logger() {
      return this._logger;
    }
    set logger(e) {
      this._logger = null == e ? new E() : e;
    }
    set updateConfigPath(e) {
      ((this.clientPromise = null),
        (this._appUpdateConfigPath = e),
        (this.configOnDisk = new l.Lazy(() => this.loadUpdateConfig())));
    }
    constructor(e, t) {
      (super(),
        (this.autoDownload = !0),
        (this.autoInstallOnAppQuit = !0),
        (this.autoRunAppAfterInstall = !0),
        (this.allowPrerelease = !1),
        (this.fullChangelog = !1),
        (this.allowDowngrade = !1),
        (this.disableWebInstaller = !1),
        (this.disableDifferentialDownload = !1),
        (this.forceDevUpdateConfig = !1),
        (this._channel = null),
        (this.downloadedUpdateHelper = null),
        (this.requestHeaders = null),
        (this._logger = console),
        (this.signals = new g.UpdaterSignal(this)),
        (this._appUpdateConfigPath = null),
        (this.clientPromise = null),
        (this.stagingUserIdPromise = new l.Lazy(() => this.getOrCreateStagingUserId())),
        (this.configOnDisk = new l.Lazy(() => this.loadUpdateConfig())),
        (this.checkForUpdatesPromise = null),
        (this.downloadPromise = null),
        (this.updateInfoAndProvider = null),
        (this._testOnlyOptions = null),
        this.on("error", (e) => {
          this._logger.error(`Error: ${e.stack || e.message}`);
        }),
        null == t
          ? ((this.app = new f.ElectronAppAdapter()),
            (this.httpExecutor = new h.ElectronHttpExecutor((e, t) => this.emit("login", e, t))))
          : ((this.app = t), (this.httpExecutor = null)));
      const r = this.app.version,
        i = (0, p.parse)(r);
      if (null == i)
        throw (0, n.newError)(
          `App version is not a valid semver version: "${r}"`,
          "ERR_UPDATER_INVALID_VERSION",
        );
      ((this.currentVersion = i),
        (this.allowPrerelease = (function (e) {
          const t = (0, p.prerelease)(e);
          return null != t && t.length > 0;
        })(i)),
        null != e &&
          (this.setFeedURL(e),
          "string" != typeof e && e.requestHeaders && (this.requestHeaders = e.requestHeaders)));
    }
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    setFeedURL(e) {
      const t = this.createProviderRuntimeOptions();
      let r;
      ((r =
        "string" == typeof e
          ? new m.GenericProvider({ provider: "generic", url: e }, this, {
              ...t,
              isUseMultipleRangeRequest: (0, v.isUrlProbablySupportMultiRangeRequests)(e),
            })
          : (0, v.createClient)(e, this, t)),
        (this.clientPromise = Promise.resolve(r)));
    }
    checkForUpdates() {
      if (!this.isUpdaterActive()) return Promise.resolve(null);
      let e = this.checkForUpdatesPromise;
      if (null != e) return (this._logger.info("Checking for update (already in progress)"), e);
      const t = () => (this.checkForUpdatesPromise = null);
      return (
        this._logger.info("Checking for update"),
        (e = this.doCheckForUpdates()
          .then((e) => (t(), e))
          .catch((e) => {
            throw (
              t(),
              this.emit("error", e, `Cannot check for updates: ${(e.stack || e).toString()}`),
              e
            );
          })),
        (this.checkForUpdatesPromise = e),
        e
      );
    }
    isUpdaterActive() {
      return !(
        !this.app.isPackaged &&
        !this.forceDevUpdateConfig &&
        (this._logger.info(
          "Skip checkForUpdates because application is not packed and dev update config is not forced",
        ),
        1)
      );
    }
    checkForUpdatesAndNotify(e) {
      return this.checkForUpdates().then((t) =>
        (null == t ? void 0 : t.downloadPromise)
          ? (t.downloadPromise.then(() => {
              const n = x.formatDownloadNotification(t.updateInfo.version, this.app.name, e);
              new (r(84157).Notification)(n).show();
            }),
            t)
          : (null != this._logger.debug &&
              this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"),
            t),
      );
    }
    static formatDownloadNotification(e, t, r) {
      return (
        null == r &&
          (r = {
            title: "A new update is ready to install",
            body: "{appName} version {version} has been downloaded and will be automatically installed on exit",
          }),
        {
          title: r.title.replace("{appName}", t).replace("{version}", e),
          body: r.body.replace("{appName}", t).replace("{version}", e),
        }
      );
    }
    async isStagingMatch(e) {
      const t = e.stagingPercentage;
      let r = t;
      if (null == r) return !0;
      if (((r = parseInt(r, 10)), isNaN(r)))
        return (this._logger.warn(`Staging percentage is NaN: ${t}`), !0);
      r /= 100;
      const i = await this.stagingUserIdPromise.value,
        o = n.UUID.parse(i).readUInt32BE(12) / 4294967295;
      return (
        this._logger.info(`Staging percentage: ${r}, percentage: ${o}, user id: ${i}`),
        o < r
      );
    }
    computeFinalHeaders(e) {
      return (null != this.requestHeaders && Object.assign(e, this.requestHeaders), e);
    }
    async isUpdateAvailable(e) {
      const t = (0, p.parse)(e.version);
      if (null == t)
        throw (0, n.newError)(
          `This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${e.version}"`,
          "ERR_UPDATER_INVALID_VERSION",
        );
      const r = this.currentVersion;
      if ((0, p.eq)(t, r)) return !1;
      const i = null == e ? void 0 : e.minimumSystemVersion,
        s = (0, o.release)();
      if (i)
        try {
          if ((0, p.lt)(s, i))
            return (
              this._logger.info(
                `Current OS version ${s} is less than the minimum OS version required ${i} for version ${s}`,
              ),
              !1
            );
        } catch (e) {
          this._logger.warn(
            `Failed to compare current OS version(${s}) with minimum OS version(${i}): ${(e.message || e).toString()}`,
          );
        }
      if (!(await this.isStagingMatch(e))) return !1;
      const a = (0, p.gt)(t, r),
        c = (0, p.lt)(t, r);
      return !!a || (this.allowDowngrade && c);
    }
    async getUpdateInfoAndProvider() {
      (await this.app.whenReady(),
        null == this.clientPromise &&
          (this.clientPromise = this.configOnDisk.value.then((e) =>
            (0, v.createClient)(e, this, this.createProviderRuntimeOptions()),
          )));
      const e = await this.clientPromise,
        t = await this.stagingUserIdPromise.value;
      return (
        e.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": t })),
        { info: await e.getLatestVersion(), provider: e }
      );
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: null == this._testOnlyOptions ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor,
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const e = await this.getUpdateInfoAndProvider(),
        t = e.info;
      if (!(await this.isUpdateAvailable(t)))
        return (
          this._logger.info(
            `Update for version ${this.currentVersion.format()} is not available (latest version: ${t.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`,
          ),
          this.emit("update-not-available", t),
          { versionInfo: t, updateInfo: t }
        );
      ((this.updateInfoAndProvider = e), this.onUpdateAvailable(t));
      const r = new n.CancellationToken();
      return {
        versionInfo: t,
        updateInfo: t,
        cancellationToken: r,
        downloadPromise: this.autoDownload ? this.downloadUpdate(r) : null,
      };
    }
    onUpdateAvailable(e) {
      (this._logger.info(
        `Found version ${e.version} (url: ${(0, n.asArray)(e.files)
          .map((e) => e.url)
          .join(", ")})`,
      ),
        this.emit("update-available", e));
    }
    downloadUpdate(e = new n.CancellationToken()) {
      const t = this.updateInfoAndProvider;
      if (null == t) {
        const e = new Error("Please check update first");
        return (this.dispatchError(e), Promise.reject(e));
      }
      if (null != this.downloadPromise)
        return (
          this._logger.info("Downloading update (already in progress)"),
          this.downloadPromise
        );
      this._logger.info(
        `Downloading update from ${(0, n.asArray)(t.info.files)
          .map((e) => e.url)
          .join(", ")}`,
      );
      const r = (e) => {
        if (!(e instanceof n.CancellationError))
          try {
            this.dispatchError(e);
          } catch (e) {
            this._logger.warn(`Cannot dispatch error event: ${e.stack || e}`);
          }
        return e;
      };
      return (
        (this.downloadPromise = this.doDownloadUpdate({
          updateInfoAndProvider: t,
          requestHeaders: this.computeRequestHeaders(t.provider),
          cancellationToken: e,
          disableWebInstaller: this.disableWebInstaller,
          disableDifferentialDownload: this.disableDifferentialDownload,
        })
          .catch((e) => {
            throw r(e);
          })
          .finally(() => {
            this.downloadPromise = null;
          })),
        this.downloadPromise
      );
    }
    dispatchError(e) {
      this.emit("error", e, (e.stack || e).toString());
    }
    dispatchUpdateDownloaded(e) {
      this.emit(g.UPDATE_DOWNLOADED, e);
    }
    async loadUpdateConfig() {
      return (
        null == this._appUpdateConfigPath &&
          (this._appUpdateConfigPath = this.app.appUpdateConfigPath),
        (0, c.load)(await (0, a.readFile)(this._appUpdateConfigPath, "utf-8"))
      );
    }
    computeRequestHeaders(e) {
      const t = e.fileExtraDownloadHeaders;
      if (null != t) {
        const e = this.requestHeaders;
        return null == e ? t : { ...t, ...e };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const e = u.join(this.app.userDataPath, ".updaterId");
      try {
        const t = await (0, a.readFile)(e, "utf-8");
        if (n.UUID.check(t)) return t;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${t}`);
      } catch (e) {
        "ENOENT" !== e.code &&
          this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${e}`);
      }
      const t = n.UUID.v5((0, i.randomBytes)(4096), n.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${t}`);
      try {
        await (0, a.outputFile)(e, t);
      } catch (e) {
        this._logger.warn(`Couldn't write out staging user ID: ${e}`);
      }
      return t;
    }
    get isAddNoCacheQuery() {
      const e = this.requestHeaders;
      if (null == e) return !0;
      for (const t of Object.keys(e)) {
        const e = t.toLowerCase();
        if ("authorization" === e || "private-token" === e) return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let e = this.downloadedUpdateHelper;
      if (null == e) {
        const t = (await this.configOnDisk.value).updaterCacheDirName,
          r = this._logger;
        null == t &&
          r.error(
            "updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?",
          );
        const n = u.join(this.app.baseCachePath, t || this.app.name);
        (null != r.debug && r.debug(`updater cache dir: ${n}`),
          (e = new d.DownloadedUpdateHelper(n)),
          (this.downloadedUpdateHelper = e));
      }
      return e;
    }
    async executeDownload(e) {
      const t = e.fileInfo,
        r = {
          headers: e.downloadUpdateOptions.requestHeaders,
          cancellationToken: e.downloadUpdateOptions.cancellationToken,
          sha2: t.info.sha2,
          sha512: t.info.sha512,
        };
      this.listenerCount(g.DOWNLOAD_PROGRESS) > 0 &&
        (r.onProgress = (e) => this.emit(g.DOWNLOAD_PROGRESS, e));
      const i = e.downloadUpdateOptions.updateInfoAndProvider.info,
        o = i.version,
        s = t.packageInfo,
        c = await this.getOrCreateDownloadHelper(),
        l = c.cacheDirForPendingUpdate;
      await (0, a.mkdir)(l, { recursive: !0 });
      const p = (function () {
        const t = decodeURIComponent(e.fileInfo.url.pathname);
        return t.endsWith(`.${e.fileExtension}`) ? u.basename(t) : e.fileInfo.info.url;
      })();
      let f = u.join(l, p);
      const h = null == s ? null : u.join(l, `package-${o}${u.extname(s.path) || ".7z"}`),
        m = async (r) => (
          await c.setDownloadedFile(f, h, i, t, p, r),
          await e.done({ ...i, downloadedFile: f }),
          null == h ? [f] : [f, h]
        ),
        v = this._logger,
        y = await c.validateDownloadedPath(f, i, t, v);
      if (null != y) return ((f = y), await m(!1));
      const w = async () => (
          await c.clear().catch(() => {}),
          await (0, a.unlink)(f).catch(() => {})
        ),
        b = await (0, d.createTempUpdateFile)(`temp-${p}`, l, v);
      try {
        (await e.task(b, r, h, w),
          await (0, n.retry)(
            () => (0, a.rename)(b, f),
            60,
            500,
            0,
            0,
            (e) => e instanceof Error && /^EBUSY:/.test(e.message),
          ));
      } catch (e) {
        throw (
          await w(),
          e instanceof n.CancellationError &&
            (v.info("cancelled"), this.emit("update-cancelled", i)),
          e
        );
      }
      return (v.info(`New version ${o} has been downloaded to ${f}`), await m(!0));
    }
    async differentialDownloadInstaller(e, t, r, n, i) {
      try {
        if (null != this._testOnlyOptions && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const o = (0, w.blockmapFiles)(
          e.url,
          this.app.version,
          t.updateInfoAndProvider.info.version,
        );
        this._logger.info(`Download block maps (old: "${o[0]}", new: ${o[1]})`);
        const s = async (e) => {
            const r = await this.httpExecutor.downloadToBuffer(e, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
            });
            if (null == r || 0 === r.length) throw new Error(`Blockmap "${e.href}" is empty`);
            try {
              return JSON.parse((0, y.gunzipSync)(r).toString());
            } catch (t) {
              throw new Error(`Cannot parse blockmap "${e.href}", error: ${t}`);
            }
          },
          a = {
            newUrl: e.url,
            oldFile: u.join(this.downloadedUpdateHelper.cacheDir, i),
            logger: this._logger,
            newFile: r,
            isUseMultipleRangeRequest: n.isUseMultipleRangeRequest,
            requestHeaders: t.requestHeaders,
            cancellationToken: t.cancellationToken,
          };
        this.listenerCount(g.DOWNLOAD_PROGRESS) > 0 &&
          (a.onProgress = (e) => this.emit(g.DOWNLOAD_PROGRESS, e));
        const c = await Promise.all(o.map((e) => s(e)));
        return (
          await new b.GenericDifferentialDownloader(e.info, this.httpExecutor, a).download(
            c[0],
            c[1],
          ),
          !1
        );
      } catch (e) {
        if (
          (this._logger.error(
            `Cannot download differentially, fallback to full download: ${e.stack || e}`,
          ),
          null != this._testOnlyOptions)
        )
          throw e;
        return !0;
      }
    }
  }
  t.AppUpdater = x;
  class E {
    info(e) {}
    warn(e) {}
    error(e) {}
  }
  t.NoOpLogger = E;
};

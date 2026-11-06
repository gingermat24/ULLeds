module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.MacUpdater = void 0));
  const n = r(23108),
    i = r(45768),
    o = r(79896),
    s = r(16928),
    a = r(58611),
    c = r(75807),
    l = r(29721),
    u = r(35317),
    p = r(76982);
  class d extends c.AppUpdater {
    constructor(e, t) {
      (super(e, t),
        (this.nativeUpdater = r(84157).autoUpdater),
        (this.squirrelDownloadedUpdate = !1),
        this.nativeUpdater.on("error", (e) => {
          (this._logger.warn(e), this.emit("error", e));
        }),
        this.nativeUpdater.on("update-downloaded", () => {
          ((this.squirrelDownloadedUpdate = !0), this.debug("nativeUpdater.update-downloaded"));
        }));
    }
    debug(e) {
      null != this._logger.debug && this._logger.debug(e);
    }
    closeServerIfExists() {
      this.server &&
        (this.debug("Closing proxy server"),
        this.server.close((e) => {
          e &&
            this.debug(
              "proxy server wasn't already open, probably attempted closing again as a safety check before quit",
            );
        }));
    }
    async doDownloadUpdate(e) {
      let t = e.updateInfoAndProvider.provider.resolveFiles(e.updateInfoAndProvider.info);
      const r = this._logger,
        a = "sysctl.proc_translated";
      let c = !1;
      try {
        (this.debug("Checking for macOS Rosetta environment"),
          (c = (0, u.execFileSync)("sysctl", [a], { encoding: "utf8" }).includes(`${a}: 1`)),
          r.info(`Checked for macOS Rosetta environment (isRosetta=${c})`));
      } catch (e) {
        r.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${e}`);
      }
      let p = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const e = (0, u.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        (r.info(`Checked 'uname -a': arm64=${e}`), (p = p || e));
      } catch (e) {
        r.warn(`uname shell command to check for arm64 failed: ${e}`);
      }
      p = p || "arm64" === process.arch || c;
      const d = (e) => {
        var t;
        return (
          e.url.pathname.includes("arm64") ||
          (null === (t = e.info.url) || void 0 === t ? void 0 : t.includes("arm64"))
        );
      };
      t = p && t.some(d) ? t.filter((e) => p === d(e)) : t.filter((e) => !d(e));
      const f = (0, l.findFile)(t, "zip", ["pkg", "dmg"]);
      if (null == f)
        throw (0, n.newError)(
          `ZIP file not provided: ${(0, n.safeStringifyJson)(t)}`,
          "ERR_UPDATER_ZIP_FILE_NOT_FOUND",
        );
      const h = e.updateInfoAndProvider.provider,
        m = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: f,
        downloadUpdateOptions: e,
        task: async (t, n) => {
          const o = s.join(this.downloadedUpdateHelper.cacheDir, m);
          let a = !0;
          (((0, i.pathExistsSync)(o)
            ? !e.disableDifferentialDownload
            : (r.info(
                "Unable to locate previous update.zip for differential download (is this first install?), falling back to full download",
              ),
              0)) && (a = await this.differentialDownloadInstaller(f, e, t, h, m)),
            a && (await this.httpExecutor.download(f.url, t, n)));
        },
        done: (t) => {
          if (!e.disableDifferentialDownload)
            try {
              const e = s.join(this.downloadedUpdateHelper.cacheDir, m);
              (0, o.copyFileSync)(t.downloadedFile, e);
            } catch (e) {
              this._logger.warn(
                `Unable to copy file for caching for future differential downloads: ${e.message}`,
              );
            }
          return this.updateDownloaded(f, t);
        },
      });
    }
    async updateDownloaded(e, t) {
      var r;
      const n = t.downloadedFile,
        s = null !== (r = e.info.size) && void 0 !== r ? r : (await (0, i.stat)(n)).size,
        c = this._logger,
        l = `fileToProxy=${e.url.href}`;
      (this.closeServerIfExists(),
        this.debug(`Creating proxy server for native Squirrel.Mac (${l})`),
        (this.server = (0, a.createServer)()),
        this.debug(`Proxy server for native Squirrel.Mac is created (${l})`),
        this.server.on("close", () => {
          c.info(`Proxy server for native Squirrel.Mac is closed (${l})`);
        }));
      const u = (e) => {
        const t = e.address();
        return "string" == typeof t ? t : `http://127.0.0.1:${null == t ? void 0 : t.port}`;
      };
      return await new Promise((e, r) => {
        const i = (0, p.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"),
          a = Buffer.from(`autoupdater:${i}`, "ascii"),
          d = `/${(0, p.randomBytes)(64).toString("hex")}.zip`;
        (this.server.on("request", (t, a) => {
          const l = t.url;
          if ((c.info(`${l} requested`), "/" === l)) {
            if (!t.headers.authorization || -1 === t.headers.authorization.indexOf("Basic "))
              return (
                (a.statusCode = 401),
                (a.statusMessage = "Invalid Authentication Credentials"),
                a.end(),
                void c.warn("No authenthication info")
              );
            const e = t.headers.authorization.split(" ")[1],
              r = Buffer.from(e, "base64").toString("ascii"),
              [n, o] = r.split(":");
            if ("autoupdater" !== n || o !== i)
              return (
                (a.statusCode = 401),
                (a.statusMessage = "Invalid Authentication Credentials"),
                a.end(),
                void c.warn("Invalid authenthication credentials")
              );
            const s = Buffer.from(`{ "url": "${u(this.server)}${d}" }`);
            return (
              a.writeHead(200, { "Content-Type": "application/json", "Content-Length": s.length }),
              void a.end(s)
            );
          }
          if (!l.startsWith(d))
            return (c.warn(`${l} requested, but not supported`), a.writeHead(404), void a.end());
          c.info(`${d} requested by Squirrel.Mac, pipe ${n}`);
          let p = !1;
          a.on("finish", () => {
            p || (this.nativeUpdater.removeListener("error", r), e([]));
          });
          const f = (0, o.createReadStream)(n);
          (f.on("error", (e) => {
            try {
              a.end();
            } catch (e) {
              c.warn(`cannot end response: ${e}`);
            }
            ((p = !0),
              this.nativeUpdater.removeListener("error", r),
              r(new Error(`Cannot pipe "${n}": ${e}`)));
          }),
            a.writeHead(200, { "Content-Type": "application/zip", "Content-Length": s }),
            f.pipe(a));
        }),
          this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${l})`),
          this.server.listen(0, "127.0.0.1", () => {
            (this.debug(
              `Proxy server for native Squirrel.Mac is listening (address=${u(this.server)}, ${l})`,
            ),
              this.nativeUpdater.setFeedURL({
                url: u(this.server),
                headers: {
                  "Cache-Control": "no-cache",
                  Authorization: `Basic ${a.toString("base64")}`,
                },
              }),
              this.dispatchUpdateDownloaded(t),
              this.autoInstallOnAppQuit
                ? (this.nativeUpdater.once("error", r), this.nativeUpdater.checkForUpdates())
                : e([]));
          }));
      });
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate
        ? (this.nativeUpdater.quitAndInstall(), this.closeServerIfExists())
        : (this.nativeUpdater.on("update-downloaded", () => {
            (this.nativeUpdater.quitAndInstall(), this.closeServerIfExists());
          }),
          this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  }
  t.MacUpdater = d;
};

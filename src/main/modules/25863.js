module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.DownloadedUpdateHelper = void 0),
    (t.createTempUpdateFile = async function (e, t, r) {
      let n = 0,
        i = a.join(t, e);
      for (let o = 0; o < 3; o++)
        try {
          return (await (0, s.unlink)(i), i);
        } catch (o) {
          if ("ENOENT" === o.code) return i;
          (r.warn(`Error on remove temp update file: ${o}`), (i = a.join(t, `${n++}-${e}`)));
        }
      return i;
    }));
  const n = r(76982),
    i = r(79896),
    o = r(75965),
    s = r(45768),
    a = r(16928);
  t.DownloadedUpdateHelper = class {
    constructor(e) {
      ((this.cacheDir = e),
        (this._file = null),
        (this._packageFile = null),
        (this.versionInfo = null),
        (this.fileInfo = null),
        (this._downloadedFileInfo = null));
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return a.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(e, t, r, n) {
      if (null != this.versionInfo && this.file === e && null != this.fileInfo)
        return o(this.versionInfo, t) &&
          o(this.fileInfo.info, r.info) &&
          (await (0, s.pathExists)(e))
          ? e
          : null;
      const i = await this.getValidCachedUpdateFile(r, n);
      return null === i
        ? null
        : (n.info(`Update has already been downloaded to ${e}).`), (this._file = i), i);
    }
    async setDownloadedFile(e, t, r, n, i, o) {
      ((this._file = e),
        (this._packageFile = t),
        (this.versionInfo = r),
        (this.fileInfo = n),
        (this._downloadedFileInfo = {
          fileName: i,
          sha512: n.info.sha512,
          isAdminRightsRequired: !0 === n.info.isAdminRightsRequired,
        }),
        o && (await (0, s.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo)));
    }
    async clear() {
      ((this._file = null),
        (this._packageFile = null),
        (this.versionInfo = null),
        (this.fileInfo = null),
        await this.cleanCacheDirForPendingUpdate());
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, s.emptyDir)(this.cacheDirForPendingUpdate);
      } catch (e) {}
    }
    async getValidCachedUpdateFile(e, t) {
      const r = this.getUpdateInfoFile();
      if (!(await (0, s.pathExists)(r))) return null;
      let o;
      try {
        o = await (0, s.readJson)(r);
      } catch (e) {
        let r = "No cached update info available";
        return (
          "ENOENT" !== e.code &&
            (await this.cleanCacheDirForPendingUpdate(), (r += ` (error on read: ${e.message})`)),
          t.info(r),
          null
        );
      }
      if (null === (null == o ? void 0 : o.fileName))
        return (
          t.warn(
            "Cached update info is corrupted: no fileName, directory for cached update will be cleaned",
          ),
          await this.cleanCacheDirForPendingUpdate(),
          null
        );
      if (e.info.sha512 !== o.sha512)
        return (
          t.info(
            `Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${e.info.sha512}. Directory for cached update will be cleaned`,
          ),
          await this.cleanCacheDirForPendingUpdate(),
          null
        );
      const c = a.join(this.cacheDirForPendingUpdate, o.fileName);
      if (!(await (0, s.pathExists)(c))) return (t.info("Cached update file doesn't exist"), null);
      const l = await (function (e, t = "sha512", r = "base64", o) {
        return new Promise((s, a) => {
          const c = (0, n.createHash)(t);
          (c.on("error", a).setEncoding(r),
            (0, i.createReadStream)(e, { ...o, highWaterMark: 1048576 })
              .on("error", a)
              .on("end", () => {
                (c.end(), s(c.read()));
              })
              .pipe(c, { end: !1 }));
        });
      })(c);
      return e.info.sha512 !== l
        ? (t.warn(
            `Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${e.info.sha512}`,
          ),
          await this.cleanCacheDirForPendingUpdate(),
          null)
        : ((this._downloadedFileInfo = o), c);
    }
    getUpdateInfoFile() {
      return a.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
};

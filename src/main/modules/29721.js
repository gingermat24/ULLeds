module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.Provider = void 0),
    (t.findFile = function (e, t, r) {
      if (0 === e.length)
        throw (0, n.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
      const i = e.find((e) => e.url.pathname.toLowerCase().endsWith(`.${t}`));
      return null != i
        ? i
        : null == r
          ? e[0]
          : e.find((e) => !r.some((t) => e.url.pathname.toLowerCase().endsWith(`.${t}`)));
    }),
    (t.parseUpdateInfo = function (e, t, r) {
      if (null == e)
        throw (0, n.newError)(
          `Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`,
          "ERR_UPDATER_INVALID_UPDATE_INFO",
        );
      let o;
      try {
        o = (0, i.load)(e);
      } catch (i) {
        throw (0, n.newError)(
          `Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`,
          "ERR_UPDATER_INVALID_UPDATE_INFO",
        );
      }
      return o;
    }),
    (t.getFileList = s),
    (t.resolveFiles = function (e, t, r = (e) => e) {
      const i = s(e).map((e) => {
          if (null == e.sha2 && null == e.sha512)
            throw (0, n.newError)(
              `Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, n.safeStringifyJson)(e)}`,
              "ERR_UPDATER_NO_CHECKSUM",
            );
          return { url: (0, o.newUrlFromBase)(r(e.url), t), info: e };
        }),
        a = e.packages,
        c = null == a ? null : a[process.arch] || a.ia32;
      return (
        null != c && (i[0].packageInfo = { ...c, path: (0, o.newUrlFromBase)(r(c.path), t).href }),
        i
      );
    }));
  const n = r(23108),
    i = r(81827),
    o = r(74451);
  function s(e) {
    const t = e.files;
    if (null != t && t.length > 0) return t;
    if (null != e.path) return [{ url: e.path, sha2: e.sha2, sha512: e.sha512 }];
    throw (0, n.newError)(
      `No files provided: ${(0, n.safeStringifyJson)(e)}`,
      "ERR_UPDATER_NO_FILES_PROVIDED",
    );
  }
  t.Provider = class {
    constructor(e) {
      ((this.runtimeOptions = e), (this.requestHeaders = null), (this.executor = e.executor));
    }
    get isUseMultipleRangeRequest() {
      return !1 !== this.runtimeOptions.isUseMultipleRangeRequest;
    }
    getChannelFilePrefix() {
      if ("linux" === this.runtimeOptions.platform) {
        const e = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + ("x64" === e ? "" : `-${e}`);
      }
      return "darwin" === this.runtimeOptions.platform ? "-mac" : "";
    }
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(e) {
      return `${e}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(e) {
      this.requestHeaders = e;
    }
    httpRequest(e, t, r) {
      return this.executor.request(this.createRequestOptions(e, t), r);
    }
    createRequestOptions(e, t) {
      const r = {};
      return (
        null == this.requestHeaders
          ? null != t && (r.headers = t)
          : (r.headers = null == t ? this.requestHeaders : { ...this.requestHeaders, ...t }),
        (0, n.configureRequestUrl)(e, r),
        r
      );
    }
  };
};

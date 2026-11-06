module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.PrivateGitHubProvider = void 0));
  const n = r(23108),
    i = r(81827),
    o = r(16928),
    s = r(87016),
    a = r(74451),
    c = r(33370),
    l = r(29721);
  class u extends c.BaseGitHubProvider {
    constructor(e, t, r, n) {
      (super(e, "api.github.com", n), (this.updater = t), (this.token = r));
    }
    createRequestOptions(e, t) {
      const r = super.createRequestOptions(e, t);
      return ((r.redirect = "manual"), r);
    }
    async getLatestVersion() {
      const e = new n.CancellationToken(),
        t = (0, a.getChannelFilename)(this.getDefaultChannelName()),
        r = await this.getLatestVersionInfo(e),
        o = r.assets.find((e) => e.name === t);
      if (null == o)
        throw (0, n.newError)(
          `Cannot find ${t} in the release ${r.html_url || r.name}`,
          "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND",
        );
      const c = new s.URL(o.url);
      let l;
      try {
        l = (0, i.load)(
          await this.httpRequest(c, this.configureHeaders("application/octet-stream"), e),
        );
      } catch (e) {
        if (e instanceof n.HttpError && 404 === e.statusCode)
          throw (0, n.newError)(
            `Cannot find ${t} in the latest release artifacts (${c}): ${e.stack || e.message}`,
            "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND",
          );
        throw e;
      }
      return ((l.assets = r.assets), l);
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(e) {
      return { accept: e, authorization: `token ${this.token}` };
    }
    async getLatestVersionInfo(e) {
      const t = this.updater.allowPrerelease;
      let r = this.basePath;
      t || (r = `${r}/latest`);
      const i = (0, a.newUrlFromBase)(r, this.baseUrl);
      try {
        const r = JSON.parse(
          await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), e),
        );
        return t ? r.find((e) => e.prerelease) || r[0] : r;
      } catch (e) {
        throw (0, n.newError)(
          `Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${e.stack || e.message}`,
          "ERR_UPDATER_LATEST_VERSION_NOT_FOUND",
        );
      }
    }
    get basePath() {
      return this.computeGithubBasePath(
        `/repos/${this.options.owner}/${this.options.repo}/releases`,
      );
    }
    resolveFiles(e) {
      return (0, l.getFileList)(e).map((t) => {
        const r = o.posix.basename(t.url).replace(/ /g, "-"),
          i = e.assets.find((e) => null != e && e.name === r);
        if (null == i)
          throw (0, n.newError)(
            `Cannot find asset "${r}" in: ${JSON.stringify(e.assets, null, 2)}`,
            "ERR_UPDATER_ASSET_NOT_FOUND",
          );
        return { url: new s.URL(i.url), info: t };
      });
    }
  }
  t.PrivateGitHubProvider = u;
};

module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.GitHubProvider = t.BaseGitHubProvider = void 0),
    (t.computeReleaseNotes = p));
  const n = r(23108),
    i = r(63752),
    o = r(87016),
    s = r(74451),
    a = r(29721),
    c = /\/tag\/([^/]+)$/;
  class l extends a.Provider {
    constructor(e, t, r) {
      (super({ ...r, isUseMultipleRangeRequest: !1 }),
        (this.options = e),
        (this.baseUrl = (0, s.newBaseUrl)((0, n.githubUrl)(e, t))));
      const i = "github.com" === t ? "api.github.com" : t;
      this.baseApiUrl = (0, s.newBaseUrl)((0, n.githubUrl)(e, i));
    }
    computeGithubBasePath(e) {
      const t = this.options.host;
      return t && !["github.com", "api.github.com"].includes(t) ? `/api/v3${e}` : e;
    }
  }
  function u(e) {
    const t = e.elementValueOrEmpty("content");
    return "No content." === t ? "" : t;
  }
  function p(e, t, r, n) {
    if (!t) return u(n);
    const o = [];
    for (const t of r.getElements("entry")) {
      const r = /\/tag\/v?([^/]+)$/.exec(t.element("link").attribute("href"))[1];
      i.lt(e, r) && o.push({ version: r, note: u(t) });
    }
    return o.sort((e, t) => i.rcompare(e.version, t.version));
  }
  ((t.BaseGitHubProvider = l),
    (t.GitHubProvider = class extends l {
      constructor(e, t, r) {
        (super(e, "github.com", r), (this.options = e), (this.updater = t));
      }
      get channel() {
        const e = this.updater.channel || this.options.channel;
        return null == e ? this.getDefaultChannelName() : this.getCustomChannelName(e);
      }
      async getLatestVersion() {
        var e, t, r, o, l;
        const u = new n.CancellationToken(),
          d = await this.httpRequest(
            (0, s.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl),
            { accept: "application/xml, application/atom+xml, text/xml, */*" },
            u,
          ),
          f = (0, n.parseXml)(d);
        let h,
          m = f.element("entry", !1, "No published versions on GitHub"),
          g = null;
        try {
          if (this.updater.allowPrerelease) {
            const n =
              (null === (e = this.updater) || void 0 === e ? void 0 : e.channel) ||
              (null === (t = i.prerelease(this.updater.currentVersion)) || void 0 === t
                ? void 0
                : t[0]) ||
              null;
            if (null === n) g = c.exec(m.element("link").attribute("href"))[1];
            else
              for (const e of f.getElements("entry")) {
                const t = c.exec(e.element("link").attribute("href"));
                if (null === t) continue;
                const o = t[1],
                  s = (null === (r = i.prerelease(o)) || void 0 === r ? void 0 : r[0]) || null,
                  a = !n || ["alpha", "beta"].includes(n),
                  l = null !== s && !["alpha", "beta"].includes(String(s));
                if (a && !l && ("beta" !== n || "alpha" !== s)) {
                  g = o;
                  break;
                }
                if (s && s === n) {
                  g = o;
                  break;
                }
              }
          } else {
            g = await this.getLatestTagName(u);
            for (const e of f.getElements("entry"))
              if (c.exec(e.element("link").attribute("href"))[1] === g) {
                m = e;
                break;
              }
          }
        } catch (e) {
          throw (0, n.newError)(
            `Cannot parse releases feed: ${e.stack || e.message},\nXML:\n${d}`,
            "ERR_UPDATER_INVALID_RELEASE_FEED",
          );
        }
        if (null == g)
          throw (0, n.newError)(
            "No published versions on GitHub",
            "ERR_UPDATER_NO_PUBLISHED_VERSIONS",
          );
        let v = "",
          y = "";
        const w = async (e) => {
          ((v = (0, s.getChannelFilename)(e)),
            (y = (0, s.newUrlFromBase)(this.getBaseDownloadPath(String(g), v), this.baseUrl)));
          const t = this.createRequestOptions(y);
          try {
            return await this.executor.request(t, u);
          } catch (e) {
            if (e instanceof n.HttpError && 404 === e.statusCode)
              throw (0, n.newError)(
                `Cannot find ${v} in the latest release artifacts (${y}): ${e.stack || e.message}`,
                "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND",
              );
            throw e;
          }
        };
        try {
          let e = this.channel;
          (this.updater.allowPrerelease &&
            (null === (o = i.prerelease(g)) || void 0 === o ? void 0 : o[0]) &&
            (e = this.getCustomChannelName(
              String(null === (l = i.prerelease(g)) || void 0 === l ? void 0 : l[0]),
            )),
            (h = await w(e)));
        } catch (e) {
          if (!this.updater.allowPrerelease) throw e;
          h = await w(this.getDefaultChannelName());
        }
        const b = (0, a.parseUpdateInfo)(h, v, y);
        return (
          null == b.releaseName && (b.releaseName = m.elementValueOrEmpty("title")),
          null == b.releaseNotes &&
            (b.releaseNotes = p(this.updater.currentVersion, this.updater.fullChangelog, f, m)),
          { tag: g, ...b }
        );
      }
      async getLatestTagName(e) {
        const t = this.options,
          r =
            null == t.host || "github.com" === t.host
              ? (0, s.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl)
              : new o.URL(
                  `${this.computeGithubBasePath(`/repos/${t.owner}/${t.repo}/releases`)}/latest`,
                  this.baseApiUrl,
                );
        try {
          const t = await this.httpRequest(r, { Accept: "application/json" }, e);
          return null == t ? null : JSON.parse(t).tag_name;
        } catch (e) {
          throw (0, n.newError)(
            `Unable to find latest version on GitHub (${r}), please ensure a production release exists: ${e.stack || e.message}`,
            "ERR_UPDATER_LATEST_VERSION_NOT_FOUND",
          );
        }
      }
      get basePath() {
        return `/${this.options.owner}/${this.options.repo}/releases`;
      }
      resolveFiles(e) {
        return (0, a.resolveFiles)(e, this.baseUrl, (t) =>
          this.getBaseDownloadPath(e.tag, t.replace(/ /g, "-")),
        );
      }
      getBaseDownloadPath(e, t) {
        return `${this.basePath}/download/${e}/${t}`;
      }
    }));
};

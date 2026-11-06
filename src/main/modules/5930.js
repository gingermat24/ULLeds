module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.BitbucketProvider = void 0));
  const n = r(23108),
    i = r(74451),
    o = r(29721);
  class s extends o.Provider {
    constructor(e, t, r) {
      (super({ ...r, isUseMultipleRangeRequest: !1 }),
        (this.configuration = e),
        (this.updater = t));
      const { owner: n, slug: o } = e;
      this.baseUrl = (0, i.newBaseUrl)(
        `https://api.bitbucket.org/2.0/repositories/${n}/${o}/downloads`,
      );
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const e = new n.CancellationToken(),
        t = (0, i.getChannelFilename)(this.getCustomChannelName(this.channel)),
        r = (0, i.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const n = await this.httpRequest(r, void 0, e);
        return (0, o.parseUpdateInfo)(n, t, r);
      } catch (e) {
        throw (0, n.newError)(
          `Unable to find latest version on ${this.toString()}, please ensure release exists: ${e.stack || e.message}`,
          "ERR_UPDATER_LATEST_VERSION_NOT_FOUND",
        );
      }
    }
    resolveFiles(e) {
      return (0, o.resolveFiles)(e, this.baseUrl);
    }
    toString() {
      const { owner: e, slug: t } = this.configuration;
      return `Bitbucket (owner: ${e}, slug: ${t}, channel: ${this.channel})`;
    }
  }
  t.BitbucketProvider = s;
};

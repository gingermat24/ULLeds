module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.KeygenProvider = void 0));
  const n = r(23108),
    i = r(74451),
    o = r(29721);
  class s extends o.Provider {
    constructor(e, t, r) {
      (super({ ...r, isUseMultipleRangeRequest: !1 }),
        (this.configuration = e),
        (this.updater = t),
        (this.baseUrl = (0, i.newBaseUrl)(
          `https://api.keygen.sh/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`,
        )));
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const e = new n.CancellationToken(),
        t = (0, i.getChannelFilename)(this.getCustomChannelName(this.channel)),
        r = (0, i.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const n = await this.httpRequest(
          r,
          { Accept: "application/vnd.api+json", "Keygen-Version": "1.1" },
          e,
        );
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
      const { account: e, product: t, platform: r } = this.configuration;
      return `Keygen (account: ${e}, product: ${t}, platform: ${r}, channel: ${this.channel})`;
    }
  }
  t.KeygenProvider = s;
};

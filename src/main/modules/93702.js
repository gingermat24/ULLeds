module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.GenericProvider = void 0));
  const n = r(23108),
    i = r(74451),
    o = r(29721);
  class s extends o.Provider {
    constructor(e, t, r) {
      (super(r),
        (this.configuration = e),
        (this.updater = t),
        (this.baseUrl = (0, i.newBaseUrl)(this.configuration.url)));
    }
    get channel() {
      const e = this.updater.channel || this.configuration.channel;
      return null == e ? this.getDefaultChannelName() : this.getCustomChannelName(e);
    }
    async getLatestVersion() {
      const e = (0, i.getChannelFilename)(this.channel),
        t = (0, i.newUrlFromBase)(e, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let r = 0; ; r++)
        try {
          return (0, o.parseUpdateInfo)(await this.httpRequest(t), e, t);
        } catch (t) {
          if (t instanceof n.HttpError && 404 === t.statusCode)
            throw (0, n.newError)(
              `Cannot find channel "${e}" update info: ${t.stack || t.message}`,
              "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND",
            );
          if ("ECONNREFUSED" === t.code && r < 3) {
            await new Promise((e, t) => {
              try {
                setTimeout(e, 1e3 * r);
              } catch (e) {
                t(e);
              }
            });
            continue;
          }
          throw t;
        }
    }
    resolveFiles(e) {
      return (0, o.resolveFiles)(e, this.baseUrl);
    }
  }
  t.GenericProvider = s;
};

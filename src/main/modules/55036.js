module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.ElectronHttpExecutor = t.NET_SESSION_NAME = void 0),
    (t.getNetSession = i));
  const n = r(23108);
  function i() {
    return r(84157).session.fromPartition(t.NET_SESSION_NAME, { cache: !1 });
  }
  t.NET_SESSION_NAME = "electron-updater";
  class o extends n.HttpExecutor {
    constructor(e) {
      (super(), (this.proxyLoginCallback = e), (this.cachedSession = null));
    }
    async download(e, t, r) {
      return await r.cancellationToken.createPromise((i, o, s) => {
        const a = { headers: r.headers || void 0, redirect: "manual" };
        ((0, n.configureRequestUrl)(e, a),
          (0, n.configureRequestOptions)(a),
          this.doDownload(
            a,
            {
              destination: t,
              options: r,
              onCancel: s,
              callback: (e) => {
                null == e ? i(t) : o(e);
              },
              responseHandler: null,
            },
            0,
          ));
      });
    }
    createRequest(e, t) {
      (e.headers && e.headers.Host && ((e.host = e.headers.Host), delete e.headers.Host),
        null == this.cachedSession && (this.cachedSession = i()));
      const n = r(84157).net.request({ ...e, session: this.cachedSession });
      return (
        n.on("response", t),
        null != this.proxyLoginCallback && n.on("login", this.proxyLoginCallback),
        n
      );
    }
    addRedirectHandlers(e, t, r, i, o) {
      e.on("redirect", (s, a, c) => {
        (e.abort(),
          i > this.maxRedirects
            ? r(this.createMaxRedirectError())
            : o(n.HttpExecutor.prepareRedirectUrlOptions(c, t)));
      });
    }
  }
  t.ElectronHttpExecutor = o;
};

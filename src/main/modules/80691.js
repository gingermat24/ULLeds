module.exports = (e) => {
  "use strict";
  e.exports = class {
    disposers = [];
    format = "{eventSource}#{eventName}:";
    formatters = {
      app: {
        "certificate-error": ({ args: e }) =>
          this.arrayToObject(e.slice(1, 4), ["url", "error", "certificate"]),
        "child-process-gone": ({ args: e }) => (1 === e.length ? e[0] : e),
        "render-process-gone": ({ args: [e, t] }) =>
          t && "object" == typeof t ? { ...t, ...this.getWebContentsDetails(e) } : [],
      },
      webContents: {
        "console-message": ({ args: [e, t, r, n] }) => {
          if (!(e < 3)) return { message: t, source: `${n}:${r}` };
        },
        "did-fail-load": ({ args: e }) =>
          this.arrayToObject(e, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId",
          ]),
        "did-fail-provisional-load": ({ args: e }) =>
          this.arrayToObject(e, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId",
          ]),
        "plugin-crashed": ({ args: e }) => this.arrayToObject(e, ["name", "version"]),
        "preload-error": ({ args: e }) => this.arrayToObject(e, ["preloadPath", "error"]),
      },
    };
    events = {
      app: { "certificate-error": !0, "child-process-gone": !0, "render-process-gone": !0 },
      webContents: {
        "did-fail-load": !0,
        "did-fail-provisional-load": !0,
        "plugin-crashed": !0,
        "preload-error": !0,
        unresponsive: !0,
      },
    };
    externalApi = void 0;
    level = "error";
    scope = "";
    constructor(e = {}) {
      this.setOptions(e);
    }
    setOptions({
      events: e,
      externalApi: t,
      level: r,
      logger: n,
      format: i,
      formatters: o,
      scope: s,
    }) {
      ("object" == typeof e && (this.events = e),
        "object" == typeof t && (this.externalApi = t),
        "string" == typeof r && (this.level = r),
        "object" == typeof n && (this.logger = n),
        ("string" != typeof i && "function" != typeof i) || (this.format = i),
        "object" == typeof o && (this.formatters = o),
        "string" == typeof s && (this.scope = s));
    }
    startLogging(e = {}) {
      (this.setOptions(e), this.disposeListeners());
      for (const e of this.getEventNames(this.events.app))
        this.disposers.push(
          this.externalApi.onAppEvent(e, (...t) => {
            this.handleEvent({ eventSource: "app", eventName: e, handlerArgs: t });
          }),
        );
      for (const e of this.getEventNames(this.events.webContents))
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(e, (...t) => {
            this.handleEvent({ eventSource: "webContents", eventName: e, handlerArgs: t });
          }),
        );
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(e, t) {
      const r = {};
      return (
        t.forEach((t, n) => {
          r[t] = e[n];
        }),
        e.length > t.length && (r.unknownArgs = e.slice(t.length)),
        r
      );
    }
    disposeListeners() {
      (this.disposers.forEach((e) => e()), (this.disposers = []));
    }
    formatEventLog({ eventName: e, eventSource: t, handlerArgs: r }) {
      const [n, ...i] = r;
      if ("function" == typeof this.format)
        return this.format({ args: i, event: n, eventName: e, eventSource: t });
      const o = this.formatters[t]?.[e];
      let s = i;
      if (
        ("function" == typeof o && (s = o({ args: i, event: n, eventName: e, eventSource: t })), !s)
      )
        return;
      const a = {};
      return (
        Array.isArray(s) ? (a.args = s) : "object" == typeof s && Object.assign(a, s),
        "webContents" === t && Object.assign(a, this.getWebContentsDetails(n?.sender)),
        [
          this.format
            .replace("{eventSource}", "app" === t ? "App" : "WebContents")
            .replace("{eventName}", e),
          a,
        ]
      );
    }
    getEventNames(e) {
      return e && "object" == typeof e
        ? Object.entries(e)
            .filter(([e, t]) => t)
            .map(([e]) => e)
        : [];
    }
    getWebContentsDetails(e) {
      if (!e?.loadURL) return {};
      try {
        return { webContents: { id: e.id, url: e.getURL() } };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName: e, eventSource: t, handlerArgs: r }) {
      const n = this.formatEventLog({ eventName: e, eventSource: t, handlerArgs: r });
      if (n) {
        const e = this.scope ? this.logger.scope(this.scope) : this.logger;
        e?.[this.level]?.(...n);
      }
    }
  };
};

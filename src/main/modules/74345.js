module.exports = (e) => {
  "use strict";
  e.exports = class {
    externalApi = void 0;
    isActive = !1;
    logFn = void 0;
    onError = void 0;
    showDialog = !0;
    constructor({ externalApi: e, logFn: t, onError: r, showDialog: n } = {}) {
      ((this.createIssue = this.createIssue.bind(this)),
        (this.handleError = this.handleError.bind(this)),
        (this.handleRejection = this.handleRejection.bind(this)),
        this.setOptions({ externalApi: e, logFn: t, onError: r, showDialog: n }),
        (this.startCatching = this.startCatching.bind(this)),
        (this.stopCatching = this.stopCatching.bind(this)));
    }
    handle(
      e,
      {
        logFn: t = this.logFn,
        onError: r = this.onError,
        processType: n = "browser",
        showDialog: i = this.showDialog,
        errorName: o = "",
      } = {},
    ) {
      e = (function (e) {
        if (e instanceof Error) return e;
        if (e && "object" == typeof e) {
          if (e.message) return Object.assign(new Error(e.message), e);
          try {
            return new Error(JSON.stringify(e));
          } catch (t) {
            return new Error(`Couldn't normalize error ${String(e)}: ${t}`);
          }
        }
        return new Error(`Can't normalize error ${String(e)}`);
      })(e);
      try {
        if ("function" == typeof r) {
          const t = this.externalApi?.getVersions() || {};
          if (
            !1 ===
            r({
              createIssue: this.createIssue,
              error: e,
              errorName: o,
              processType: n,
              versions: t,
            })
          )
            return;
        }
        (o ? t(o, e) : t(e),
          i &&
            !o.includes("rejection") &&
            this.externalApi &&
            this.externalApi.showErrorBox(
              `A JavaScript error occurred in the ${n} process`,
              e.stack,
            ));
      } catch {
        console.error(e);
      }
    }
    setOptions({ externalApi: e, logFn: t, onError: r, showDialog: n }) {
      ("object" == typeof e && (this.externalApi = e),
        "function" == typeof t && (this.logFn = t),
        "function" == typeof r && (this.onError = r),
        "boolean" == typeof n && (this.showDialog = n));
    }
    startCatching({ onError: e, showDialog: t } = {}) {
      this.isActive ||
        ((this.isActive = !0),
        this.setOptions({ onError: e, showDialog: t }),
        process.on("uncaughtException", this.handleError),
        process.on("unhandledRejection", this.handleRejection));
    }
    stopCatching() {
      ((this.isActive = !1),
        process.removeListener("uncaughtException", this.handleError),
        process.removeListener("unhandledRejection", this.handleRejection));
    }
    createIssue(e, t) {
      this.externalApi?.openUrl(`${e}?${new URLSearchParams(t).toString()}`);
    }
    handleError(e) {
      this.handle(e, { errorName: "Unhandled" });
    }
    handleRejection(e) {
      const t = e instanceof Error ? e : new Error(JSON.stringify(e));
      this.handle(t, { errorName: "Unhandled rejection" });
    }
  };
};

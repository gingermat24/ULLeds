module.exports = (e) => {
  "use strict";
  const t = console.error;
  e.exports = class {
    logFn = null;
    onError = null;
    showDialog = !1;
    preventDefault = !0;
    constructor({ logFn: e = null } = {}) {
      ((this.handleError = this.handleError.bind(this)),
        (this.handleRejection = this.handleRejection.bind(this)),
        (this.startCatching = this.startCatching.bind(this)),
        (this.logFn = e));
    }
    handle(
      e,
      {
        logFn: n = this.logFn,
        errorName: r = "",
        onError: o = this.onError,
        showDialog: i = this.showDialog,
      } = {},
    ) {
      try {
        !1 !== o?.({ error: e, errorName: r, processType: "renderer" }) &&
          n({ error: e, errorName: r, showDialog: i });
      } catch {
        t(e);
      }
    }
    setOptions({ logFn: e, onError: t, preventDefault: n, showDialog: r }) {
      ("function" == typeof e && (this.logFn = e),
        "function" == typeof t && (this.onError = t),
        "boolean" == typeof n && (this.preventDefault = n),
        "boolean" == typeof r && (this.showDialog = r));
    }
    startCatching({ onError: e, showDialog: t } = {}) {
      this.isActive ||
        ((this.isActive = !0),
        this.setOptions({ onError: e, showDialog: t }),
        window.addEventListener("error", (e) => {
          (this.preventDefault && e.preventDefault?.(), this.handleError(e.error || e));
        }),
        window.addEventListener("unhandledrejection", (e) => {
          (this.preventDefault && e.preventDefault?.(), this.handleRejection(e.reason || e));
        }));
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

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
        logFn: r = this.logFn,
        errorName: n = "",
        onError: i = this.onError,
        showDialog: o = this.showDialog,
      } = {},
    ) {
      try {
        !1 !== i?.({ error: e, errorName: n, processType: "renderer" }) &&
          r({ error: e, errorName: n, showDialog: o });
      } catch {
        t(e);
      }
    }
    setOptions({ logFn: e, onError: t, preventDefault: r, showDialog: n }) {
      ("function" == typeof e && (this.logFn = e),
        "function" == typeof t && (this.onError = t),
        "boolean" == typeof r && (this.preventDefault = r),
        "boolean" == typeof n && (this.showDialog = n));
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

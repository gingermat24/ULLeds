module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.CancellationError = t.CancellationToken = void 0));
  const n = r(24434);
  class i extends n.EventEmitter {
    get cancelled() {
      return this._cancelled || (null != this._parent && this._parent.cancelled);
    }
    set parent(e) {
      (this.removeParentCancelHandler(),
        (this._parent = e),
        (this.parentCancelHandler = () => this.cancel()),
        this._parent.onCancel(this.parentCancelHandler));
    }
    constructor(e) {
      (super(),
        (this.parentCancelHandler = null),
        (this._parent = null),
        (this._cancelled = !1),
        null != e && (this.parent = e));
    }
    cancel() {
      ((this._cancelled = !0), this.emit("cancel"));
    }
    onCancel(e) {
      this.cancelled ? e() : this.once("cancel", e);
    }
    createPromise(e) {
      if (this.cancelled) return Promise.reject(new o());
      const t = () => {
        if (null != r)
          try {
            (this.removeListener("cancel", r), (r = null));
          } catch (e) {}
      };
      let r = null;
      return new Promise((t, n) => {
        let i = null;
        ((r = () => {
          try {
            null != i && (i(), (i = null));
          } finally {
            n(new o());
          }
        }),
          this.cancelled
            ? r()
            : (this.onCancel(r),
              e(t, n, (e) => {
                i = e;
              })));
      })
        .then((e) => (t(), e))
        .catch((e) => {
          throw (t(), e);
        });
    }
    removeParentCancelHandler() {
      const e = this._parent;
      null != e &&
        null != this.parentCancelHandler &&
        (e.removeListener("cancel", this.parentCancelHandler), (this.parentCancelHandler = null));
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        (this.removeAllListeners(), (this._parent = null));
      }
    }
  }
  t.CancellationToken = i;
  class o extends Error {
    constructor() {
      super("cancelled");
    }
  }
  t.CancellationError = o;
};

module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.ProgressCallbackTransform = void 0));
  const n = r(2203);
  class i extends n.Transform {
    constructor(e, t, r) {
      (super(),
        (this.total = e),
        (this.cancellationToken = t),
        (this.onProgress = r),
        (this.start = Date.now()),
        (this.transferred = 0),
        (this.delta = 0),
        (this.nextUpdate = this.start + 1e3));
    }
    _transform(e, t, r) {
      if (this.cancellationToken.cancelled) return void r(new Error("cancelled"), null);
      ((this.transferred += e.length), (this.delta += e.length));
      const n = Date.now();
      (n >= this.nextUpdate &&
        this.transferred !== this.total &&
        ((this.nextUpdate = n + 1e3),
        this.onProgress({
          total: this.total,
          delta: this.delta,
          transferred: this.transferred,
          percent: (this.transferred / this.total) * 100,
          bytesPerSecond: Math.round(this.transferred / ((n - this.start) / 1e3)),
        }),
        (this.delta = 0)),
        r(null, e));
    }
    _flush(e) {
      this.cancellationToken.cancelled
        ? e(new Error("cancelled"))
        : (this.onProgress({
            total: this.total,
            delta: this.delta,
            transferred: this.total,
            percent: 100,
            bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3)),
          }),
          (this.delta = 0),
          e(null));
    }
  }
  t.ProgressCallbackTransform = i;
};

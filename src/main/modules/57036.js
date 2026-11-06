module.exports = (e, t, r) => {
  var n = r(2203).Stream;
  e.exports = function (e) {
    return {
      ReadStream: function t(r, i) {
        if (!(this instanceof t)) return new t(r, i);
        n.call(this);
        var o = this;
        ((this.path = r),
          (this.fd = null),
          (this.readable = !0),
          (this.paused = !1),
          (this.flags = "r"),
          (this.mode = 438),
          (this.bufferSize = 65536),
          (i = i || {}));
        for (var s = Object.keys(i), a = 0, c = s.length; a < c; a++) {
          var l = s[a];
          this[l] = i[l];
        }
        if ((this.encoding && this.setEncoding(this.encoding), void 0 !== this.start)) {
          if ("number" != typeof this.start) throw TypeError("start must be a Number");
          if (void 0 === this.end) this.end = 1 / 0;
          else if ("number" != typeof this.end) throw TypeError("end must be a Number");
          if (this.start > this.end) throw new Error("start must be <= end");
          this.pos = this.start;
        }
        null === this.fd
          ? e.open(this.path, this.flags, this.mode, function (e, t) {
              if (e) return (o.emit("error", e), void (o.readable = !1));
              ((o.fd = t), o.emit("open", t), o._read());
            })
          : process.nextTick(function () {
              o._read();
            });
      },
      WriteStream: function t(r, i) {
        if (!(this instanceof t)) return new t(r, i);
        (n.call(this),
          (this.path = r),
          (this.fd = null),
          (this.writable = !0),
          (this.flags = "w"),
          (this.encoding = "binary"),
          (this.mode = 438),
          (this.bytesWritten = 0),
          (i = i || {}));
        for (var o = Object.keys(i), s = 0, a = o.length; s < a; s++) {
          var c = o[s];
          this[c] = i[c];
        }
        if (void 0 !== this.start) {
          if ("number" != typeof this.start) throw TypeError("start must be a Number");
          if (this.start < 0) throw new Error("start must be >= zero");
          this.pos = this.start;
        }
        ((this.busy = !1),
          (this._queue = []),
          null === this.fd &&
            ((this._open = e.open),
            this._queue.push([this._open, this.path, this.flags, this.mode, void 0]),
            this.flush()));
      },
    };
  };
};

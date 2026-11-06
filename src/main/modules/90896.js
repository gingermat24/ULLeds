module.exports = (e, t, r) => {
  var n = r(39023),
    i = r(2203).Stream,
    o = r(85872);
  function s() {
    ((this.writable = !1),
      (this.readable = !0),
      (this.dataSize = 0),
      (this.maxDataSize = 2097152),
      (this.pauseStreams = !0),
      (this._released = !1),
      (this._streams = []),
      (this._currentStream = null),
      (this._insideLoop = !1),
      (this._pendingNext = !1));
  }
  ((e.exports = s),
    n.inherits(s, i),
    (s.create = function (e) {
      var t = new this();
      for (var r in (e = e || {})) t[r] = e[r];
      return t;
    }),
    (s.isStreamLike = function (e) {
      return (
        "function" != typeof e &&
        "string" != typeof e &&
        "boolean" != typeof e &&
        "number" != typeof e &&
        !Buffer.isBuffer(e)
      );
    }),
    (s.prototype.append = function (e) {
      if (s.isStreamLike(e)) {
        if (!(e instanceof o)) {
          var t = o.create(e, { maxDataSize: 1 / 0, pauseStream: this.pauseStreams });
          (e.on("data", this._checkDataSize.bind(this)), (e = t));
        }
        (this._handleErrors(e), this.pauseStreams && e.pause());
      }
      return (this._streams.push(e), this);
    }),
    (s.prototype.pipe = function (e, t) {
      return (i.prototype.pipe.call(this, e, t), this.resume(), e);
    }),
    (s.prototype._getNext = function () {
      if (((this._currentStream = null), this._insideLoop)) this._pendingNext = !0;
      else {
        this._insideLoop = !0;
        try {
          do {
            ((this._pendingNext = !1), this._realGetNext());
          } while (this._pendingNext);
        } finally {
          this._insideLoop = !1;
        }
      }
    }),
    (s.prototype._realGetNext = function () {
      var e = this._streams.shift();
      void 0 !== e
        ? "function" == typeof e
          ? e(
              function (e) {
                (s.isStreamLike(e) &&
                  (e.on("data", this._checkDataSize.bind(this)), this._handleErrors(e)),
                  this._pipeNext(e));
              }.bind(this),
            )
          : this._pipeNext(e)
        : this.end();
    }),
    (s.prototype._pipeNext = function (e) {
      if (((this._currentStream = e), s.isStreamLike(e)))
        return (e.on("end", this._getNext.bind(this)), void e.pipe(this, { end: !1 }));
      var t = e;
      (this.write(t), this._getNext());
    }),
    (s.prototype._handleErrors = function (e) {
      var t = this;
      e.on("error", function (e) {
        t._emitError(e);
      });
    }),
    (s.prototype.write = function (e) {
      this.emit("data", e);
    }),
    (s.prototype.pause = function () {
      this.pauseStreams &&
        (this.pauseStreams &&
          this._currentStream &&
          "function" == typeof this._currentStream.pause &&
          this._currentStream.pause(),
        this.emit("pause"));
    }),
    (s.prototype.resume = function () {
      (this._released || ((this._released = !0), (this.writable = !0), this._getNext()),
        this.pauseStreams &&
          this._currentStream &&
          "function" == typeof this._currentStream.resume &&
          this._currentStream.resume(),
        this.emit("resume"));
    }),
    (s.prototype.end = function () {
      (this._reset(), this.emit("end"));
    }),
    (s.prototype.destroy = function () {
      (this._reset(), this.emit("close"));
    }),
    (s.prototype._reset = function () {
      ((this.writable = !1), (this._streams = []), (this._currentStream = null));
    }),
    (s.prototype._checkDataSize = function () {
      if ((this._updateDataSize(), !(this.dataSize <= this.maxDataSize))) {
        var e = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
        this._emitError(new Error(e));
      }
    }),
    (s.prototype._updateDataSize = function () {
      this.dataSize = 0;
      var e = this;
      (this._streams.forEach(function (t) {
        t.dataSize && (e.dataSize += t.dataSize);
      }),
        this._currentStream &&
          this._currentStream.dataSize &&
          (this.dataSize += this._currentStream.dataSize));
    }),
    (s.prototype._emitError = function (e) {
      (this._reset(), this.emit("error", e));
    }));
};

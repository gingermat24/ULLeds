module.exports = (e, t, r) => {
  var n = r(90896),
    i = r(39023),
    o = r(16928),
    s = r(58611),
    a = r(65692),
    c = r(87016).parse,
    l = r(79896),
    u = r(2203).Stream,
    p = r(21058),
    d = r(50314),
    f = r(19045);
  function h(e) {
    if (!(this instanceof h)) return new h(e);
    for (var t in ((this._overheadLength = 0),
    (this._valueLength = 0),
    (this._valuesToMeasure = []),
    n.call(this),
    (e = e || {})))
      this[t] = e[t];
  }
  ((e.exports = h),
    i.inherits(h, n),
    (h.LINE_BREAK = "\r\n"),
    (h.DEFAULT_CONTENT_TYPE = "application/octet-stream"),
    (h.prototype.append = function (e, t, r) {
      "string" == typeof (r = r || {}) && (r = { filename: r });
      var i = n.prototype.append.bind(this);
      if (("number" == typeof t && (t = "" + t), Array.isArray(t)))
        this._error(new Error("Arrays are not supported."));
      else {
        var o = this._multiPartHeader(e, t, r),
          s = this._multiPartFooter();
        (i(o), i(t), i(s), this._trackLength(o, t, r));
      }
    }),
    (h.prototype._trackLength = function (e, t, r) {
      var n = 0;
      (null != r.knownLength
        ? (n += +r.knownLength)
        : Buffer.isBuffer(t)
          ? (n = t.length)
          : "string" == typeof t && (n = Buffer.byteLength(t)),
        (this._valueLength += n),
        (this._overheadLength += Buffer.byteLength(e) + h.LINE_BREAK.length),
        t &&
          (t.path || (t.readable && t.hasOwnProperty("httpVersion")) || t instanceof u) &&
          (r.knownLength || this._valuesToMeasure.push(t)));
    }),
    (h.prototype._lengthRetriever = function (e, t) {
      e.hasOwnProperty("fd")
        ? null != e.end && e.end != 1 / 0 && null != e.start
          ? t(null, e.end + 1 - (e.start ? e.start : 0))
          : l.stat(e.path, function (r, n) {
              var i;
              r ? t(r) : ((i = n.size - (e.start ? e.start : 0)), t(null, i));
            })
        : e.hasOwnProperty("httpVersion")
          ? t(null, +e.headers["content-length"])
          : e.hasOwnProperty("httpModule")
            ? (e.on("response", function (r) {
                (e.pause(), t(null, +r.headers["content-length"]));
              }),
              e.resume())
            : t("Unknown stream");
    }),
    (h.prototype._multiPartHeader = function (e, t, r) {
      if ("string" == typeof r.header) return r.header;
      var n,
        i = this._getContentDisposition(t, r),
        o = this._getContentType(t, r),
        s = "",
        a = {
          "Content-Disposition": ["form-data", 'name="' + e + '"'].concat(i || []),
          "Content-Type": [].concat(o || []),
        };
      for (var c in ("object" == typeof r.header && f(a, r.header), a))
        a.hasOwnProperty(c) &&
          null != (n = a[c]) &&
          (Array.isArray(n) || (n = [n]),
          n.length && (s += c + ": " + n.join("; ") + h.LINE_BREAK));
      return "--" + this.getBoundary() + h.LINE_BREAK + s + h.LINE_BREAK;
    }),
    (h.prototype._getContentDisposition = function (e, t) {
      var r, n;
      return (
        "string" == typeof t.filepath
          ? (r = o.normalize(t.filepath).replace(/\\/g, "/"))
          : t.filename || e.name || e.path
            ? (r = o.basename(t.filename || e.name || e.path))
            : e.readable &&
              e.hasOwnProperty("httpVersion") &&
              (r = o.basename(e.client._httpMessage.path || "")),
        r && (n = 'filename="' + r + '"'),
        n
      );
    }),
    (h.prototype._getContentType = function (e, t) {
      var r = t.contentType;
      return (
        !r && e.name && (r = p.lookup(e.name)),
        !r && e.path && (r = p.lookup(e.path)),
        !r && e.readable && e.hasOwnProperty("httpVersion") && (r = e.headers["content-type"]),
        r || (!t.filepath && !t.filename) || (r = p.lookup(t.filepath || t.filename)),
        r || "object" != typeof e || (r = h.DEFAULT_CONTENT_TYPE),
        r
      );
    }),
    (h.prototype._multiPartFooter = function () {
      return function (e) {
        var t = h.LINE_BREAK;
        (0 === this._streams.length && (t += this._lastBoundary()), e(t));
      }.bind(this);
    }),
    (h.prototype._lastBoundary = function () {
      return "--" + this.getBoundary() + "--" + h.LINE_BREAK;
    }),
    (h.prototype.getHeaders = function (e) {
      var t,
        r = { "content-type": "multipart/form-data; boundary=" + this.getBoundary() };
      for (t in e) e.hasOwnProperty(t) && (r[t.toLowerCase()] = e[t]);
      return r;
    }),
    (h.prototype.setBoundary = function (e) {
      this._boundary = e;
    }),
    (h.prototype.getBoundary = function () {
      return (this._boundary || this._generateBoundary(), this._boundary);
    }),
    (h.prototype.getBuffer = function () {
      for (
        var e = new Buffer.alloc(0), t = this.getBoundary(), r = 0, n = this._streams.length;
        r < n;
        r++
      )
        "function" != typeof this._streams[r] &&
          ((e = Buffer.isBuffer(this._streams[r])
            ? Buffer.concat([e, this._streams[r]])
            : Buffer.concat([e, Buffer.from(this._streams[r])])),
          ("string" == typeof this._streams[r] &&
            this._streams[r].substring(2, t.length + 2) === t) ||
            (e = Buffer.concat([e, Buffer.from(h.LINE_BREAK)])));
      return Buffer.concat([e, Buffer.from(this._lastBoundary())]);
    }),
    (h.prototype._generateBoundary = function () {
      for (var e = "--------------------------", t = 0; t < 24; t++)
        e += Math.floor(10 * Math.random()).toString(16);
      this._boundary = e;
    }),
    (h.prototype.getLengthSync = function () {
      var e = this._overheadLength + this._valueLength;
      return (
        this._streams.length && (e += this._lastBoundary().length),
        this.hasKnownLength() ||
          this._error(new Error("Cannot calculate proper length in synchronous way.")),
        e
      );
    }),
    (h.prototype.hasKnownLength = function () {
      var e = !0;
      return (this._valuesToMeasure.length && (e = !1), e);
    }),
    (h.prototype.getLength = function (e) {
      var t = this._overheadLength + this._valueLength;
      (this._streams.length && (t += this._lastBoundary().length),
        this._valuesToMeasure.length
          ? d.parallel(this._valuesToMeasure, this._lengthRetriever, function (r, n) {
              r
                ? e(r)
                : (n.forEach(function (e) {
                    t += e;
                  }),
                  e(null, t));
            })
          : process.nextTick(e.bind(this, null, t)));
    }),
    (h.prototype.submit = function (e, t) {
      var r,
        n,
        i = { method: "post" };
      return (
        "string" == typeof e
          ? ((e = c(e)),
            (n = f({ port: e.port, path: e.pathname, host: e.hostname, protocol: e.protocol }, i)))
          : (n = f(e, i)).port || (n.port = "https:" == n.protocol ? 443 : 80),
        (n.headers = this.getHeaders(e.headers)),
        (r = "https:" == n.protocol ? a.request(n) : s.request(n)),
        this.getLength(
          function (e, n) {
            if (e && "Unknown stream" !== e) this._error(e);
            else if ((n && r.setHeader("Content-Length", n), this.pipe(r), t)) {
              var i,
                o = function (e, n) {
                  return (
                    r.removeListener("error", o),
                    r.removeListener("response", i),
                    t.call(this, e, n)
                  );
                };
              ((i = o.bind(this, null)), r.on("error", o), r.on("response", i));
            }
          }.bind(this),
        ),
        r
      );
    }),
    (h.prototype._error = function (e) {
      this.error || ((this.error = e), this.pause(), this.emit("error", e));
    }),
    (h.prototype.toString = function () {
      return "[object FormData]";
    }));
};

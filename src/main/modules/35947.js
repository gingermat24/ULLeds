module.exports = (e, t, r) => {
  var n,
    i,
    o,
    s = r(87016),
    a = s.URL,
    c = r(58611),
    l = r(65692),
    u = r(2203).Writable,
    p = r(42613),
    d = r(48756);
  ((n = "undefined" != typeof process),
    (i = "undefined" != typeof window && "undefined" != typeof document),
    (o = N(Error.captureStackTrace)),
    n ||
      (!i && o) ||
      console.warn("The follow-redirects package should be excluded from browser builds."));
  var f = !1;
  try {
    p(new a(""));
  } catch (e) {
    f = "ERR_INVALID_URL" === e.code;
  }
  var h = [
      "auth",
      "host",
      "hostname",
      "href",
      "path",
      "pathname",
      "port",
      "protocol",
      "query",
      "search",
      "hash",
    ],
    m = ["abort", "aborted", "connect", "error", "socket", "timeout"],
    g = Object.create(null);
  m.forEach(function (e) {
    g[e] = function (t, r, n) {
      this._redirectable.emit(e, t, r, n);
    };
  });
  var v = A("ERR_INVALID_URL", "Invalid URL", TypeError),
    y = A("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed"),
    w = A("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", y),
    b = A("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit"),
    x = A("ERR_STREAM_WRITE_AFTER_END", "write after end"),
    E = u.prototype.destroy || I;
  function _(e, t) {
    (u.call(this),
      this._sanitizeOptions(e),
      (this._options = e),
      (this._ended = !1),
      (this._ending = !1),
      (this._redirectCount = 0),
      (this._redirects = []),
      (this._requestBodyLength = 0),
      (this._requestBodyBuffers = []),
      t && this.on("response", t));
    var r = this;
    ((this._onNativeResponse = function (e) {
      try {
        r._processResponse(e);
      } catch (e) {
        r.emit("error", e instanceof y ? e : new y({ cause: e }));
      }
    }),
      this._performRequest());
  }
  function S(e) {
    var t = { maxRedirects: 21, maxBodyLength: 10485760 },
      r = {};
    return (
      Object.keys(e).forEach(function (n) {
        var i = n + ":",
          o = (r[i] = e[n]),
          s = (t[n] = Object.create(o));
        Object.defineProperties(s, {
          request: {
            value: function (e, n, o) {
              return (
                a && e instanceof a
                  ? (e = R(e))
                  : k(e)
                    ? (e = R($(e)))
                    : ((o = n), (n = O(e)), (e = { protocol: i })),
                N(n) && ((o = n), (n = null)),
                ((n = Object.assign(
                  { maxRedirects: t.maxRedirects, maxBodyLength: t.maxBodyLength },
                  e,
                  n,
                )).nativeProtocols = r),
                k(n.host) || k(n.hostname) || (n.hostname = "::1"),
                p.equal(n.protocol, i, "protocol mismatch"),
                d("options", n),
                new _(n, o)
              );
            },
            configurable: !0,
            enumerable: !0,
            writable: !0,
          },
          get: {
            value: function (e, t, r) {
              var n = s.request(e, t, r);
              return (n.end(), n);
            },
            configurable: !0,
            enumerable: !0,
            writable: !0,
          },
        });
      }),
      t
    );
  }
  function I() {}
  function $(e) {
    var t;
    if (f) t = new a(e);
    else if (!k((t = O(s.parse(e))).protocol)) throw new v({ input: e });
    return t;
  }
  function O(e) {
    if (/^\[/.test(e.hostname) && !/^\[[:0-9a-f]+\]$/i.test(e.hostname))
      throw new v({ input: e.href || e });
    if (/^\[/.test(e.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(e.host))
      throw new v({ input: e.href || e });
    return e;
  }
  function R(e, t) {
    var r = t || {};
    for (var n of h) r[n] = e[n];
    return (
      r.hostname.startsWith("[") && (r.hostname = r.hostname.slice(1, -1)),
      "" !== r.port && (r.port = Number(r.port)),
      (r.path = r.search ? r.pathname + r.search : r.pathname),
      r
    );
  }
  function P(e, t) {
    var r;
    for (var n in t) e.test(n) && ((r = t[n]), delete t[n]);
    return null == r ? void 0 : String(r).trim();
  }
  function A(e, t, r) {
    function n(r) {
      (N(Error.captureStackTrace) && Error.captureStackTrace(this, this.constructor),
        Object.assign(this, r || {}),
        (this.code = e),
        (this.message = this.cause ? t + ": " + this.cause.message : t));
    }
    return (
      (n.prototype = new (r || Error)()),
      Object.defineProperties(n.prototype, {
        constructor: { value: n, enumerable: !1 },
        name: { value: "Error [" + e + "]", enumerable: !1 },
      }),
      n
    );
  }
  function T(e, t) {
    for (var r of m) e.removeListener(r, g[r]);
    (e.on("error", I), e.destroy(t));
  }
  function k(e) {
    return "string" == typeof e || e instanceof String;
  }
  function N(e) {
    return "function" == typeof e;
  }
  ((_.prototype = Object.create(u.prototype)),
    (_.prototype.abort = function () {
      (T(this._currentRequest), this._currentRequest.abort(), this.emit("abort"));
    }),
    (_.prototype.destroy = function (e) {
      return (T(this._currentRequest, e), E.call(this, e), this);
    }),
    (_.prototype.write = function (e, t, r) {
      if (this._ending) throw new x();
      if (!(k(e) || ("object" == typeof (n = e) && "length" in n)))
        throw new TypeError("data should be a string, Buffer or Uint8Array");
      var n;
      (N(t) && ((r = t), (t = null)),
        0 !== e.length
          ? this._requestBodyLength + e.length <= this._options.maxBodyLength
            ? ((this._requestBodyLength += e.length),
              this._requestBodyBuffers.push({ data: e, encoding: t }),
              this._currentRequest.write(e, t, r))
            : (this.emit("error", new b()), this.abort())
          : r && r());
    }),
    (_.prototype.end = function (e, t, r) {
      if ((N(e) ? ((r = e), (e = t = null)) : N(t) && ((r = t), (t = null)), e)) {
        var n = this,
          i = this._currentRequest;
        (this.write(e, t, function () {
          ((n._ended = !0), i.end(null, null, r));
        }),
          (this._ending = !0));
      } else ((this._ended = this._ending = !0), this._currentRequest.end(null, null, r));
    }),
    (_.prototype.setHeader = function (e, t) {
      ((this._options.headers[e] = t), this._currentRequest.setHeader(e, t));
    }),
    (_.prototype.removeHeader = function (e) {
      (delete this._options.headers[e], this._currentRequest.removeHeader(e));
    }),
    (_.prototype.setTimeout = function (e, t) {
      var r = this;
      function n(t) {
        (t.setTimeout(e),
          t.removeListener("timeout", t.destroy),
          t.addListener("timeout", t.destroy));
      }
      function i(t) {
        (r._timeout && clearTimeout(r._timeout),
          (r._timeout = setTimeout(function () {
            (r.emit("timeout"), o());
          }, e)),
          n(t));
      }
      function o() {
        (r._timeout && (clearTimeout(r._timeout), (r._timeout = null)),
          r.removeListener("abort", o),
          r.removeListener("error", o),
          r.removeListener("response", o),
          r.removeListener("close", o),
          t && r.removeListener("timeout", t),
          r.socket || r._currentRequest.removeListener("socket", i));
      }
      return (
        t && this.on("timeout", t),
        this.socket ? i(this.socket) : this._currentRequest.once("socket", i),
        this.on("socket", n),
        this.on("abort", o),
        this.on("error", o),
        this.on("response", o),
        this.on("close", o),
        this
      );
    }),
    ["flushHeaders", "getHeader", "setNoDelay", "setSocketKeepAlive"].forEach(function (e) {
      _.prototype[e] = function (t, r) {
        return this._currentRequest[e](t, r);
      };
    }),
    ["aborted", "connection", "socket"].forEach(function (e) {
      Object.defineProperty(_.prototype, e, {
        get: function () {
          return this._currentRequest[e];
        },
      });
    }),
    (_.prototype._sanitizeOptions = function (e) {
      if (
        (e.headers || (e.headers = {}),
        e.host && (e.hostname || (e.hostname = e.host), delete e.host),
        !e.pathname && e.path)
      ) {
        var t = e.path.indexOf("?");
        t < 0
          ? (e.pathname = e.path)
          : ((e.pathname = e.path.substring(0, t)), (e.search = e.path.substring(t)));
      }
    }),
    (_.prototype._performRequest = function () {
      var e = this._options.protocol,
        t = this._options.nativeProtocols[e];
      if (!t) throw new TypeError("Unsupported protocol " + e);
      if (this._options.agents) {
        var r = e.slice(0, -1);
        this._options.agent = this._options.agents[r];
      }
      var n = (this._currentRequest = t.request(this._options, this._onNativeResponse));
      for (var i of ((n._redirectable = this), m)) n.on(i, g[i]);
      if (
        ((this._currentUrl = /^\//.test(this._options.path)
          ? s.format(this._options)
          : this._options.path),
        this._isRedirect)
      ) {
        var o = 0,
          a = this,
          c = this._requestBodyBuffers;
        !(function e(t) {
          if (n === a._currentRequest)
            if (t) a.emit("error", t);
            else if (o < c.length) {
              var r = c[o++];
              n.finished || n.write(r.data, r.encoding, e);
            } else a._ended && n.end();
        })();
      }
    }),
    (_.prototype._processResponse = function (e) {
      var t = e.statusCode;
      this._options.trackRedirects &&
        this._redirects.push({ url: this._currentUrl, headers: e.headers, statusCode: t });
      var r,
        n = e.headers.location;
      if (!n || !1 === this._options.followRedirects || t < 300 || t >= 400)
        return (
          (e.responseUrl = this._currentUrl),
          (e.redirects = this._redirects),
          this.emit("response", e),
          void (this._requestBodyBuffers = [])
        );
      if (
        (T(this._currentRequest), e.destroy(), ++this._redirectCount > this._options.maxRedirects)
      )
        throw new w();
      var i = this._options.beforeRedirect;
      i && (r = Object.assign({ Host: e.req.getHeader("host") }, this._options.headers));
      var o = this._options.method;
      (((301 === t || 302 === t) && "POST" === this._options.method) ||
        (303 === t && !/^(?:GET|HEAD)$/.test(this._options.method))) &&
        ((this._options.method = "GET"),
        (this._requestBodyBuffers = []),
        P(/^content-/i, this._options.headers));
      var c,
        l,
        u = P(/^host$/i, this._options.headers),
        h = $(this._currentUrl),
        m = u || h.host,
        g = /^\w+:/.test(n) ? this._currentUrl : s.format(Object.assign(h, { host: m })),
        v = ((c = n), (l = g), f ? new a(c, l) : $(s.resolve(l, c)));
      if (
        (d("redirecting to", v.href),
        (this._isRedirect = !0),
        R(v, this._options),
        ((v.protocol !== h.protocol && "https:" !== v.protocol) ||
          (v.host !== m &&
            !(function (e, t) {
              p(k(e) && k(t));
              var r = e.length - t.length - 1;
              return r > 0 && "." === e[r] && e.endsWith(t);
            })(v.host, m))) &&
          P(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers),
        N(i))
      ) {
        var y = { headers: e.headers, statusCode: t },
          b = { url: g, method: o, headers: r };
        (i(this._options, y, b), this._sanitizeOptions(this._options));
      }
      this._performRequest();
    }),
    (e.exports = S({ http: c, https: l })),
    (e.exports.wrap = S));
};

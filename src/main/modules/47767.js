module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.DigestTransform = t.HttpExecutor = t.HttpError = void 0),
    (t.createHttpError = d),
    (t.parseJson = function (e) {
      return e.then((e) => (null == e || 0 === e.length ? null : JSON.parse(e)));
    }),
    (t.configureRequestOptionsFromUrl = g),
    (t.configureRequestUrl = v),
    (t.safeGetHeader = w),
    (t.configureRequestOptions = b),
    (t.safeStringifyJson = x));
  const n = r(76982),
    i = r(9192),
    o = r(79896),
    s = r(2203),
    a = r(87016),
    c = r(88260),
    l = r(68046),
    u = r(33024),
    p = (0, i.default)("electron-builder");
  function d(e, t = null) {
    return new h(
      e.statusCode || -1,
      `${e.statusCode} ${e.statusMessage}` +
        (null == t ? "" : "\n" + JSON.stringify(t, null, "  ")) +
        "\nHeaders: " +
        x(e.headers),
      t,
    );
  }
  const f = new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"],
  ]);
  class h extends Error {
    constructor(e, t = `HTTP error: ${f.get(e) || e}`, r = null) {
      (super(t),
        (this.statusCode = e),
        (this.description = r),
        (this.name = "HttpError"),
        (this.code = `HTTP_ERROR_${e}`));
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  t.HttpError = h;
  class m {
    constructor() {
      this.maxRedirects = 10;
    }
    request(e, t = new c.CancellationToken(), r) {
      b(e);
      const n = null == r ? void 0 : JSON.stringify(r),
        i = n ? Buffer.from(n) : void 0;
      if (null != i) {
        p(n);
        const { headers: t, ...r } = e;
        e = {
          method: "post",
          headers: { "Content-Type": "application/json", "Content-Length": i.length, ...t },
          ...r,
        };
      }
      return this.doApiRequest(e, t, (e) => e.end(i));
    }
    doApiRequest(e, t, r, n = 0) {
      return (
        p.enabled && p(`Request: ${x(e)}`),
        t.createPromise((i, o, s) => {
          const a = this.createRequest(e, (s) => {
            try {
              this.handleResponse(s, e, t, i, o, n, r);
            } catch (e) {
              o(e);
            }
          });
          (this.addErrorAndTimeoutHandlers(a, o, e.timeout),
            this.addRedirectHandlers(a, e, o, n, (e) => {
              this.doApiRequest(e, t, r, n).then(i).catch(o);
            }),
            r(a, o),
            s(() => a.abort()));
        })
      );
    }
    addRedirectHandlers(e, t, r, n, i) {}
    addErrorAndTimeoutHandlers(e, t, r = 6e4) {
      (this.addTimeOutHandler(e, t, r),
        e.on("error", t),
        e.on("aborted", () => {
          t(new Error("Request has been aborted by the server"));
        }));
    }
    handleResponse(e, t, r, n, i, o, s) {
      var a;
      if (
        (p.enabled && p(`Response: ${e.statusCode} ${e.statusMessage}, request options: ${x(t)}`),
        404 === e.statusCode)
      )
        return void i(
          d(
            e,
            `method: ${t.method || "GET"} url: ${t.protocol || "https:"}//${t.hostname}${t.port ? `:${t.port}` : ""}${t.path}\n\nPlease double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.\n`,
          ),
        );
      if (204 === e.statusCode) return void n();
      const c = null !== (a = e.statusCode) && void 0 !== a ? a : 0,
        l = c >= 300 && c < 400,
        u = w(e, "location");
      if (l && null != u)
        return o > this.maxRedirects
          ? void i(this.createMaxRedirectError())
          : void this.doApiRequest(m.prepareRedirectUrlOptions(u, t), r, s, o).then(n).catch(i);
      e.setEncoding("utf8");
      let f = "";
      (e.on("error", i),
        e.on("data", (e) => (f += e)),
        e.on("end", () => {
          try {
            if (null != e.statusCode && e.statusCode >= 400) {
              const r = w(e, "content-type"),
                n =
                  null != r &&
                  (Array.isArray(r)
                    ? null != r.find((e) => e.includes("json"))
                    : r.includes("json"));
              i(
                d(
                  e,
                  `method: ${t.method || "GET"} url: ${t.protocol || "https:"}//${t.hostname}${t.port ? `:${t.port}` : ""}${t.path}\n\n          Data:\n          ${n ? JSON.stringify(JSON.parse(f)) : f}\n          `,
                ),
              );
            } else n(0 === f.length ? null : f);
          } catch (e) {
            i(e);
          }
        }));
    }
    async downloadToBuffer(e, t) {
      return await t.cancellationToken.createPromise((r, n, i) => {
        const o = [],
          s = { headers: t.headers || void 0, redirect: "manual" };
        (v(e, s),
          b(s),
          this.doDownload(
            s,
            {
              destination: null,
              options: t,
              onCancel: i,
              callback: (e) => {
                null == e ? r(Buffer.concat(o)) : n(e);
              },
              responseHandler: (e, t) => {
                let r = 0;
                (e.on("data", (e) => {
                  ((r += e.length),
                    r > 524288e3 ? t(new Error("Maximum allowed size is 500 MB")) : o.push(e));
                }),
                  e.on("end", () => {
                    t(null);
                  }));
              },
            },
            0,
          ));
      });
    }
    doDownload(e, t, r) {
      const n = this.createRequest(e, (n) => {
        if (n.statusCode >= 400)
          return void t.callback(
            new Error(
              `Cannot download "${e.protocol || "https:"}//${e.hostname}${e.path}", status ${n.statusCode}: ${n.statusMessage}`,
            ),
          );
        n.on("error", t.callback);
        const i = w(n, "location");
        null == i
          ? null == t.responseHandler
            ? (function (e, t) {
                if (
                  ((r = w(t, "X-Checksum-Sha2")),
                  (n = e.options.sha2),
                  (i = e.callback),
                  null != r &&
                    null != n &&
                    r !== n &&
                    (i(
                      new Error(
                        `checksum mismatch: expected ${n} but got ${r} (X-Checksum-Sha2 header)`,
                      ),
                    ),
                    1))
                )
                  return;
                var r, n, i;
                const s = [];
                if (null != e.options.onProgress) {
                  const r = w(t, "content-length");
                  null != r &&
                    s.push(
                      new u.ProgressCallbackTransform(
                        parseInt(r, 10),
                        e.options.cancellationToken,
                        e.options.onProgress,
                      ),
                    );
                }
                const a = e.options.sha512;
                null != a
                  ? s.push(
                      new y(
                        a,
                        "sha512",
                        128 !== a.length || a.includes("+") || a.includes("Z") || a.includes("=")
                          ? "base64"
                          : "hex",
                      ),
                    )
                  : null != e.options.sha2 && s.push(new y(e.options.sha2, "sha256", "hex"));
                const c = (0, o.createWriteStream)(e.destination);
                s.push(c);
                let l = t;
                for (const t of s)
                  (t.on("error", (t) => {
                    (c.close(), e.options.cancellationToken.cancelled || e.callback(t));
                  }),
                    (l = l.pipe(t)));
                c.on("finish", () => {
                  c.close(e.callback);
                });
              })(t, n)
            : t.responseHandler(n, t.callback)
          : r < this.maxRedirects
            ? this.doDownload(m.prepareRedirectUrlOptions(i, e), t, r++)
            : t.callback(this.createMaxRedirectError());
      });
      (this.addErrorAndTimeoutHandlers(n, t.callback, e.timeout),
        this.addRedirectHandlers(n, e, t.callback, r, (e) => {
          this.doDownload(e, t, r++);
        }),
        n.end());
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(e, t, r) {
      e.on("socket", (n) => {
        n.setTimeout(r, () => {
          (e.abort(), t(new Error("Request timed out")));
        });
      });
    }
    static prepareRedirectUrlOptions(e, t) {
      const r = g(e, { ...t }),
        n = r.headers;
      if (null == n ? void 0 : n.authorization) {
        const t = new a.URL(e);
        (t.hostname.endsWith(".amazonaws.com") || t.searchParams.has("X-Amz-Credential")) &&
          delete n.authorization;
      }
      return r;
    }
    static retryOnServerError(e, t = 3) {
      for (let r = 0; ; r++)
        try {
          return e();
        } catch (e) {
          if (r < t && ((e instanceof h && e.isServerError()) || "EPIPE" === e.code)) continue;
          throw e;
        }
    }
  }
  function g(e, t) {
    const r = b(t);
    return (v(new a.URL(e), r), r);
  }
  function v(e, t) {
    ((t.protocol = e.protocol),
      (t.hostname = e.hostname),
      e.port ? (t.port = e.port) : t.port && delete t.port,
      (t.path = e.pathname + e.search));
  }
  t.HttpExecutor = m;
  class y extends s.Transform {
    get actual() {
      return this._actual;
    }
    constructor(e, t = "sha512", r = "base64") {
      (super(),
        (this.expected = e),
        (this.algorithm = t),
        (this.encoding = r),
        (this._actual = null),
        (this.isValidateOnEnd = !0),
        (this.digester = (0, n.createHash)(t)));
    }
    _transform(e, t, r) {
      (this.digester.update(e), r(null, e));
    }
    _flush(e) {
      if (((this._actual = this.digester.digest(this.encoding)), this.isValidateOnEnd))
        try {
          this.validate();
        } catch (t) {
          return void e(t);
        }
      e(null);
    }
    validate() {
      if (null == this._actual)
        throw (0, l.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, l.newError)(
          `${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`,
          "ERR_CHECKSUM_MISMATCH",
        );
      return null;
    }
  }
  function w(e, t) {
    const r = e.headers[t];
    return null == r ? null : Array.isArray(r) ? (0 === r.length ? null : r[r.length - 1]) : r;
  }
  function b(e, t, r) {
    (null != r && (e.method = r), (e.headers = { ...e.headers }));
    const n = e.headers;
    return (
      null != t &&
        (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`),
      null == n["User-Agent"] && (n["User-Agent"] = "electron-builder"),
      (null != r && "GET" !== r && null != n["Cache-Control"]) || (n["Cache-Control"] = "no-cache"),
      null == e.protocol && null != process.versions.electron && (e.protocol = "https:"),
      e
    );
  }
  function x(e, t) {
    return JSON.stringify(
      e,
      (e, r) =>
        e.endsWith("Authorization") ||
        e.endsWith("authorization") ||
        e.endsWith("Password") ||
        e.endsWith("PASSWORD") ||
        e.endsWith("Token") ||
        e.includes("password") ||
        e.includes("token") ||
        (null != t && t.has(e))
          ? "<stripped sensitive data>"
          : r,
      2,
    );
  }
  t.DigestTransform = y;
};

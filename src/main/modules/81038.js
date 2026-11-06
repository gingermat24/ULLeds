module.exports = (e, t, r) => {
  "use strict";
  const {
      normalizeIPv6: n,
      normalizeIPv4: i,
      removeDotSegments: o,
      recomposeAuthority: s,
      normalizeComponentEncoding: a,
    } = r(83155),
    c = r(37082);
  function l(e, t, r, n) {
    const i = {};
    return (
      n || ((e = f(u(e, r), r)), (t = f(u(t, r), r))),
      !(r = r || {}).tolerant && t.scheme
        ? ((i.scheme = t.scheme),
          (i.userinfo = t.userinfo),
          (i.host = t.host),
          (i.port = t.port),
          (i.path = o(t.path || "")),
          (i.query = t.query))
        : (void 0 !== t.userinfo || void 0 !== t.host || void 0 !== t.port
            ? ((i.userinfo = t.userinfo),
              (i.host = t.host),
              (i.port = t.port),
              (i.path = o(t.path || "")),
              (i.query = t.query))
            : (t.path
                ? ("/" === t.path.charAt(0)
                    ? (i.path = o(t.path))
                    : ((void 0 === e.userinfo && void 0 === e.host && void 0 === e.port) || e.path
                        ? e.path
                          ? (i.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path)
                          : (i.path = t.path)
                        : (i.path = "/" + t.path),
                      (i.path = o(i.path))),
                  (i.query = t.query))
                : ((i.path = e.path),
                  void 0 !== t.query ? (i.query = t.query) : (i.query = e.query)),
              (i.userinfo = e.userinfo),
              (i.host = e.host),
              (i.port = e.port)),
          (i.scheme = e.scheme)),
      (i.fragment = t.fragment),
      i
    );
  }
  function u(e, t) {
    const r = {
        host: e.host,
        scheme: e.scheme,
        userinfo: e.userinfo,
        port: e.port,
        path: e.path,
        query: e.query,
        nid: e.nid,
        nss: e.nss,
        uuid: e.uuid,
        fragment: e.fragment,
        reference: e.reference,
        resourceName: e.resourceName,
        secure: e.secure,
        error: "",
      },
      n = Object.assign({}, t),
      i = [],
      a = c[(n.scheme || r.scheme || "").toLowerCase()];
    (a && a.serialize && a.serialize(r, n),
      void 0 !== r.path &&
        (n.skipEscape
          ? (r.path = unescape(r.path))
          : ((r.path = escape(r.path)),
            void 0 !== r.scheme && (r.path = r.path.split("%3A").join(":")))),
      "suffix" !== n.reference && r.scheme && i.push(r.scheme, ":"));
    const l = s(r, n);
    if (
      (void 0 !== l &&
        ("suffix" !== n.reference && i.push("//"),
        i.push(l),
        r.path && "/" !== r.path.charAt(0) && i.push("/")),
      void 0 !== r.path)
    ) {
      let e = r.path;
      (n.absolutePath || (a && a.absolutePath) || (e = o(e)),
        void 0 === l && (e = e.replace(/^\/\//u, "/%2F")),
        i.push(e));
    }
    return (
      void 0 !== r.query && i.push("?", r.query),
      void 0 !== r.fragment && i.push("#", r.fragment),
      i.join("")
    );
  }
  const p = Array.from({ length: 127 }, (e, t) =>
      /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(t)),
    ),
    d =
      /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function f(e, t) {
    const r = Object.assign({}, t),
      o = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0,
      },
      s = -1 !== e.indexOf("%");
    let a = !1;
    "suffix" === r.reference && (e = (r.scheme ? r.scheme + ":" : "") + "//" + e);
    const l = e.match(d);
    if (l) {
      if (
        ((o.scheme = l[1]),
        (o.userinfo = l[3]),
        (o.host = l[4]),
        (o.port = parseInt(l[5], 10)),
        (o.path = l[6] || ""),
        (o.query = l[7]),
        (o.fragment = l[8]),
        isNaN(o.port) && (o.port = l[5]),
        o.host)
      ) {
        const e = i(o.host);
        if (!1 === e.isIPV4) {
          const t = n(e.host, { isIPV4: !1 });
          ((o.host = t.host.toLowerCase()), (a = t.isIPV6));
        } else ((o.host = e.host), (a = !0));
      }
      (void 0 !== o.scheme ||
      void 0 !== o.userinfo ||
      void 0 !== o.host ||
      void 0 !== o.port ||
      o.path ||
      void 0 !== o.query
        ? void 0 === o.scheme
          ? (o.reference = "relative")
          : void 0 === o.fragment
            ? (o.reference = "absolute")
            : (o.reference = "uri")
        : (o.reference = "same-document"),
        r.reference &&
          "suffix" !== r.reference &&
          r.reference !== o.reference &&
          (o.error = o.error || "URI is not a " + r.reference + " reference."));
      const e = c[(r.scheme || o.scheme || "").toLowerCase()];
      if (
        !(r.unicodeSupport || (e && e.unicodeSupport)) &&
        o.host &&
        (r.domainHost || (e && e.domainHost)) &&
        !1 === a &&
        (function (e) {
          let t = 0;
          for (let r = 0, n = e.length; r < n; ++r)
            if (((t = e.charCodeAt(r)), t > 126 || p[t])) return !0;
          return !1;
        })(o.host)
      )
        try {
          o.host = URL.domainToASCII(o.host.toLowerCase());
        } catch (e) {
          o.error = o.error || "Host's domain name can not be converted to ASCII: " + e;
        }
      ((!e || (e && !e.skipNormalize)) &&
        (s && void 0 !== o.scheme && (o.scheme = unescape(o.scheme)),
        s && void 0 !== o.host && (o.host = unescape(o.host)),
        void 0 !== o.path && o.path.length && (o.path = escape(unescape(o.path))),
        void 0 !== o.fragment &&
          o.fragment.length &&
          (o.fragment = encodeURI(decodeURIComponent(o.fragment)))),
        e && e.parse && e.parse(o, r));
    } else o.error = o.error || "URI can not be parsed.";
    return o;
  }
  const h = {
    SCHEMES: c,
    normalize: function (e, t) {
      return (
        "string" == typeof e ? (e = u(f(e, t), t)) : "object" == typeof e && (e = f(u(e, t), t)),
        e
      );
    },
    resolve: function (e, t, r) {
      const n = Object.assign({ scheme: "null" }, r);
      return u(l(f(e, n), f(t, n), n, !0), { ...n, skipEscape: !0 });
    },
    resolveComponents: l,
    equal: function (e, t, r) {
      return (
        "string" == typeof e
          ? ((e = unescape(e)), (e = u(a(f(e, r), !0), { ...r, skipEscape: !0 })))
          : "object" == typeof e && (e = u(a(e, !0), { ...r, skipEscape: !0 })),
        "string" == typeof t
          ? ((t = unescape(t)), (t = u(a(f(t, r), !0), { ...r, skipEscape: !0 })))
          : "object" == typeof t && (t = u(a(t, !0), { ...r, skipEscape: !0 })),
        e.toLowerCase() === t.toLowerCase()
      );
    },
    serialize: u,
    parse: f,
  };
  ((e.exports = h), (e.exports.default = h), (e.exports.fastUri = h));
};

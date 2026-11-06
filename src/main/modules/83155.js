module.exports = (e, t, r) => {
  "use strict";
  const { HEX: n } = r(15771);
  function i(e) {
    if (c(e, ".") < 3) return { host: e, isIPV4: !1 };
    const t =
        e.match(
          /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/u,
        ) || [],
      [r] = t;
    return r ? { host: a(r, "."), isIPV4: !0 } : { host: e, isIPV4: !1 };
  }
  function o(e, t = !1) {
    let r = "",
      i = !0;
    for (const t of e) {
      if (void 0 === n[t]) return;
      ("0" !== t && !0 === i && (i = !1), i || (r += t));
    }
    return (t && 0 === r.length && (r = "0"), r);
  }
  function s(e, t = {}) {
    if (c(e, ":") < 2) return { host: e, isIPV6: !1 };
    const r = (function (e) {
      let t = 0;
      const r = { error: !1, address: "", zone: "" },
        n = [],
        i = [];
      let s = !1,
        a = !1,
        c = !1;
      function l() {
        if (i.length) {
          if (!1 === s) {
            const e = o(i);
            if (void 0 === e) return ((r.error = !0), !1);
            n.push(e);
          }
          i.length = 0;
        }
        return !0;
      }
      for (let o = 0; o < e.length; o++) {
        const u = e[o];
        if ("[" !== u && "]" !== u)
          if (":" !== u)
            if ("%" === u) {
              if (!l()) break;
              s = !0;
            } else i.push(u);
          else {
            if ((!0 === a && (c = !0), !l())) break;
            if ((t++, n.push(":"), t > 7)) {
              r.error = !0;
              break;
            }
            o - 1 >= 0 && ":" === e[o - 1] && (a = !0);
          }
      }
      return (
        i.length && (s ? (r.zone = i.join("")) : c ? n.push(i.join("")) : n.push(o(i))),
        (r.address = n.join("")),
        r
      );
    })(e);
    if (r.error) return { host: e, isIPV6: !1 };
    {
      let e = r.address,
        t = r.address;
      return (
        r.zone && ((e += "%" + r.zone), (t += "%25" + r.zone)),
        { host: e, escapedHost: t, isIPV6: !0 }
      );
    }
  }
  function a(e, t) {
    let r = "",
      n = !0;
    const i = e.length;
    for (let o = 0; o < i; o++) {
      const s = e[o];
      "0" === s && n
        ? ((o + 1 <= i && e[o + 1] === t) || o + 1 === i) && ((r += s), (n = !1))
        : ((n = s === t), (r += s));
    }
    return r;
  }
  function c(e, t) {
    let r = 0;
    for (let n = 0; n < e.length; n++) e[n] === t && r++;
    return r;
  }
  const l = /^\.\.?\//u,
    u = /^\/\.(?:\/|$)/u,
    p = /^\/\.\.(?:\/|$)/u,
    d = /^\/?(?:.|\n)*?(?=\/|$)/u;
  e.exports = {
    recomposeAuthority: function (e, t) {
      const r = [];
      if ((void 0 !== e.userinfo && (r.push(e.userinfo), r.push("@")), void 0 !== e.host)) {
        let t = unescape(e.host);
        const n = i(t);
        if (n.isIPV4) t = n.host;
        else {
          const r = s(n.host, { isIPV4: !1 });
          t = !0 === r.isIPV6 ? `[${r.escapedHost}]` : e.host;
        }
        r.push(t);
      }
      return (
        ("number" != typeof e.port && "string" != typeof e.port) ||
          (r.push(":"), r.push(String(e.port))),
        r.length ? r.join("") : void 0
      );
    },
    normalizeComponentEncoding: function (e, t) {
      const r = !0 !== t ? escape : unescape;
      return (
        void 0 !== e.scheme && (e.scheme = r(e.scheme)),
        void 0 !== e.userinfo && (e.userinfo = r(e.userinfo)),
        void 0 !== e.host && (e.host = r(e.host)),
        void 0 !== e.path && (e.path = r(e.path)),
        void 0 !== e.query && (e.query = r(e.query)),
        void 0 !== e.fragment && (e.fragment = r(e.fragment)),
        e
      );
    },
    removeDotSegments: function (e) {
      const t = [];
      for (; e.length;)
        if (e.match(l)) e = e.replace(l, "");
        else if (e.match(u)) e = e.replace(u, "/");
        else if (e.match(p)) ((e = e.replace(p, "/")), t.pop());
        else if ("." === e || ".." === e) e = "";
        else {
          const r = e.match(d);
          if (!r) throw new Error("Unexpected dot segment condition");
          {
            const n = r[0];
            ((e = e.slice(n.length)), t.push(n));
          }
        }
      return t.join("");
    },
    normalizeIPv4: i,
    normalizeIPv6: s,
    stringArrayToHexStripped: o,
  };
};

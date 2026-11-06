module.exports = (e) => {
  "use strict";
  const t = /^[\da-f]{8}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{4}\b-[\da-f]{12}$/iu,
    r = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
  function n(e) {
    return "boolean" == typeof e.secure ? e.secure : "wss" === String(e.scheme).toLowerCase();
  }
  function i(e) {
    return (e.host || (e.error = e.error || "HTTP URIs must have a host."), e);
  }
  function o(e) {
    const t = "https" === String(e.scheme).toLowerCase();
    return (
      (e.port !== (t ? 443 : 80) && "" !== e.port) || (e.port = void 0),
      e.path || (e.path = "/"),
      e
    );
  }
  const s = { scheme: "http", domainHost: !0, parse: i, serialize: o },
    a = {
      scheme: "ws",
      domainHost: !0,
      parse: function (e) {
        return (
          (e.secure = n(e)),
          (e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : "")),
          (e.path = void 0),
          (e.query = void 0),
          e
        );
      },
      serialize: function (e) {
        if (
          ((e.port !== (n(e) ? 443 : 80) && "" !== e.port) || (e.port = void 0),
          "boolean" == typeof e.secure &&
            ((e.scheme = e.secure ? "wss" : "ws"), (e.secure = void 0)),
          e.resourceName)
        ) {
          const [t, r] = e.resourceName.split("?");
          ((e.path = t && "/" !== t ? t : void 0), (e.query = r), (e.resourceName = void 0));
        }
        return ((e.fragment = void 0), e);
      },
    },
    c = {
      http: s,
      https: { scheme: "https", domainHost: s.domainHost, parse: i, serialize: o },
      ws: a,
      wss: { scheme: "wss", domainHost: a.domainHost, parse: a.parse, serialize: a.serialize },
      urn: {
        scheme: "urn",
        parse: function (e, t) {
          if (!e.path) return ((e.error = "URN can not be parsed"), e);
          const n = e.path.match(r);
          if (n) {
            const r = t.scheme || e.scheme || "urn";
            ((e.nid = n[1].toLowerCase()), (e.nss = n[2]));
            const i = `${r}:${t.nid || e.nid}`,
              o = c[i];
            ((e.path = void 0), o && (e = o.parse(e, t)));
          } else e.error = e.error || "URN can not be parsed.";
          return e;
        },
        serialize: function (e, t) {
          const r = t.scheme || e.scheme || "urn",
            n = e.nid.toLowerCase(),
            i = `${r}:${t.nid || n}`,
            o = c[i];
          o && (e = o.serialize(e, t));
          const s = e,
            a = e.nss;
          return ((s.path = `${n || t.nid}:${a}`), (t.skipEscape = !0), s);
        },
        skipNormalize: !0,
      },
      "urn:uuid": {
        scheme: "urn:uuid",
        parse: function (e, r) {
          const n = e;
          return (
            (n.uuid = n.nss),
            (n.nss = void 0),
            r.tolerant || (n.uuid && t.test(n.uuid)) || (n.error = n.error || "UUID is not valid."),
            n
          );
        },
        serialize: function (e) {
          const t = e;
          return ((t.nss = (e.uuid || "").toLowerCase()), t);
        },
        skipNormalize: !0,
      },
    };
  e.exports = c;
};

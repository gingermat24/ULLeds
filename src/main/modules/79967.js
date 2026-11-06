module.exports = (e, t, r) => {
  const n = r(65964),
    i = r(97157),
    { ANY: o } = i,
    s = r(9733),
    a = r(31347),
    c = [new i(">=0.0.0-0")],
    l = [new i(">=0.0.0")],
    u = (e, t, r) => {
      if (e === t) return !0;
      if (1 === e.length && e[0].semver === o) {
        if (1 === t.length && t[0].semver === o) return !0;
        e = r.includePrerelease ? c : l;
      }
      if (1 === t.length && t[0].semver === o) {
        if (r.includePrerelease) return !0;
        t = l;
      }
      const n = new Set();
      let i, u, f, h, m, g, v;
      for (const t of e)
        ">" === t.operator || ">=" === t.operator
          ? (i = p(i, t, r))
          : "<" === t.operator || "<=" === t.operator
            ? (u = d(u, t, r))
            : n.add(t.semver);
      if (n.size > 1) return null;
      if (i && u) {
        if (((f = a(i.semver, u.semver, r)), f > 0)) return null;
        if (0 === f && (">=" !== i.operator || "<=" !== u.operator)) return null;
      }
      for (const e of n) {
        if (i && !s(e, String(i), r)) return null;
        if (u && !s(e, String(u), r)) return null;
        for (const n of t) if (!s(e, String(n), r)) return !1;
        return !0;
      }
      let y = !(!u || r.includePrerelease || !u.semver.prerelease.length) && u.semver,
        w = !(!i || r.includePrerelease || !i.semver.prerelease.length) && i.semver;
      y && 1 === y.prerelease.length && "<" === u.operator && 0 === y.prerelease[0] && (y = !1);
      for (const e of t) {
        if (
          ((v = v || ">" === e.operator || ">=" === e.operator),
          (g = g || "<" === e.operator || "<=" === e.operator),
          i)
        )
          if (
            (w &&
              e.semver.prerelease &&
              e.semver.prerelease.length &&
              e.semver.major === w.major &&
              e.semver.minor === w.minor &&
              e.semver.patch === w.patch &&
              (w = !1),
            ">" === e.operator || ">=" === e.operator)
          ) {
            if (((h = p(i, e, r)), h === e && h !== i)) return !1;
          } else if (">=" === i.operator && !s(i.semver, String(e), r)) return !1;
        if (u)
          if (
            (y &&
              e.semver.prerelease &&
              e.semver.prerelease.length &&
              e.semver.major === y.major &&
              e.semver.minor === y.minor &&
              e.semver.patch === y.patch &&
              (y = !1),
            "<" === e.operator || "<=" === e.operator)
          ) {
            if (((m = d(u, e, r)), m === e && m !== u)) return !1;
          } else if ("<=" === u.operator && !s(u.semver, String(e), r)) return !1;
        if (!e.operator && (u || i) && 0 !== f) return !1;
      }
      return !((i && g && !u && 0 !== f) || (u && v && !i && 0 !== f) || w || y);
    },
    p = (e, t, r) => {
      if (!e) return t;
      const n = a(e.semver, t.semver, r);
      return n > 0 ? e : n < 0 || (">" === t.operator && ">=" === e.operator) ? t : e;
    },
    d = (e, t, r) => {
      if (!e) return t;
      const n = a(e.semver, t.semver, r);
      return n < 0 ? e : n > 0 || ("<" === t.operator && "<=" === e.operator) ? t : e;
    };
  e.exports = (e, t, r = {}) => {
    if (e === t) return !0;
    ((e = new n(e, r)), (t = new n(t, r)));
    let i = !1;
    e: for (const n of e.set) {
      for (const e of t.set) {
        const t = u(n, e, r);
        if (((i = i || null !== t), t)) continue e;
      }
      if (i) return !1;
    }
    return !0;
  };
};

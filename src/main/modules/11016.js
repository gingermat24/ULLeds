module.exports = (e, t, r) => {
  const n = r(22715),
    i = r(9379),
    { ANY: o } = i,
    s = r(52014),
    a = r(13227),
    c = r(92503),
    l = r(5952),
    u = r(18349),
    p = r(26164);
  e.exports = (e, t, r, d) => {
    let f, h, m, g, v;
    switch (((e = new n(e, d)), (t = new s(t, d)), r)) {
      case ">":
        ((f = c), (h = u), (m = l), (g = ">"), (v = ">="));
        break;
      case "<":
        ((f = l), (h = p), (m = c), (g = "<"), (v = "<="));
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (a(e, t, d)) return !1;
    for (let r = 0; r < t.set.length; ++r) {
      const n = t.set[r];
      let s = null,
        a = null;
      if (
        (n.forEach((e) => {
          (e.semver === o && (e = new i(">=0.0.0")),
            (s = s || e),
            (a = a || e),
            f(e.semver, s.semver, d) ? (s = e) : m(e.semver, a.semver, d) && (a = e));
        }),
        s.operator === g || s.operator === v)
      )
        return !1;
      if ((!a.operator || a.operator === g) && h(e, a.semver)) return !1;
      if (a.operator === v && m(e, a.semver)) return !1;
    }
    return !0;
  };
};

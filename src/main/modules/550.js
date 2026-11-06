module.exports = (e, t, r) => {
  const n = r(51735),
    i = r(38458),
    o = r(92627);
  e.exports = (e, t) => {
    e = new i(e, t);
    let r = new n("0.0.0");
    if (e.test(r)) return r;
    if (((r = new n("0.0.0-0")), e.test(r))) return r;
    r = null;
    for (let t = 0; t < e.set.length; ++t) {
      const i = e.set[t];
      let s = null;
      (i.forEach((e) => {
        const t = new n(e.semver.version);
        switch (e.operator) {
          case ">":
            (0 === t.prerelease.length ? t.patch++ : t.prerelease.push(0), (t.raw = t.format()));
          case "":
          case ">=":
            (s && !o(t, s)) || (s = t);
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${e.operator}`);
        }
      }),
        !s || (r && !o(r, s)) || (r = s));
    }
    return r && e.test(r) ? r : null;
  };
};

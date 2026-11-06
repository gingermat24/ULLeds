module.exports = (e, t, r) => {
  const n = r(81025);
  e.exports = (e, t) => {
    const r = n(e, null, !0),
      i = n(t, null, !0),
      o = r.compare(i);
    if (0 === o) return null;
    const s = o > 0,
      a = s ? r : i,
      c = s ? i : r,
      l = !!a.prerelease.length;
    if (c.prerelease.length && !l)
      return c.patch || c.minor ? (a.patch ? "patch" : a.minor ? "minor" : "major") : "major";
    const u = l ? "pre" : "";
    return r.major !== i.major
      ? u + "major"
      : r.minor !== i.minor
        ? u + "minor"
        : r.patch !== i.patch
          ? u + "patch"
          : "prerelease";
  };
};

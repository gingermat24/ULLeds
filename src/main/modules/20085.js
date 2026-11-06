module.exports = (e, t, r) => {
  const n = r(92797),
    i = r(65964);
  e.exports = (e, t, r) => {
    let o = null,
      s = null,
      a = null;
    try {
      a = new i(t, r);
    } catch (e) {
      return null;
    }
    return (
      e.forEach((e) => {
        a.test(e) && ((o && 1 !== s.compare(e)) || ((o = e), (s = new n(o, r))));
      }),
      o
    );
  };
};

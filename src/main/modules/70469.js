module.exports = (e, t, r) => {
  const n = r(51735),
    i = r(38458);
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
        a.test(e) && ((o && -1 !== s.compare(e)) || ((o = e), (s = new n(o, r))));
      }),
      o
    );
  };
};

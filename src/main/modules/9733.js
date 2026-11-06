module.exports = (e, t, r) => {
  const n = r(65964);
  e.exports = (e, t, r) => {
    try {
      t = new n(t, r);
    } catch (e) {
      return !1;
    }
    return t.test(e);
  };
};

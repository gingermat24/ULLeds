module.exports = (e, t, r) => {
  const n = r(51735);
  e.exports = (e, t, r = !1) => {
    if (e instanceof n) return e;
    try {
      return new n(e, t);
    } catch (e) {
      if (!r) return null;
      throw e;
    }
  };
};

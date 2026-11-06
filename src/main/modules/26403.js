module.exports = (e, t, r) => {
  const n = r(65964);
  e.exports = (e, t) => {
    try {
      return new n(e, t).range || "*";
    } catch (e) {
      return null;
    }
  };
};

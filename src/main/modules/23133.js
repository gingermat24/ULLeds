module.exports = (e, t, r) => {
  const n = r(38458);
  e.exports = (e, t) => {
    try {
      return new n(e, t).range || "*";
    } catch (e) {
      return null;
    }
  };
};

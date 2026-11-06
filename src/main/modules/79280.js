module.exports = (e, t, r) => {
  const n = r(22715);
  e.exports = (e, t, r) => {
    const i = new n(e, r),
      o = new n(t, r);
    return i.compare(o) || i.compareBuild(o);
  };
};

module.exports = (e, t, r) => {
  const n = r(46443);
  e.exports = (e, t) => {
    const r = n(e.trim().replace(/^[=v]+/, ""), t);
    return r ? r.version : null;
  };
};

module.exports = (e, t, r) => {
  const n = r(1405);
  e.exports = (e, t) => {
    const r = n(e.trim().replace(/^[=v]+/, ""), t);
    return r ? r.version : null;
  };
};

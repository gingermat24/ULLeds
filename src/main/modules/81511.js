module.exports = (e, t, r) => {
  const n = r(81025);
  e.exports = (e, t) => {
    const r = n(e.trim().replace(/^[=v]+/, ""), t);
    return r ? r.version : null;
  };
};

module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromPromise,
    { makeDir: i, makeDirSync: o } = r(88761),
    s = n(i);
  e.exports = {
    mkdirs: s,
    mkdirsSync: o,
    mkdirp: s,
    mkdirpSync: o,
    ensureDir: s,
    ensureDirSync: o,
  };
};

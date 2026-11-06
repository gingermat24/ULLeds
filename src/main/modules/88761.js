module.exports = (e, t, r) => {
  "use strict";
  const n = r(67634),
    { checkPath: i } = r(32284),
    o = (e) => ("number" == typeof e ? e : { mode: 511, ...e }.mode);
  ((e.exports.makeDir = async (e, t) => (i(e), n.mkdir(e, { mode: o(t), recursive: !0 }))),
    (e.exports.makeDirSync = (e, t) => (i(e), n.mkdirSync(e, { mode: o(t), recursive: !0 }))));
};

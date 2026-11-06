module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    i = r(37048),
    o = r(38971);
  ((e.exports = (e, t) => (
    (t = Object.assign({ cwd: process.cwd() }, t)),
    o(e, (e) => i(n.resolve(t.cwd, e)), t)
  )),
    (e.exports.sync = (e, t) => {
      t = Object.assign({ cwd: process.cwd() }, t);
      for (const r of e) if (i.sync(n.resolve(t.cwd, r))) return r;
    }));
};

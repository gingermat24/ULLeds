module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromPromise,
    i = r(67634),
    o = r(16928),
    s = r(25233),
    a = r(5741),
    c = n(async function (e) {
      let t;
      try {
        t = await i.readdir(e);
      } catch {
        return s.mkdirs(e);
      }
      return Promise.all(t.map((t) => a.remove(o.join(e, t))));
    });
  function l(e) {
    let t;
    try {
      t = i.readdirSync(e);
    } catch {
      return s.mkdirsSync(e);
    }
    t.forEach((t) => {
      ((t = o.join(e, t)), a.removeSync(t));
    });
  }
  e.exports = { emptyDirSync: l, emptydirSync: l, emptyDir: c, emptydir: c };
};

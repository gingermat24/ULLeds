module.exports = (e, t, r) => {
  "use strict";
  const n = r(26252);
  class i extends Error {
    constructor(e) {
      (super(), (this.value = e));
    }
  }
  const o = (e, t) => Promise.resolve(e).then(t),
    s = (e) => Promise.all(e).then((e) => !0 === e[1] && Promise.reject(new i(e[0])));
  e.exports = (e, t, r) => {
    r = Object.assign({ concurrency: 1 / 0, preserveOrder: !0 }, r);
    const a = n(r.concurrency),
      c = [...e].map((e) => [e, a(o, e, t)]),
      l = n(r.preserveOrder ? 1 : 1 / 0);
    return Promise.all(c.map((e) => l(s, e)))
      .then(() => {})
      .catch((e) => (e instanceof i ? e.value : Promise.reject(e)));
  };
};

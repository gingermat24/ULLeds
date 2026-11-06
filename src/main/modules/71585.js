module.exports = (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = {},
    n = {
      next: (e) => {
        const t = r[e];
        if (!t) return;
        t.shift();
        const i = t[0];
        i ? i(() => n.next(e)) : delete r[e];
      },
      schedule: (e) =>
        new Promise((t) => {
          let i = r[e];
          (i || (i = r[e] = []), i.push(t), i.length > 1 || t(() => n.next(e)));
        }),
    };
  t.default = n;
};

module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(16928),
    i = r(22420),
    o = r(74621),
    s = {
      store: {},
      create: (e) => {
        const t = `000000${Math.floor(16777215 * Math.random()).toString(16)}`.slice(-6);
        return `${e}.tmp-${Date.now().toString().slice(-10)}${t}`;
      },
      get: (e, t, r = !0) => {
        const n = s.truncate(t(e));
        return n in s.store ? s.get(e, t, r) : ((s.store[n] = r), [n, () => delete s.store[n]]);
      },
      purge: (e) => {
        s.store[e] && (delete s.store[e], o.default.unlinkAttempt(e));
      },
      purgeSync: (e) => {
        s.store[e] && (delete s.store[e], o.default.unlinkSyncAttempt(e));
      },
      purgeSyncAll: () => {
        for (const e in s.store) s.purgeSync(e);
      },
      truncate: (e) => {
        const t = n.basename(e);
        if (t.length <= i.LIMIT_BASENAME_LENGTH) return e;
        const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
        if (!r) return e;
        const o = t.length - i.LIMIT_BASENAME_LENGTH;
        return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -o)}${r[3]}`;
      },
    };
  (process.on("exit", s.purgeSyncAll), (t.default = s));
};

module.exports = (e, t, r) => {
  "use strict";
  const n = r(39023);
  function i(e = {}) {
    const t = new WeakSet();
    return function (r, n) {
      if ("object" == typeof n && null !== n) {
        if (t.has(n)) return;
        t.add(n);
      }
      return o(0, n, e);
    };
  }
  function o(e, t, r = {}) {
    const n = !1 !== r?.serializeMapAndSet;
    return t instanceof Error
      ? t.stack
      : t
        ? "function" == typeof t
          ? `[function] ${t.toString()}`
          : t instanceof Date
            ? t.toISOString()
            : n && t instanceof Map && Object.fromEntries
              ? Object.fromEntries(t)
              : n && t instanceof Set && Array.from
                ? Array.from(t)
                : t
        : t;
  }
  e.exports = {
    serialize: o,
    maxDepth({ data: t, transport: r, depth: n = r?.depth ?? 6 }) {
      if (!t) return t;
      if (n < 1) return Array.isArray(t) ? "[array]" : "object" == typeof t && t ? "[object]" : t;
      if (Array.isArray(t)) return t.map((t) => e.exports.maxDepth({ data: t, depth: n - 1 }));
      if ("object" != typeof t) return t;
      if (t && "function" == typeof t.toISOString) return t;
      if (null === t) return null;
      if (t instanceof Error) return t;
      const i = {};
      for (const r in t)
        Object.prototype.hasOwnProperty.call(t, r) &&
          (i[r] = e.exports.maxDepth({ data: t[r], depth: n - 1 }));
      return i;
    },
    toJSON: ({ data: e }) => JSON.parse(JSON.stringify(e, i())),
    toString({ data: e, transport: t }) {
      const r = t?.inspectOptions || {},
        o = e.map((e) => {
          if (void 0 !== e)
            try {
              const t = JSON.stringify(e, i(), "  ");
              return void 0 === t ? void 0 : JSON.parse(t);
            } catch (t) {
              return e;
            }
        });
      return n.formatWithOptions(r, ...o);
    },
  };
};

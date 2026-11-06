module.exports = (e, t, r) => {
  e.exports = function (e) {
    function t(e) {
      let r,
        i,
        o,
        s = null;
      function a(...e) {
        if (!a.enabled) return;
        const n = a,
          i = Number(new Date()),
          o = i - (r || i);
        ((n.diff = o),
          (n.prev = r),
          (n.curr = i),
          (r = i),
          (e[0] = t.coerce(e[0])),
          "string" != typeof e[0] && e.unshift("%O"));
        let s = 0;
        ((e[0] = e[0].replace(/%([a-zA-Z%])/g, (r, i) => {
          if ("%%" === r) return "%";
          s++;
          const o = t.formatters[i];
          if ("function" == typeof o) {
            const t = e[s];
            ((r = o.call(n, t)), e.splice(s, 1), s--);
          }
          return r;
        })),
          t.formatArgs.call(n, e),
          (n.log || t.log).apply(n, e));
      }
      return (
        (a.namespace = e),
        (a.useColors = t.useColors()),
        (a.color = t.selectColor(e)),
        (a.extend = n),
        (a.destroy = t.destroy),
        Object.defineProperty(a, "enabled", {
          enumerable: !0,
          configurable: !1,
          get: () =>
            null !== s ? s : (i !== t.namespaces && ((i = t.namespaces), (o = t.enabled(e))), o),
          set: (e) => {
            s = e;
          },
        }),
        "function" == typeof t.init && t.init(a),
        a
      );
    }
    function n(e, r) {
      const n = t(this.namespace + (void 0 === r ? ":" : r) + e);
      return ((n.log = this.log), n);
    }
    function i(e, t) {
      let r = 0,
        n = 0,
        i = -1,
        o = 0;
      for (; r < e.length;)
        if (n < t.length && (t[n] === e[r] || "*" === t[n]))
          "*" === t[n] ? ((i = n), (o = r), n++) : (r++, n++);
        else {
          if (-1 === i) return !1;
          ((n = i + 1), o++, (r = o));
        }
      for (; n < t.length && "*" === t[n];) n++;
      return n === t.length;
    }
    return (
      (t.debug = t),
      (t.default = t),
      (t.coerce = function (e) {
        return e instanceof Error ? e.stack || e.message : e;
      }),
      (t.disable = function () {
        const e = [...t.names, ...t.skips.map((e) => "-" + e)].join(",");
        return (t.enable(""), e);
      }),
      (t.enable = function (e) {
        (t.save(e), (t.namespaces = e), (t.names = []), (t.skips = []));
        const r = ("string" == typeof e ? e : "")
          .trim()
          .replace(" ", ",")
          .split(",")
          .filter(Boolean);
        for (const e of r) "-" === e[0] ? t.skips.push(e.slice(1)) : t.names.push(e);
      }),
      (t.enabled = function (e) {
        for (const r of t.skips) if (i(e, r)) return !1;
        for (const r of t.names) if (i(e, r)) return !0;
        return !1;
      }),
      (t.humanize = r(24394)),
      (t.destroy = function () {
        console.warn(
          "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.",
        );
      }),
      Object.keys(e).forEach((r) => {
        t[r] = e[r];
      }),
      (t.names = []),
      (t.skips = []),
      (t.formatters = {}),
      (t.selectColor = function (e) {
        let r = 0;
        for (let t = 0; t < e.length; t++) ((r = (r << 5) - r + e.charCodeAt(t)), (r |= 0));
        return t.colors[Math.abs(r) % t.colors.length];
      }),
      t.enable(t.load()),
      t
    );
  };
};

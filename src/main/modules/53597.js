module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(38845),
    i = r(59702),
    o = r(94040),
    s = new o.Name("fullFormats"),
    a = new o.Name("fastFormats"),
    c = (e, t = { keywords: !0 }) => {
      if (Array.isArray(t)) return (l(e, t, n.fullFormats, s), e);
      const [r, o] = "fast" === t.mode ? [n.fastFormats, a] : [n.fullFormats, s];
      return (l(e, t.formats || n.formatNames, r, o), t.keywords && i.default(e), e);
    };
  function l(e, t, r, n) {
    var i, s;
    (null !== (i = (s = e.opts.code).formats) && void 0 !== i) ||
      (s.formats = o._`require("ajv-formats/dist/formats").${n}`);
    for (const n of t) e.addFormat(n, r[n]);
  }
  ((c.get = (e, t = "full") => {
    const r = ("fast" === t ? n.fastFormats : n.fullFormats)[e];
    if (!r) throw new Error(`Unknown format "${e}"`);
    return r;
  }),
    (e.exports = t = c),
    Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.default = c));
};

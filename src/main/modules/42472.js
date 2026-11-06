module.exports = (e, t) => {
  "use strict";
  var r;
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.OperationKind = void 0),
    (t.computeOperations = function (e, t, n) {
      const s = o(e.files),
        a = o(t.files);
      let c = null;
      const l = t.files[0],
        u = [],
        p = l.name,
        d = s.get(p);
      if (null == d) throw new Error(`no file ${p} in old blockmap`);
      const f = a.get(p);
      let h = 0;
      const { checksumToOffset: m, checksumToOldSize: g } = (function (e, t, r) {
        const n = new Map(),
          i = new Map();
        let o = t;
        for (let t = 0; t < e.checksums.length; t++) {
          const s = e.checksums[t],
            a = e.sizes[t],
            c = i.get(s);
          if (void 0 === c) (n.set(s, o), i.set(s, a));
          else if (null != r.debug) {
            const e = c === a ? "(same size)" : `(size: ${c}, this size: ${a})`;
            r.debug(
              `${s} duplicated in blockmap ${e}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`,
            );
          }
          o += a;
        }
        return { checksumToOffset: n, checksumToOldSize: i };
      })(s.get(p), d.offset, n);
      let v = l.offset;
      for (let e = 0; e < f.checksums.length; v += f.sizes[e], e++) {
        const t = f.sizes[e],
          o = f.checksums[e];
        let s = m.get(o);
        (null != s &&
          g.get(o) !== t &&
          (n.warn(`Checksum ("${o}") matches, but size differs (old: ${g.get(o)}, new: ${t})`),
          (s = void 0)),
          void 0 === s
            ? (h++,
              null != c && c.kind === r.DOWNLOAD && c.end === v
                ? (c.end += t)
                : ((c = { kind: r.DOWNLOAD, start: v, end: v + t }), i(c, u, o, e)))
            : null != c && c.kind === r.COPY && c.end === s
              ? (c.end += t)
              : ((c = { kind: r.COPY, start: s, end: s + t }), i(c, u, o, e)));
      }
      return (
        h > 0 && n.info(`File${"file" === l.name ? "" : " " + l.name} has ${h} changed blocks`),
        u
      );
    }),
    (function (e) {
      ((e[(e.COPY = 0)] = "COPY"), (e[(e.DOWNLOAD = 1)] = "DOWNLOAD"));
    })(r || (t.OperationKind = r = {})));
  const n = "true" === process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES;
  function i(e, t, i, o) {
    if (n && 0 !== t.length) {
      const n = t[t.length - 1];
      if (n.kind === e.kind && e.start < n.end && e.start > n.start) {
        const t = [n.start, n.end, e.start, e.end].reduce((e, t) => (e < t ? e : t));
        throw new Error(
          `operation (block index: ${o}, checksum: ${i}, kind: ${r[e.kind]}) overlaps previous operation (checksum: ${i}):\nabs: ${n.start} until ${n.end} and ${e.start} until ${e.end}\nrel: ${n.start - t} until ${n.end - t} and ${e.start - t} until ${e.end - t}`,
        );
      }
    }
    t.push(e);
  }
  function o(e) {
    const t = new Map();
    for (const r of e) t.set(r.name, r);
    return t;
  }
};

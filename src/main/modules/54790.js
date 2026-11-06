module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      getAroundAreaAvgColors: () => s,
      getAroundAreaCenterColors: () => a,
      getCenterAreaAvgColors: () => i,
      getCenterAreaCenterColors: () => o,
      getColsAndRows: () => c,
    }));
  const { getAspectRatio: n } = r(2930),
    i = (e, t, r, n, i, o) => {
      const s = t / n,
        a = r / n,
        c = Math.floor(0.2 * s),
        l = Math.ceil(0.8 * s),
        u = Math.floor(0.2 * a),
        p = l - c,
        d = Math.ceil(0.8 * a) - u,
        f = [];
      for (let t = 0; t < o; t++)
        for (let r = 0; r < i; r++) {
          let n = 0,
            a = 0,
            l = 0,
            h = 0;
          const m = Math.round(c + (r / i) * p),
            g = Math.round(c + ((r + 1) / i) * p),
            v = Math.round(u + (t / o) * d),
            y = Math.round(u + ((t + 1) / o) * d);
          for (let t = v; t < y; t++)
            for (let r = m; r < g; r++) {
              const i = e[t * s + r];
              i && ((n += i.red), (a += i.green), (l += i.blue), h++);
            }
          let w = 0,
            b = 0,
            x = 0;
          (h > 0 && ((w = Math.round(n / h)), (b = Math.round(a / h)), (x = Math.round(l / h))),
            f.push({ red: w, green: b, blue: x }));
        }
      return f;
    },
    o = (e, t, r, n, i, o) => {
      const s = t / n,
        a = r / n,
        c = Math.floor(0.2 * s),
        l = Math.ceil(0.8 * s),
        u = Math.floor(0.2 * a),
        p = l - c,
        d = Math.ceil(0.8 * a) - u,
        f = [];
      for (let t = 0; t < o; t++)
        for (let r = 0; r < i; r++) {
          const n = Math.round(c + (r + 0.5) * (p / i)),
            a = e[Math.round(u + (t + 0.5) * (d / o)) * s + n];
          f.push(a);
        }
      return f;
    },
    s = (e, t, r, n, i, o) => {
      const s = t / n,
        a = r / n,
        c = Math.floor(s / i),
        l = Math.floor(a / o),
        u = [];
      for (let t = 0; t < o; t++)
        for (let r = 0; r < i; r++) {
          let n = 0,
            i = 0,
            o = 0,
            a = 0;
          for (let u = t * l; u < (t + 1) * l; u++)
            for (let t = r * c; t < (r + 1) * c; t++) {
              const r = e[Math.floor(u * s + t)];
              ((n += r.red), (i += r.green), (o += r.blue), a++);
            }
          const p = Math.round(n / a),
            d = Math.round(i / a),
            f = Math.round(o / a);
          u.push({ red: p, green: d, blue: f });
        }
      return u;
    },
    a = (e, t, r, n, i, o) => {
      const s = t / n,
        a = r / n,
        c = Math.floor(s / i),
        l = Math.floor(a / o),
        u = [];
      for (let t = 0; t < o; t++)
        for (let r = 0; r < i; r++) {
          const n = r * c + Math.floor(c / 2),
            i = t * l + Math.floor(l / 2),
            o = e[Math.floor(i * s + n)];
          u.push(o);
        }
      return u;
    },
    c = (e, t, r, i) => {
      const o = "000100" === e || "000101" === e || "000102" === e || "000103" === e,
        { cols: s, rows: a } = n(r.aspectRatio.aspectWidth, r.aspectRatio.aspectHeight);
      return 8 === e.length || "888888" === e || "000608" === e
        ? { cols: s, rows: a }
        : o
          ? { cols: 6, rows: 5 }
          : t >= 2 * (s + a)
            ? { cols: s, rows: a }
            : t < 2 * (s + a) && t >= 22
              ? { cols: 6, rows: 5 }
              : "keyboard" === i
                ? { cols: 21, rows: 6 }
                : { cols: 3, rows: 2 };
    };
};

module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      borderIndexes: () => o,
      displaySize: () => i,
      getAspectRatio: () => s,
      matchMonitorSize: () => n,
    }));
  const n = (e, t) => {
      const r = Math.sqrt(Math.pow(e, 2) + Math.pow(t, 2)),
        n = Math.floor(r / 25.4);
      let i = 24;
      return (
        n >= 23 && n <= 25
          ? (i = 24)
          : n >= 26 && n <= 30
            ? (i = 27)
            : n >= 31 && n <= 32
              ? (i = 32)
              : n >= 33
                ? (i = 34)
                : n >= 42 && (i = 42),
        i
      );
    },
    i = (e, t) => (Math.sqrt(Math.pow(e, 2) + Math.pow(t, 2)) / 25.4).toFixed(2),
    o = (e, t) => {
      const r = [],
        n = [],
        i = [],
        o = [],
        s = [],
        a = [],
        c = [],
        l = [],
        u = [],
        p = [],
        d = [],
        f = [];
      for (let t = 0; t < e; t++) r.push(t);
      for (let r = e * (t - (t - 1)); r < e * (t - (t - 2)); r++) n.push(r);
      for (let r = e * (t - 1); r < e * t; r++) i.push(r);
      for (let r = e * (t - 2); r < e * (t - 1); r++) o.push(r);
      for (let r = 0; r < t; r++)
        (s.push(r * e), a.push(r * e + 1), c.push(r * e + 2), l.push(r * e + 3));
      for (let r = 0; r < t; r++)
        (u.push(r * e + (e - 1)),
          p.push(r * e + (e - 2)),
          d.push(r * e + (e - 3)),
          f.push(r * e + (e - 4)));
      return {
        topIndexes1: r,
        topIndexes2: n,
        bottomIndexes1: i,
        bottomIndexes2: o,
        leftIndexes1: s,
        leftIndexes2: a,
        leftIndexes3: c,
        leftIndexes4: l,
        rightIndexes1: u,
        rightIndexes2: p,
        rightIndexes3: d,
        rightIndexes4: f,
      };
    },
    s = (e, t) => {
      let r = {};
      switch (Math.floor((e / t) * 10) / 10) {
        case Math.floor((16 / 9) * 10) / 10:
          r = { cols: 16, rows: 9, realCols: 16, realRows: 9 };
          break;
        case Math.floor(16) / 10:
          r = { cols: 8, rows: 5, realCols: 16, realRows: 10 };
          break;
        case Math.floor((1512 / 982) * 10) / 10:
          r = { cols: 8, rows: 5, realCols: 1512, realRows: 982 };
          break;
        case Math.floor((4 / 3) * 10) / 10:
          r = { cols: 4, rows: 3, realCols: 4, realRows: 3 };
          break;
        case Math.floor(15) / 10:
          r = { cols: 6, rows: 4, realCols: 3, realRows: 2 };
          break;
        case Math.floor(12.5) / 10:
          r = { cols: 10, rows: 8, realCols: 5, realRows: 4 };
          break;
        case Math.floor((5 / 3) * 10) / 10:
          r = { cols: 10, rows: 6, realCols: 5, realRows: 3 };
          break;
        case Math.floor((21 / 9) * 10) / 10:
          r = { cols: 16, rows: 9, realCols: 21, realRows: 9 };
          break;
        case Math.floor((32 / 9) * 10) / 10:
          r = { cols: 16, rows: 9, realCols: 32, realRows: 9 };
          break;
        default:
          r = { cols: 6, rows: 4, realCols: 3, realRows: 2 };
      }
      return r;
    };
};

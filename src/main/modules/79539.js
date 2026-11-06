module.exports = (e, t, r) => {
  "use strict";
  (r.r(t), r.d(t, { lowLight: () => s, lowLightForSync: () => a, removeBlackEdges: () => u }));
  const n = ["000b00", "00000100", "00000101", "00000102", "00000103", "00000104", "00000105"],
    { store: i } = r(81687),
    o = (e, t, r, n) => {
      if (void 0 === i.get("syncSaturation") || !i.get("syncSaturation")) return [e, t, r];
      let [o, s, a] = [e / 255, t / 255, r / 255];
      const c = Math.max(o, s, a),
        l = Math.min(o, s, a);
      let u, p;
      const d = (c + l) / 2;
      if (c === l) u = p = 0;
      else {
        const e = c - l;
        switch (((p = d > 0.5 ? e / (2 - c - l) : e / (c + l)), c)) {
          case o:
            u = (s - a) / e + (s < a ? 6 : 0);
            break;
          case s:
            u = (a - o) / e + 2;
            break;
          case a:
            u = (o - s) / e + 4;
        }
        u /= 6;
      }
      p = Math.min(p * n, 1);
      const f = (e, t, r) => (
        r < 0 && (r += 1),
        r > 1 && (r -= 1),
        r < 1 / 6
          ? e + 6 * (t - e) * r
          : r < 0.5
            ? t
            : r < 2 / 3
              ? e + (t - e) * (2 / 3 - r) * 6
              : e
      );
      if (0 === p) o = s = a = d;
      else {
        const e = d < 0.5 ? d * (1 + p) : d + p - d * p,
          t = 2 * d - e;
        ((o = f(t, e, u + 1 / 3)), (s = f(t, e, u)), (a = f(t, e, u - 1 / 3)));
      }
      return [Math.round(255 * o), Math.round(255 * s), Math.round(255 * a)];
    },
    s = (e, t) => {
      if ((void 0 !== i.get("isLightCompression") && !i.get("isLightCompression")) || n.includes(e))
        return t;
      const r = t.reduce((e, t) => e + t, 0);
      if (r > 255) {
        const e = r / 255;
        for (let r = 0; r < t.length; r++) t[r] = parseInt(t[r] / e, 10);
      }
      return t;
    },
    a = (e, t) => {
      const r = void 0 === i.get("isLightCompression") ? 1 : i.get("isLightCompression");
      for (let i = 0; i < t.length; i += 5) {
        const s = i + 1,
          a = i + 2,
          c = i + 3,
          l = t[s],
          u = t[a],
          p = t[c],
          d = o(l, u, p, 3);
        ((t[s] = d[0]), (t[a] = d[1]), (t[c] = d[2]));
        const f = l + u + p;
        if (r && !n.includes(e) && f > 255) {
          const e = f / 255,
            r = parseInt(l / e, 10),
            n = parseInt(u / e, 10),
            i = parseInt(p / e, 10);
          ((t[s] = r), (t[a] = n), (t[c] = i));
        }
      }
      return t;
    },
    c = (e) =>
      e.map((e) => ((e) => e.every((e) => 0 === e.red && 0 === e.green && 0 === e.blue))(e)),
    l = (e, t, r) => {
      const n = [];
      for (let i = 0; i < t; i++) for (let t = 0; t < e; t++) n.push(r[t][i]);
      return n;
    },
    u = (e, t, r) => {
      const n = Array.from({ length: e }, () => []),
        i = Array.from({ length: t }, () => []);
      for (let t = 0; t < r.length; t++) {
        const o = t % e,
          s = Math.floor(t / e);
        ((n[o][s] = r[t]), (i[s][o] = r[t]));
      }
      const o = c(i),
        s = c(n),
        a = i[1],
        u = i[2],
        p = i[3],
        d = i[4],
        f = i[5],
        h = i[6],
        m = i[7],
        g = n[1],
        v = n[2],
        y = n[3],
        w = n[4],
        b = n[5],
        x = n[6],
        E = n[7],
        _ = n[8],
        S = n[9],
        I = n[10],
        $ = n[11],
        O = n[12],
        R = n[13],
        P = n[14];
      if (16 === e && 9 === t) {
        if (o[0] && o[1] && o[2] && o[6] && o[7] && o[8])
          return (
            (i[0] = p),
            (i[1] = p),
            (i[2] = p),
            (i[3] = d),
            (i[5] = d),
            (i[6] = f),
            (i[7] = f),
            (i[8] = f),
            i.flat()
          );
        if (o[0] && o[1] && o[7] && o[8])
          return ((i[0] = u), (i[1] = u), (i[2] = p), (i[6] = f), (i[7] = h), (i[8] = h), i.flat());
        if (o[0] && o[8]) return ((i[0] = a), (i[8] = m), i.flat());
        if (
          s[0] &&
          s[1] &&
          s[2] &&
          s[3] &&
          s[4] &&
          s[5] &&
          s[6] &&
          s[9] &&
          s[10] &&
          s[11] &&
          s[12] &&
          s[13] &&
          s[14] &&
          s[15]
        )
          return (
            (n[0] = E),
            (n[1] = E),
            (n[2] = E),
            (n[3] = E),
            (n[4] = E),
            (n[5] = E),
            (n[6] = E),
            (n[7] = E),
            (n[8] = _),
            (n[9] = _),
            (n[10] = _),
            (n[11] = _),
            (n[12] = _),
            (n[13] = _),
            (n[14] = _),
            (n[15] = _),
            l(e, t, n)
          );
        if (
          s[0] &&
          s[1] &&
          s[2] &&
          s[3] &&
          s[4] &&
          s[5] &&
          s[10] &&
          s[11] &&
          s[12] &&
          s[13] &&
          s[14] &&
          s[15]
        )
          return (
            (n[0] = x),
            (n[1] = x),
            (n[2] = x),
            (n[3] = x),
            (n[4] = E),
            (n[5] = E),
            (n[6] = E),
            (n[7] = E),
            (n[8] = _),
            (n[9] = _),
            (n[10] = _),
            (n[11] = _),
            (n[12] = S),
            (n[13] = S),
            (n[14] = S),
            (n[15] = S),
            l(e, t, n)
          );
        if (s[0] && s[1] && s[2] && s[3] && s[4] && s[11] && s[12] && s[13] && s[14] && s[15])
          return (
            (n[0] = b),
            (n[1] = b),
            (n[2] = b),
            (n[3] = x),
            (n[4] = x),
            (n[5] = x),
            (n[6] = E),
            (n[9] = _),
            (n[10] = S),
            (n[11] = S),
            (n[12] = S),
            (n[13] = I),
            (n[14] = I),
            (n[15] = I),
            l(e, t, n)
          );
        if (s[0] && s[1] && s[2] && s[3] && s[12] && s[13] && s[14] && s[15])
          return (
            (n[0] = w),
            (n[1] = w),
            (n[2] = b),
            (n[3] = b),
            (n[4] = x),
            (n[5] = x),
            (n[6] = E),
            (n[9] = _),
            (n[10] = S),
            (n[11] = S),
            (n[12] = I),
            (n[13] = I),
            (n[14] = $),
            (n[15] = $),
            l(e, t, n)
          );
        if (s[0] && s[1] && s[2] && s[13] && s[14] && s[15])
          return (
            (n[0] = y),
            (n[1] = y),
            (n[2] = w),
            (n[3] = w),
            (n[4] = b),
            (n[11] = I),
            (n[12] = $),
            (n[13] = $),
            (n[14] = O),
            (n[15] = O),
            l(e, t, n)
          );
        if (s[0] && s[1] && s[14] && s[15])
          return (
            (n[0] = v),
            (n[1] = v),
            (n[2] = y),
            (n[13] = O),
            (n[14] = R),
            (n[15] = R),
            l(e, t, n)
          );
        if (s[0] && s[15]) return ((n[0] = g), (n[15] = P), l(e, t, n));
      } else if (8 === e && 5 === t) {
        if (o[0] && o[4]) return ((i[0] = a), (i[4] = p), i.flat());
        if (s[0] && s[1] && s[2] && s[5] && s[6] && s[7])
          return (
            (n[0] = y),
            (n[1] = y),
            (n[2] = y),
            (n[3] = y),
            (n[4] = w),
            (n[5] = w),
            (n[6] = w),
            (n[7] = w),
            l(e, t, n)
          );
        if (s[0] && s[1] && s[6] && s[7])
          return (
            (n[0] = v),
            (n[1] = v),
            (n[2] = y),
            (n[5] = w),
            (n[6] = b),
            (n[7] = b),
            l(e, t, n)
          );
        if (s[0] && s[7]) return ((n[0] = g), (n[7] = x), l(e, t, n));
      } else if (6 === e && 5 === t) {
        if (o[0] && o[4]) return ((i[0] = a), (i[4] = p), i.flat());
        if (s[0] && s[1] && s[4] && s[5])
          return (
            (n[0] = v),
            (n[1] = v),
            (n[2] = v),
            (n[3] = y),
            (n[4] = y),
            (n[5] = y),
            l(e, t, n)
          );
        if (s[0] && s[7]) return ((n[0] = g), (n[5] = w), l(e, t, n));
      }
      return r;
    };
};

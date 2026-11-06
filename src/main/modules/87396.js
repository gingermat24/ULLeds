module.exports = (e, t, r) => {
  "use strict";
  (r.r(t), r.d(t, { setSyncScreen: () => T }));
  var n = r(84154),
    i = r(79539);
  const { convertToBlack: o, isCloseToBlack: s, rgbChangerBili: a } = r(32071),
    { matchMonitorSize: c, borderIndexes: l } = r(2930),
    { ajustColorOrder: u } = r(42127),
    p = class {
      constructor(e, t, r, n, i, o, s, a, c, u, p) {
        ((this.screenColors = e),
          (this.location = t),
          (this.lampsAmount = r),
          (this.wireMap = n),
          (this.currentMonitor = i),
          (this.installationMethod = o),
          (this.edgeNumber = s),
          (this.monitorSizes = a),
          (this.displaySize = c),
          (this.cols = u),
          (this.rows = p),
          (this.thresholdTint = 20),
          (this.thresholdBlack = 10));
        const {
          topIndexes1: d,
          topIndexes2: f,
          bottomIndexes1: h,
          bottomIndexes2: m,
          leftIndexes1: g,
          leftIndexes2: v,
          leftIndexes3: y,
          leftIndexes4: w,
          rightIndexes1: b,
          rightIndexes2: x,
          rightIndexes3: E,
          rightIndexes4: _,
        } = l(u, p);
        ((this.topIndexes1 = d),
          (this.topIndexes2 = f),
          (this.bottomIndexes1 = h),
          (this.bottomIndexes2 = m),
          (this.leftIndexes1 = g),
          (this.leftIndexes2 = v),
          (this.leftIndexes3 = y),
          (this.leftIndexes4 = w),
          (this.rightIndexes1 = b),
          (this.rightIndexes2 = x),
          (this.rightIndexes3 = E),
          (this.rightIndexes4 = _));
      }
      avgScreenColor() {
        const e = this.screenColors;
        let t = 0,
          r = 0,
          n = 0,
          i = 0;
        for (let o = 0; o < e.length; o++) {
          const s = e[o];
          s.red + s.green + s.blue > 20 && ((t += s.red), (r += s.green), (n += s.blue), (i += 1));
        }
        return { red: parseInt(t / i, 10), green: parseInt(r / i, 10), blue: parseInt(n / i, 10) };
      }
      avgScreenLeftRightColor() {
        const e = this.screenColors,
          t = this.cols,
          r = this.rows,
          n = this.arrayToMatrix(e, r, t),
          i = Math.ceil(t / 2),
          o = n.map((e) => e.slice(0, i)).flat(),
          s = n.map((e) => e.slice(i)).flat();
        let a = 0,
          c = 0,
          l = 0,
          u = 0,
          p = 0,
          d = 0;
        for (let e = 0; e < i; e++)
          ((a += o[e].red),
            (c += o[e].green),
            (l += o[e].blue),
            (u += s[e].red),
            (p += s[e].green),
            (d += s[e].blue));
        return [
          { red: parseInt(a / i, 10), green: parseInt(c / i, 10), blue: parseInt(l / i, 10) },
          { red: parseInt(u / i, 10), green: parseInt(p / i, 10), blue: parseInt(d / i, 10) },
        ];
      }
      backSideColors(e, t) {
        const r = this.screenColors,
          n = this.thresholdBlack,
          i = this.topIndexes1.map((e) => r[e]).every((e) => s(e, n))
            ? [...this.topIndexes2]
            : [...this.topIndexes1],
          o = [...this.rightIndexes1],
          a = this.bottomIndexes1.map((e) => r[e]).every((e) => s(e, n))
            ? [...this.bottomIndexes2]
            : [...this.bottomIndexes1],
          c = [...this.leftIndexes1],
          l = [];
        (l.push(...c.reverse()), l.push(...i), l.push(...o), 4 === t && l.push(...a.reverse()));
        const u = [];
        return (
          u.push(...o.reverse()),
          u.push(...i.reverse()),
          u.push(...c.reverse()),
          4 === t && u.push(...a.reverse()),
          e ? u.map((e) => r[e]) : l.map((e) => r[e])
        );
      }
      caculate2dArrayChild(e) {
        let t = 0;
        for (let r = 0; r < e.length; r++) t += e[r].length;
        return t;
      }
      arrayChildCount(e) {
        return e.map((e, t) => ({ index: t, count: e.length ? e.length : 1 }));
      }
      getBackSideProto() {
        const e = this.installationMethod,
          t = this.edgeNumber,
          r = this.monitorSizes,
          n = this.displaySize,
          i = this.wireMap,
          s = this.currentMonitor,
          a = this.lampsAmount,
          l = [...this.rightIndexes1],
          p = [...this.leftIndexes1],
          d = [],
          f = [],
          h = [],
          m = [],
          g = [],
          v = [],
          y = this.backSideColors(e, t);
        p.reverse();
        const { widthMM: w, heightMM: b } = s,
          x = w / b;
        let E = 3 === t ? (a * x) / (x + 2) : (a * x) / (2 * (1 + x)),
          _ = E / x;
        if (r && n > 0 && Object.prototype.hasOwnProperty.call(r, n))
          ((E = r[n] ? r[n].horizontalLamps : r[24].horizontalLamps),
            (_ = r[n] ? r[n].vaticleLamps : r[24].vaticleLamps));
        else if (r) {
          const e = c(w, b);
          ((E = r[e] ? r[e].horizontalLamps : r[24].horizontalLamps),
            (_ = r[e] ? r[e].vaticleLamps : r[24].vaticleLamps));
        }
        const S = parseInt(E, 10),
          I = parseInt(_, 10),
          $ = this.topIndexes1.length,
          O = this.leftIndexes1.length,
          R = Math.floor(S / $),
          P = Math.floor(I / O),
          A = S % $,
          T = I % O;
        let k = 0;
        r || (k = 3 === t ? a - S - 2 * I : a - 2 * (S + I));
        for (let e = 0; e < this.topIndexes1.length; e++) {
          const t = this.topIndexes1[e];
          let r = [];
          ((r = [].concat(Array(R).fill(t))), h.push(r));
        }
        for (let e = 0; e < A; e++) {
          const t = this.caculate2dArrayChild(h),
            r = h.length;
          if (t < S) {
            const t = r - 1 - e;
            h[t].length && (e % 2 == 0 ? h[t].push(h[t][0]) : h[r - t].push(h[r - t][0]));
          }
        }
        for (let e = 0; e < l.length; e++) {
          const t = l[e];
          let r = [];
          ((r = [].concat(Array(P).fill(t))), v.push(r));
        }
        for (let e = 0; e < T; e++) {
          const t = this.caculate2dArrayChild(v),
            r = v.length,
            n = r - 1 - e;
          t < I && (e % 2 == 0 ? v[r - n].push(v[r - n][0]) : v[n].push(v[n][0]));
        }
        for (let e = 0; e < this.bottomIndexes1.length; e++) {
          const t = this.bottomIndexes1[e];
          let r = [];
          ((r = [].concat(Array(R).fill(t))), m.push(r));
        }
        for (let e = 0; e < A; e++) {
          const t = this.caculate2dArrayChild(m),
            r = m.length;
          if (t < S) {
            const t = e + 1;
            m[t].length && (e % 2 == 0 ? m[r - t].push(m[r - t][0]) : m[t].push(m[t][0]));
          }
        }
        for (let e = 0; e < p.length; e++) {
          const t = p[e];
          let r = [];
          ((r = [].concat(Array(P).fill(t))), g.push(r));
        }
        for (let e = 0; e < T; e++) {
          const t = this.caculate2dArrayChild(g),
            r = g.length,
            n = r - 1 - e;
          t < I && (e % 2 == 0 ? g[n].push(g[n][0]) : g[r - n].push(g[r - n][0]));
        }
        for (let e = 0; e < k; e++) {
          const t = e % $;
          if (0 === t) g[e] && g[e].length && g[e].push(g[e][0]);
          else if (1 === t) h[e] && h[e].length && h[e].push(h[e][0]);
          else if (2 === t) v[e] && v[e].length && v[e].push(v[e][0]);
          else {
            const t = e + 1;
            h[t] && h[t].length && h[t].push(h[t][0]);
          }
        }
        e
          ? (f.push(...v.reverse()),
            f.push(...h.reverse()),
            f.push(...g.reverse()),
            4 === t && f.push(...m))
          : (f.push(...g), f.push(...h), f.push(...v), 4 === t && f.push(...m.reverse()));
        const N = this.arrayChildCount(f);
        let C = 0,
          L = C + 1;
        for (let e = 0; e < y.length; e++) {
          L = 0 === e ? 1 : C + 1;
          const t = y[e],
            r = u(t, i),
            n = o(r, this.thresholdTint);
          ((C += N[e].count), d.push(L), d.push(n.r), d.push(n.g), d.push(n.b), d.push(C));
        }
        return d;
      }
      otherSideColors(e, t) {
        const r = this.screenColors;
        let n = [],
          i = [],
          o = [];
        switch (e) {
          case 2:
            n = this.topIndexes1.map((e) => r[e]);
            break;
          case 3:
            n = this.bottomIndexes1.map((e) => r[e]);
            break;
          case 4:
            n = this.leftIndexes1.map((e) => r[e]).reverse();
            break;
          case 5:
            n = this.rightIndexes1.map((e) => r[e]).reverse();
            break;
          case 6:
            ((i = this.leftIndexes1.map((e) => r[e]).reverse()),
              (o = this.rightIndexes1.map((e) => r[e]).reverse()),
              (n = [...i, ...o]));
            break;
          case 7:
            n = [this.avgScreenColor(r)];
            break;
          case 8:
            n = t ? this.avgScreenLeftRightColor(r).reverse() : this.avgScreenLeftRightColor(r);
            break;
          default:
            n = [];
        }
        return n;
      }
      getLeftAndRightSidesProto() {
        const e = this.installationMethod,
          t = this.wireMap,
          r = this.lampsAmount / 2,
          n = this.location,
          i = [...this.rightIndexes1],
          s = [...this.leftIndexes1],
          a = [],
          c = [],
          l = [],
          p = [],
          d = this.otherSideColors(n, e),
          f = this.leftIndexes1.length,
          h = Math.floor(r / f),
          m = r % f;
        for (let e = 0; e < s.length; e++) {
          const t = s[e];
          let r = [];
          ((r = [].concat(Array(h).fill(t))), c.push(r));
        }
        for (let e = 0; e < m; e++) {
          const t = c.length,
            r = t - 1 - e;
          c[r].length && (e % 2 == 0 ? c[r].push(c[r][0]) : c[t - r].push(c[t - r][0]));
        }
        for (let e = 0; e < i.length; e++) {
          const t = i[e];
          let r = [];
          ((r = [].concat(Array(h).fill(t))), l.push(r));
        }
        for (let e = 0; e < m; e++) {
          const t = l.length,
            r = t - 1 - e;
          l[r].length && (e % 2 == 0 ? l[t - r].push(l[t - r][0]) : l[r].push(l[r][0]));
        }
        (a.push(...c), a.push(...l));
        let g = d;
        if (e) {
          const e = g.length / 2,
            t = g.slice(e),
            r = g.slice(0, e);
          g = t.concat(r);
        }
        const v = this.arrayChildCount(a);
        let y = 0,
          w = y + 1;
        for (let e = 0; e < g.length; e++) {
          w = 0 === e ? 1 : y + 1;
          const r = g[e],
            n = u(r, t),
            i = o(n, this.thresholdTint);
          ((y += v[e].count), p.push(w), p.push(i.r), p.push(i.g), p.push(i.b), p.push(y));
        }
        return p;
      }
      getOtherSideProto(e) {
        const t = this.installationMethod,
          r = this.wireMap,
          n = this.lampsAmount,
          i = this.location,
          s = [];
        let c = this.otherSideColors(i, t),
          l = 0;
        8 === i
          ? (l = 2)
          : 7 === i
            ? (l = 1)
            : 2 === i || 3 === i
              ? ((l = this.topIndexes1.length), t && (c = c.reverse()))
              : (4 !== i && 5 !== i && 6 !== i) || (l = this.leftIndexes1.length);
        const p = Math.floor(n / l),
          d = n % l;
        let f = 0,
          h = f + 1;
        for (let t = 0; t < c.length; t++) {
          ((h = 0 === t ? 1 : f + 1), (f = h + p - 1));
          for (let e = 0; e < d; e++) t === e && (f += 1);
          const n = c[t],
            l = u(n, r),
            m = o(l, 7 === i ? 5 : this.thresholdTint);
          "000002" === e && a([m.r, m.g, m.b]);
          const g = "000002" === e ? a([m.r, m.g, m.b]) : [m.r, m.g, m.b];
          (s.push(h), s.push(g[0]), s.push(g[1]), s.push(g[2]), s.push(f));
        }
        return s;
      }
      getAllColorsData(e) {
        const t = this.otherSideColors(4, 0),
          r = this.otherSideColors(2, 0),
          n = this.otherSideColors(5, 0).reverse(),
          s = this.otherSideColors(3, 0).reverse(),
          a = [];
        a.push(this.avgScreenColor());
        const c = t.concat(r).concat(n).concat(s).concat(a),
          l = [];
        return (
          c.forEach((t) => {
            const r = o(t, this.thresholdTint),
              n = (0, i.lowLight)(e, [r.red, r.green, r.blue]);
            (l.push(n[0]), l.push(n[1]), l.push(n[2]));
          }),
          l
        );
      }
      arrayToMatrix(e, t, r) {
        const n = [];
        for (let i = 0; i < t; i++) {
          const t = [];
          for (let n = 0; n < r; n++) t.push(e[i * r + n]);
          n.push(t);
        }
        return n;
      }
    };
  var d = r(88632),
    f = r(72139),
    h = r(51800),
    m = r(32071);
  const { store: g } = r(81687),
    v = r(96439),
    { lowLightForSync: y, removeBlackEdges: w } = r(79539),
    { getColsAndRows: b } = r(54790),
    {
      getAroundAreaAvgColors: x,
      getAroundAreaCenterColors: E,
      getCenterAreaCenterColors: _,
      getCenterAreaAvgColors: S,
    } = r(54790),
    I = new v(),
    $ = async (e, t, r, i, o, s, a, c, l, u, d, h, m) => {
      const g = new p(t, r, i, o, s, a, c, l, u, d, h);
      let v = [];
      if (
        ((v =
          1 === r
            ? g.getBackSideProto()
            : 6 === r
              ? g.getLeftAndRightSidesProto()
              : g.getOtherSideProto(e.id)),
        (v = y(e.id, v)),
        (0, n.U)(m, "1.0.2", ">"))
      )
        await e.setSyncScreen(v);
      else if ((console.log("🔥 低版本固件..."), v.length > 57)) {
        const t = 55;
        for (let r = 0; r < v.length; r += t) {
          const n = v.slice(r, r + t);
          (await e.setSectionLED(n), await (0, f.sleep)(20));
        }
      } else (await e.setSectionLED(v), await (0, f.sleep)(20));
    },
    O = async (e, t, r, n, i) => {
      const o = new p(r, 0, 0, 0, 0, 0, 0, 0, 0, n, i).getAllColorsData(e);
      "function" == typeof t.setSyncScreen && (await t.setSyncScreen(o, n, i, n, i));
    },
    R = (e, t) => {
      const r = Math.floor(t.length / 14),
        n = [];
      for (let e = 0; e < t.length; e++) {
        const r = t[e],
          i = (0, m.convertToBlack)(r, 20);
        n.push(i);
      }
      for (let t = 0; t <= r; t++) {
        const r = n.slice(14 * t, 14 * (t + 1));
        e.excuteCustomLightEffect(r, t);
      }
    },
    P = (e, t) => {
      const r = new p(t, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).avgScreenColor();
      e.customSingleColor(r.red, r.green, r.blue);
    },
    A = (e, t, r) => {
      e[t] || (e[t] = []);
      const n = e[t];
      return (
        n.length >= 10 && n.shift(),
        n.push(r),
        ((e) => {
          if (0 === e.length) return [];
          const t = e.length,
            r = e[0].length,
            n = Array.from({ length: r }, () => ({ red: 0, green: 0, blue: 0 }));
          return (
            e.forEach((e) => {
              e.forEach((e, t) => {
                ((n[t].red += e.red), (n[t].green += e.green), (n[t].blue += e.blue));
              });
            }),
            n.forEach((e) => {
              ((e.red = Math.round(e.red / t)),
                (e.green = Math.round(e.green / t)),
                (e.blue = Math.round(e.blue / t)));
            }),
            n
          );
        })(n)
      );
    },
    T = async (e, t, r, n, i) => {
      const o = t.length;
      if (!t || 0 === o) return;
      const s = g.get("syncColor") ? g.get("syncColor") : 0,
        a = t.find((e) => "dongle" === e.type),
        c = t.filter((e) => ("serialport" === e.type || "hid" === e.type) && e.isSyncScreen),
        l = t.filter((e) => "ble" === e.type && e.isSyncScreen);
      for (let o = 0; o < c.length; o++) {
        const a = c[o],
          l = d.find((e) => e.id === a.id),
          { monitorSizes: u } = l,
          p = t.find((e) => e.uuid === a.uuid),
          {
            id: f,
            displayId: m,
            location: g,
            lampsAmount: v,
            installationMethod: y,
            edgeNumber: O,
            displaySize: T,
            wireMap: k,
            syncArea: N,
            syncMode: C,
            uuid: L,
            productType: D,
          } = p;
        if ("040404" === f) return;
        const j = m
            ? n.find((e) => e.displayId.toString() === m.toString())
            : n.find((e) => !0 === e.isPrimary),
          U = j.width,
          M = j.height,
          F = r[j.displayId],
          z = [];
        for (let e = 0; e < F.length; e += 3) {
          const t = F[e],
            r = F[e + 1],
            n = F[e + 2];
          z.push({ red: t, green: r, blue: n });
        }
        const B = I.devices.find((e) => e.path === a.path);
        if (!B) return;
        const { version: q } = B,
          { cols: V, rows: G } = b(f, v, j, D),
          H = s ? S(z, U, M, i, V, G) : _(z, U, M, i, V, G),
          W = s ? x(z, U, M, i, V, G) : E(z, U, M, i, V, G),
          K = N ? H : W;
        let X = [];
        1 === C && ((X = A(e, L, K)), (X = w(V, G, X)));
        const Y = X.length ? X : K;
        if ("keyboard" === a.productType && "hid" === a.type) {
          const e = Y.filter((e, t) => !h.INDICES_TO_REMOVE.includes(t));
          await R(B, e);
        } else
          "mouse" === a.productType && "hid" === a.type
            ? await P(B, Y)
            : await $(B, Y, g, v, k, j, y, O, u, T, V, G, q);
      }
      for (let o = 0; o < l.length; o++) {
        const c = l[o],
          u = t.find((e) => e.uuid === c.uuid),
          { id: p, displayId: d, lampsAmount: f, syncMode: h, uuid: m } = u,
          g = I.devices.find((e) => e.path === c.path);
        if (!g) return;
        const v = d
            ? n.find((e) => e.displayId.toString() === d.toString())
            : n.find((e) => !0 === e.isPrimary),
          y = v.width,
          E = v.height,
          S = r[v.displayId],
          $ = [];
        for (let e = 0; e < S.length; e += 3) {
          const t = S[e],
            r = S[e + 1],
            n = S[e + 2];
          $.push({ red: t, green: r, blue: n });
        }
        const R = "light",
          { cols: P, rows: T } = b(p, f, v, R),
          k = s ? x($, y, E, i, P, T) : _($, y, E, i, P, T);
        let N = [];
        1 === h && ((N = A(e, m, k)), (N = w(P, T, N)));
        const C = N.length ? N : k;
        if ((await O(p, g, C, P, T), a)) break;
      }
    };
};

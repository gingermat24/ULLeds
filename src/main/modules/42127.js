module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      ajustColorOrder: () => l,
      getWireMap: () => c,
      hexToRgb: () => i,
      hexToRgbArray: () => o,
      hexWithBrightness: () => s,
      rgbWithBrightness: () => a,
    }));
  var n = r(32048);
  const i = (e) => (
      (e = e.replace("#", "")),
      {
        r: parseInt(e.substring(0, 2), 16),
        g: parseInt(e.substring(2, 4), 16),
        b: parseInt(e.substring(4, 6), 16),
      }
    ),
    o = (e) => (
      (e = e.replace("#", "")),
      [
        parseInt(e.substring(0, 2), 16),
        parseInt(e.substring(2, 4), 16),
        parseInt(e.substring(4, 6), 16),
      ]
    ),
    s = (e, t) => {
      e = e.replace("#", "");
      const r = parseInt(e.substring(0, 2), 16) * t,
        n = parseInt(e.substring(2, 4), 16) * t,
        i = parseInt(e.substring(4, 6), 16) * t;
      return { r: Math.ceil(r), g: Math.ceil(n), b: Math.ceil(i) };
    },
    a = (e, t, r, n) => {
      const i = e * n,
        o = t * n,
        s = r * n;
      return { r: Math.ceil(i), g: Math.ceil(o), b: Math.ceil(s) };
    },
    c = (e, t, r) => {
      const i = [],
        o = e.findIndex((e) => 1 === e),
        s = t.findIndex((e) => 1 === e),
        a = r.findIndex((e) => 1 === e),
        c = n.colorOrders[o],
        l = n.colorOrders[s],
        u = n.colorOrders[a];
      return (i.push(c), i.push(l), i.push(u), i.join(""));
    },
    l = (e, t) => {
      let r = { r: 0, g: 0, b: 0 };
      switch (t) {
        case "RGB":
          r = { r: e.r || e.red, g: e.g || e.green, b: e.b || e.blue };
          break;
        case "RBG":
          r = { r: e.r || e.red, g: e.b || e.blue, b: e.g || e.green };
          break;
        case "GRB":
          r = { r: e.g || e.green, g: e.r || e.red, b: e.b || e.blue };
          break;
        case "GBR":
          r = { r: e.g || e.green, g: e.b || e.blue, b: e.r || e.red };
          break;
        case "BRG":
          r = { r: e.b || e.blue, g: e.r || e.red, b: e.g || e.green };
          break;
        case "BGR":
          r = { r: e.b || e.blue, g: e.g || e.green, b: e.r || e.red };
          break;
        default:
          r = e;
      }
      return ((r.r = r.r || 0), (r.g = r.g || 0), (r.b = r.b || 0), r);
    };
};

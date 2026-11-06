module.exports = (e, t, r) => {
  const { bleLocationConvert: n, bleWireMapConvert: i } = r(10994);
  e.exports = class {
    constructor(e, t, r, n, i) {
      ((this.id = e), (this.mac = t), (this.path = r), (this.uuid = n), (this.version = i));
    }
    static list(e) {
      const t = e.readUInt16BE(2),
        r = [],
        o = e.slice(10, t - 1),
        s = o.length / 28;
      if (o.length % 28 == 0)
        for (let e = 0; e < s; e++) {
          const t = 28 * e,
            s = t + 28,
            a = o.slice(t, s),
            c = a.slice(0, 6),
            l = c.toString("hex"),
            u = c.toString("hex"),
            p = a.slice(6, 9),
            d = a.slice(9, 13),
            f = a[14],
            h = a[15],
            m = a[16],
            g = a[17],
            v = a[18],
            y = a[24],
            w = {
              id: d.toString("hex"),
              type: "ble",
              mac: c,
              path: u,
              uuid: l,
              displaySize: 0,
              lampsAmount: f,
              location: n(h),
              installationMethod: g,
              wireMap: i(v),
              edgeNumber: m,
              version: p.join("."),
              whiteColorDriver: y,
            };
          r.push(w);
        }
      return r;
    }
  };
};

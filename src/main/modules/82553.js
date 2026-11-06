module.exports = (e, t, r) => {
  const n = r(72299),
    i = (e, t, r = 0) => {
      const n = [0, 21315];
      for (let i = t; i > 0; i--) {
        let o = e[t - i];
        for (let e = 0; e < 8; e++) ((r = (r >> 1) ^ n[1 & (r ^ o)]), (o >>= 1));
      }
      return r;
    };
  e.exports = class {
    constructor() {
      this.action = {
        getDeviceUUID: 128,
        getActivationCode: 130,
        writeLightEffect: 131,
        customSingleColor: 253,
      };
    }
    getDeviceUUID() {
      const e = n.setID(),
        t = Buffer.alloc(7);
      return (
        t.writeUInt8(83, 0),
        t.writeUInt8(67, 1),
        t.writeUInt8(7, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.getDeviceUUID, 4),
        t.writeUInt16BE(i(t, 5), 5),
        t
      );
    }
    getActivationCode() {
      const e = n.setID(),
        t = Buffer.alloc(7);
      return (
        t.writeUInt8(83, 0),
        t.writeUInt8(67, 1),
        t.writeUInt8(7, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.getActivationCode, 4),
        t.writeUInt16BE(i(t, 5), 5),
        t
      );
    }
    turnOffLight() {
      console.log("✅ turnOffLight");
      const e = n.setID(),
        t = Buffer.alloc(11);
      return (
        t.writeUInt8(83, 0),
        t.writeUInt8(67, 1),
        t.writeUInt8(11, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.writeLightEffect, 4),
        t.writeUInt8(0, 5),
        t.writeUInt8(0, 6),
        t.writeUInt8(255, 7),
        t.writeUInt8(255, 8),
        t.writeUInt16BE(i(t, 9), 9),
        t
      );
    }
    turnOnLight() {
      console.log("🚀 turnOnLight");
      const e = n.setID(),
        t = Buffer.alloc(11);
      return (
        t.writeUInt8(83, 0),
        t.writeUInt8(67, 1),
        t.writeUInt8(11, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.writeLightEffect, 4),
        t.writeUInt8(0, 5),
        t.writeUInt8(1, 6),
        t.writeUInt8(255, 7),
        t.writeUInt8(255, 8),
        t.writeUInt16BE(i(t, 9), 9),
        t
      );
    }
    setStaticColor(e, t, r) {
      const o = n.setID(),
        s = Buffer.alloc(11);
      return (
        s.writeUInt8(83, 0),
        s.writeUInt8(67, 1),
        s.writeUInt8(11, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.writeLightEffect, 4),
        s.writeUInt8(1, 5),
        s.writeUInt8(e, 6),
        s.writeUInt8(t, 7),
        s.writeUInt8(r, 8),
        s.writeUInt16BE(i(s, 9), 9),
        s
      );
    }
    setBrightness(e) {
      const t = n.setID(),
        r = Buffer.alloc(11);
      return (
        r.writeUInt8(83, 0),
        r.writeUInt8(67, 1),
        r.writeUInt8(11, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.writeLightEffect, 4),
        r.writeUInt8(2, 5),
        r.writeUInt8(e, 6),
        r.writeUInt8(255, 7),
        r.writeUInt8(255, 8),
        r.writeUInt16BE(i(r, 9), 9),
        r
      );
    }
    setLedEffect(e) {
      const t = n.setID(),
        r = Buffer.alloc(11);
      return (
        r.writeUInt8(83, 0),
        r.writeUInt8(67, 1),
        r.writeUInt8(11, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.writeLightEffect, 4),
        r.writeUInt8(3, 5),
        r.writeUInt8(e, 6),
        r.writeUInt8(255, 7),
        r.writeUInt8(255, 8),
        r.writeUInt16BE(i(r, 9), 9),
        r
      );
    }
    setSyncScreenStatus() {
      console.log("🚀进入自定义灯光模式");
      const e = Buffer.alloc(9);
      return (
        e.writeUInt8(85, 0),
        e.writeUInt8(220, 1),
        e.writeUInt8(0, 2),
        e.writeUInt8(0, 3),
        e.writeUInt8(0, 4),
        e.writeUInt8(0, 5),
        e.writeUInt8(0, 6),
        e.writeUInt8(0, 7),
        e.writeUInt8(0, 8),
        e
      );
    }
    excuteCustomLightEffect(e, t) {
      const r = e.length,
        n = Buffer.alloc(64);
      (n.writeUInt8(85, 0),
        n.writeUInt8(221, 1),
        n.writeUInt8(0, 2),
        n.writeUInt8(0, 3),
        n.writeUInt8(4 * r, 4),
        n.writeUInt16LE(t, 5),
        n.writeUInt8(0, 7));
      for (let t = 0; t < r; t++) {
        const r = e[t];
        (n.writeUInt8(r.red, 8 + 4 * t),
          n.writeUInt8(r.green, 9 + 4 * t),
          n.writeUInt8(r.blue, 10 + 4 * t),
          n.writeUInt8(255, 11 + 4 * t));
      }
      return n;
    }
    customSingleColor(e, t, r) {
      const o = n.setID(),
        s = Buffer.alloc(10);
      return (
        s.writeUInt8(83, 0),
        s.writeUInt8(67, 1),
        s.writeUInt8(10, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.customSingleColor, 4),
        s.writeUInt8(e, 5),
        s.writeUInt8(t, 6),
        s.writeUInt8(r, 7),
        s.writeUInt16BE(i(s, 8), 8),
        s
      );
    }
  };
};

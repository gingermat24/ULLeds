module.exports = (e, t, r) => {
  const n = r(72299),
    i = (e) => {
      let t = 0;
      for (let r = 0; r < e.length; r++) t += e[r];
      return t % 256;
    };
  e.exports = class {
    constructor() {
      ((this.action = {
        dongleChildrenInfo: 0,
        notSyncEffect: 2,
        setSyncScreenStatus: 13,
        setSyncScreen: 128,
        setSectionLED: 134,
        writeDeviceInfo: 129,
        readDeviceInfo: 130,
        setLedEffect: 133,
        setBrightness: 135,
        setAutoOff: 137,
        setDynamicSpeed: 138,
        setSoundSensitivity: 139,
        setExternalAudio: 145,
      }),
        (this.ports = {}),
        (this.header = ["RB"]));
    }
    getDongleInfo(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.dongleChildrenInfo, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
      );
    }
    setDeviceInfo(e, t, r, o, s) {
      const a = n.setID(),
        c = Buffer.alloc(13);
      return (
        c.write(this.header[0], 0, 2, "utf8"),
        c.writeUInt8(13, 2),
        c.writeUInt8(a, 3),
        c.writeUInt8(this.action.writeDeviceInfo, 4),
        c.writeUInt8(e, 5),
        c.writeUInt8(t, 6),
        c.writeUInt8(r, 7),
        c.writeUInt8(o, 8),
        c.writeUInt8(1, 9),
        c.writeUInt16BE(s, 10),
        c.writeUInt8(i(c), 12),
        c
      );
    }
    getDeviceInfo() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.readDeviceInfo, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    getDeviceFullInfo() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.readDeviceInfo, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    getDeviceID() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.readDeviceInfo, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    getLampAmount() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.readDeviceInfo, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    setSwitchStatus(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(1, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(1, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setSectionLED(e, t, r, o) {
      const s = n.setID(),
        a = Buffer.alloc(20);
      return (
        a.write(this.header[0], 0, 2, "utf8"),
        a.writeUInt8(20, 2),
        a.writeUInt8(s, 3),
        a.writeUInt8(this.action.notSyncEffect, 4),
        a.writeUInt8(e[0], 5),
        a.writeUInt8(e[1], 6),
        a.writeUInt8(e[2], 7),
        a.writeUInt8(e[3], 8),
        a.writeUInt8(e[4], 9),
        a.writeUInt8(e[5], 10),
        a.writeUInt8(3, 11),
        a.writeUInt8(t, 12),
        a.writeUInt8(r, 13),
        a.writeUInt8(o, 14),
        a.writeUInt8(3, 15),
        a.writeUInt8(t, 16),
        a.writeUInt8(r, 17),
        a.writeUInt8(o, 18),
        a.writeUInt8(i(a), 19),
        a
      );
    }
    setSyncScreenStatus(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(13, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(13, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setSyncScreen(e, t, r, o, s) {
      const a = n.setID(),
        c = 10 + e.length,
        l = Buffer.alloc(c);
      (l.write(this.header[0], 0, 2, "utf8"),
        l.writeUInt8(c, 2),
        l.writeUInt8(a, 3),
        l.writeUInt8(this.action.setSyncScreen, 4),
        l.writeUInt8(t, 5),
        l.writeUInt8(r, 6),
        l.writeUInt8(o, 7),
        l.writeUInt8(s, 8));
      for (let t = 0; t < e.length; t += 3) {
        const r = t + 9,
          n = e[t],
          i = e[t + 1],
          o = e[t + 2];
        (l.writeUInt8(n, r), l.writeUInt8(i, r + 1), l.writeUInt8(o, r + 2));
      }
      return (l.writeUInt8(i(l), c - 1), l);
    }
    setLedEffect(e, t, r) {
      let o = 4;
      3 === t && (o = 6);
      const s = n.setID(),
        a = Buffer.alloc(20);
      return (
        a.write(this.header[0], 0, 2, "utf8"),
        a.writeUInt8(20, 2),
        a.writeUInt8(s, 3),
        a.writeUInt8(this.action.notSyncEffect, 4),
        a.writeUInt8(e[0], 5),
        a.writeUInt8(e[1], 6),
        a.writeUInt8(e[2], 7),
        a.writeUInt8(e[3], 8),
        a.writeUInt8(e[4], 9),
        a.writeUInt8(e[5], 10),
        a.writeUInt8(o, 11),
        a.writeUInt8(r, 12),
        a.writeUInt8(255, 13),
        a.writeUInt8(255, 14),
        a.writeUInt8(o, 15),
        a.writeUInt8(r, 16),
        a.writeUInt8(255, 17),
        a.writeUInt8(255, 18),
        a.writeUInt8(i(a), 19),
        a
      );
    }
    setBrightness(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(2, 11),
        o.writeUInt8(t < 5 ? 5 : t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(2, 15),
        o.writeUInt8(t < 5 ? 5 : t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setDynamicSpeed(e, t) {
      let r = 0;
      r = t < 5 ? 5 : t > 100 ? 100 : t;
      const o = n.setID(),
        s = Buffer.alloc(20);
      return (
        s.write(this.header[0], 0, 2, "utf8"),
        s.writeUInt8(20, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.notSyncEffect, 4),
        s.writeUInt8(e[0], 5),
        s.writeUInt8(e[1], 6),
        s.writeUInt8(e[2], 7),
        s.writeUInt8(e[3], 8),
        s.writeUInt8(e[4], 9),
        s.writeUInt8(e[5], 10),
        s.writeUInt8(5, 11),
        s.writeUInt8(r, 12),
        s.writeUInt8(255, 13),
        s.writeUInt8(255, 14),
        s.writeUInt8(5, 15),
        s.writeUInt8(r, 16),
        s.writeUInt8(255, 17),
        s.writeUInt8(255, 18),
        s.writeUInt8(i(s), 19),
        s
      );
    }
    setSoundSensitivity(e, t) {
      let r = 0;
      r = t < 5 ? 5 : t > 100 ? 100 : t;
      const o = n.setID(),
        s = Buffer.alloc(20);
      return (
        s.write(this.header[0], 0, 2, "utf8"),
        s.writeUInt8(20, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.notSyncEffect, 4),
        s.writeUInt8(e[0], 5),
        s.writeUInt8(e[1], 6),
        s.writeUInt8(e[2], 7),
        s.writeUInt8(e[3], 8),
        s.writeUInt8(e[4], 9),
        s.writeUInt8(e[5], 10),
        s.writeUInt8(7, 11),
        s.writeUInt8(r, 12),
        s.writeUInt8(255, 13),
        s.writeUInt8(255, 14),
        s.writeUInt8(7, 15),
        s.writeUInt8(r, 16),
        s.writeUInt8(255, 17),
        s.writeUInt8(255, 18),
        s.writeUInt8(i(s), 19),
        s
      );
    }
    setAutoOff(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(8);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(8, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.setAutoOff, 4),
        o.writeUInt8(e, 5),
        o.writeUInt8(t, 6),
        o.writeUInt8(i(o), 7),
        o
      );
    }
    setExternalAudio(e) {
      const t = n.setID(),
        r = Buffer.alloc(8);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(8, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setExternalAudio, 4),
        r.writeUInt16BE(e, 5),
        r.writeUInt8(i(r), 7),
        r
      );
    }
    setOpenUrl(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(17, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(17, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setLedQuantity(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(8, 11),
        o.writeUInt16BE(t, 12),
        o.writeUInt8(255, 14),
        o.writeUInt8(8, 15),
        o.writeUInt16BE(t, 16),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setLineSequence(e, t, r) {
      const o = n.setID(),
        s = Buffer.alloc(20);
      return (
        s.write(this.header[0], 0, 2, "utf8"),
        s.writeUInt8(20, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.notSyncEffect, 4),
        s.writeUInt8(e[0], 5),
        s.writeUInt8(e[1], 6),
        s.writeUInt8(e[2], 7),
        s.writeUInt8(e[3], 8),
        s.writeUInt8(e[4], 9),
        s.writeUInt8(e[5], 10),
        s.writeUInt8(12, 11),
        s.writeUInt8(t, 12),
        s.writeUInt8(r, 13),
        s.writeUInt8(255, 14),
        s.writeUInt8(12, 15),
        s.writeUInt8(t, 16),
        s.writeUInt8(r, 17),
        s.writeUInt8(255, 18),
        s.writeUInt8(i(s), 19),
        s
      );
    }
    setDeviceLocation(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(9, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(9, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setEdgeNumber(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(10, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(10, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setPowerDirection(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(20);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(20, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.notSyncEffect, 4),
        o.writeUInt8(e[0], 5),
        o.writeUInt8(e[1], 6),
        o.writeUInt8(e[2], 7),
        o.writeUInt8(e[3], 8),
        o.writeUInt8(e[4], 9),
        o.writeUInt8(e[5], 10),
        o.writeUInt8(11, 11),
        o.writeUInt8(t, 12),
        o.writeUInt8(255, 13),
        o.writeUInt8(255, 14),
        o.writeUInt8(11, 15),
        o.writeUInt8(t, 16),
        o.writeUInt8(255, 17),
        o.writeUInt8(255, 18),
        o.writeUInt8(i(o), 19),
        o
      );
    }
    setWhiteBright(e, t, r) {
      const o = n.setID(),
        s = Buffer.alloc(20);
      return (
        s.write(this.header[0], 0, 2, "utf8"),
        s.writeUInt8(20, 2),
        s.writeUInt8(o, 3),
        s.writeUInt8(this.action.notSyncEffect, 4),
        s.writeUInt8(e[0], 5),
        s.writeUInt8(e[1], 6),
        s.writeUInt8(e[2], 7),
        s.writeUInt8(e[3], 8),
        s.writeUInt8(e[4], 9),
        s.writeUInt8(e[5], 10),
        s.writeUInt8(24, 11),
        s.writeUInt8(t, 12),
        s.writeUInt8(r, 13),
        s.writeUInt8(255, 14),
        s.writeUInt8(24, 15),
        s.writeUInt8(t, 16),
        s.writeUInt8(r, 17),
        s.writeUInt8(255, 18),
        s.writeUInt8(i(s), 19),
        s
      );
    }
  };
};

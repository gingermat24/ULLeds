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
        setSyncScreen: 128,
        setSectionLED: 134,
        writeDeviceInfo: 129,
        readDeviceInfo: 130,
        readDeviceUUID: 131,
        setLedEffect: 133,
        setBrightness: 135,
        setAutoOff: 137,
        setDynamicSpeed: 138,
        setSoundSensitivity: 139,
        setExternalAudio: 145,
        setOpenUrl: 147,
        setLampsAmount: 149,
        setWhiteBright: 150,
        turnOffLight: 151,
        setComputerRhythm: 152,
      }),
        (this.ports = {}),
        (this.header = ["RB"]));
    }
    setDeviceInfo(e, t, r, o) {
      const s = n.setID(),
        a = Buffer.alloc(13);
      return (
        a.write(this.header[0], 0, 2, "utf8"),
        a.writeUInt8(13, 2),
        a.writeUInt8(s, 3),
        a.writeUInt8(this.action.writeDeviceInfo, 4),
        a.writeUInt16BE(e, 5),
        a.writeUInt8(t, 7),
        a.writeUInt8(r, 8),
        a.writeUInt8(1, 9),
        a.writeUInt16BE(o, 10),
        a.writeUInt8(i(a), 12),
        a
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
    getDeviceUUID() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.readDeviceUUID, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    setSectionLED(e) {
      const t = n.setID(),
        r = 6 + e.length,
        o = Buffer.alloc(r);
      (o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(r, 2),
        o.writeUInt8(t, 3),
        o.writeUInt8(this.action.setSectionLED, 4));
      for (let t = 0; t < e.length; t += 5) {
        const r = t + 5,
          n = e[t],
          i = e[t + 1],
          s = e[t + 2],
          a = e[t + 3],
          c = e[t + 4];
        (o.writeUInt8(n, r),
          o.writeUInt8(i, r + 1),
          o.writeUInt8(s, r + 2),
          o.writeUInt8(a, r + 3),
          o.writeUInt8(c, r + 4));
      }
      return (o.writeUInt8(i(o), r - 1), o);
    }
    setSyncScreen(e) {
      const t = n.setID(),
        r = 7 + e.length,
        o = Buffer.alloc(r);
      (o.writeUInt8(83, 0),
        o.writeUInt8(67, 1),
        o.writeUInt16BE(r, 2),
        o.writeUInt8(t, 4),
        o.writeUInt8(this.action.setSyncScreen, 5));
      for (let t = 0; t < e.length; t += 5) {
        const r = t + 6,
          n = e[t],
          i = e[t + 1],
          s = e[t + 2],
          a = e[t + 3],
          c = e[t + 4];
        (o.writeUInt8(n, r),
          o.writeUInt8(i, r + 1),
          o.writeUInt8(s, r + 2),
          o.writeUInt8(a, r + 3),
          o.writeUInt8(c, r + 4));
      }
      return (o.writeUInt8(i(o), r - 1), o);
    }
    setLedEffect(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(8);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(8, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.setLedEffect, 4),
        o.writeUInt8(e, 5),
        o.writeUInt8(t, 6),
        o.writeUInt8(i(o), 7),
        o
      );
    }
    setBrightness(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setBrightness, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
      );
    }
    setDynamicSpeed(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setDynamicSpeed, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
      );
    }
    setSoundSensitivity(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setSoundSensitivity, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
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
    setOpenUrl(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setOpenUrl, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
      );
    }
    setLedQuantity(e, t, r, n, i) {
      return this.setDeviceInfo(e, t, r, n, i);
    }
    setLampsAmount(e) {
      const t = n.setID(),
        r = Buffer.alloc(7);
      return (
        r.write(this.header[0], 0, 2, "utf8"),
        r.writeUInt8(7, 2),
        r.writeUInt8(t, 3),
        r.writeUInt8(this.action.setLampsAmount, 4),
        r.writeUInt8(e, 5),
        r.writeUInt8(i(r), 6),
        r
      );
    }
    setWhiteBright(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(8);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(8, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.setWhiteBright, 4),
        o.writeUInt8(e, 5),
        o.writeUInt8(t, 6),
        o.writeUInt8(i(o), 7),
        o
      );
    }
    turnOffLight() {
      const e = n.setID(),
        t = Buffer.alloc(6);
      return (
        t.write(this.header[0], 0, 2, "utf8"),
        t.writeUInt8(6, 2),
        t.writeUInt8(e, 3),
        t.writeUInt8(this.action.turnOffLight, 4),
        t.writeUInt8(i(t), 5),
        t
      );
    }
    setComputerRhythm(e, t) {
      const r = n.setID(),
        o = Buffer.alloc(8);
      return (
        o.write(this.header[0], 0, 2, "utf8"),
        o.writeUInt8(8, 2),
        o.writeUInt8(r, 3),
        o.writeUInt8(this.action.setComputerRhythm, 4),
        o.writeUInt8(e, 5),
        o.writeUInt8(t, 6),
        o.writeUInt8(i(o), 7),
        o
      );
    }
  };
};

module.exports = (e, t, r) => {
  const n = r(5786),
    i = r(60895),
    o = r(82553),
    { sleep: s } = r(72139),
    { KEYBOARD_PID: a, MOUSE_PID: c } = r(51800),
    l = r(18272);
  e.exports = class extends n {
    constructor() {
      (super(), (this.protocol = new i()), (this.keyboardAndMouseProtocol = new o()));
    }
    async setDeviceInfo(e, t, r, n) {
      const i = this.protocol.setDeviceInfo(e, t, r, n);
      return (await this.write(i)).readUInt8(4);
    }
    async getDeviceInfo() {
      const e = this.protocol.getDeviceInfo();
      return await this.write(e);
    }
    async getDeviceFullInfo() {
      if (this.productId === a || this.productId === c) {
        const e = this.keyboardAndMouseProtocol.getDeviceUUID(),
          t = await this.write(e),
          r = this.keyboardAndMouseProtocol.getActivationCode(),
          n = await this.write(r),
          i = t.slice(5, 55),
          o = n.slice(5, 55),
          s = i.toString("hex"),
          a = Array.from(i),
          c = Array.from(o),
          u = (l.verify(a, c) ? n.slice(5, 11) : Buffer.alloc(3, 4)).toString("hex"),
          p = 0;
        return (
          (this.id = u),
          (this.uuid = s),
          (this.version = "9.9.9"),
          (this.lampsAmount = 0),
          {
            id: this.id,
            displaySize: p,
            version: this.version,
            lampsAmount: this.lampsAmount,
            uuid: s,
          }
        );
      }
      const e = this.protocol.getDeviceFullInfo(),
        t = await this.write(e),
        r = t.slice(5, 8),
        n = [t.readUInt8(21), t.readUInt8(22), t.readUInt8(23)].join("."),
        i = r.toString("hex"),
        o = t.slice(12, 20).toString("hex"),
        u = t.readUInt8(8),
        p = t.readUInt8(11);
      ((this.id = i), (this.uuid = o), (this.version = n), (this.lampsAmount = p));
      const d = { id: i, displaySize: u, version: n, lampsAmount: p, uuid: o };
      (await s(80), console.log('🥒 设置关闭"开机打开URL"'));
      const f = this.protocol.setOpenUrl(0);
      return (await this.write(f), d);
    }
    async getDeviceID() {
      const e = this.protocol.getDeviceID();
      return (await this.write(e)).slice(5, 8).toString("hex");
    }
    async getLampAmount() {
      const e = this.protocol.getLampAmount();
      return (await this.write(e))[11];
    }
    async getDeviceUUID() {
      const e = this.protocol.getDeviceUUID(),
        t = (await this.write(e)).slice(5, 13).toString("hex");
      return ((this.uuid = t), t);
    }
    async setSectionLED(e) {
      if (this.productId === a || this.productId === c) {
        const t = e[1],
          r = e[2],
          n = e[3],
          i = this.keyboardAndMouseProtocol.setStaticColor(t, r, n);
        await this.writeWithoutResponse(i);
      } else {
        const t = this.protocol.setSectionLED(e);
        await this.writeWithoutResponse(t);
      }
    }
    async setSyncScreenStatus(e) {
      if ((this.productId === a || this.productId === c) && e) {
        const t = this.keyboardAndMouseProtocol.setStaticColor(0, 0, 0);
        (await this.writeWithoutResponse(t), await s(20));
        const r = this.keyboardAndMouseProtocol.setSyncScreenStatus(e);
        await this.writeWithoutResponse(r);
      }
    }
    async setSyncScreen(e) {
      const t = this.protocol.setSyncScreen(e);
      await this.writeWithoutResponse(t);
    }
    setLedEffect(e, t) {
      if (this.productId === a || this.productId === c) {
        const e = this.keyboardAndMouseProtocol.setLedEffect(t);
        this.write(e);
      } else {
        const r = this.protocol.setLedEffect(e, t);
        this.write(r);
      }
    }
    setBrightness(e) {
      if (this.productId === a || this.productId === c) {
        const t = this.keyboardAndMouseProtocol.setBrightness(e);
        this.write(t);
      } else {
        const t = this.protocol.setBrightness(e);
        this.write(t);
      }
    }
    setDynamicSpeed(e) {
      const t = this.protocol.setDynamicSpeed(e);
      this.write(t);
    }
    setSoundSensitivity(e) {
      const t = this.protocol.setSoundSensitivity(e);
      this.write(t);
    }
    setAutoOff(e, t) {
      const r = this.protocol.setAutoOff(e, t);
      this.write(r);
    }
    setExternalAudio(e) {
      const t = this.protocol.setExternalAudio(e);
      this.write(t);
    }
    setOpenUrl(e) {
      const t = this.protocol.setOpenUrl(e);
      this.write(t);
    }
    async setLedQuantity(e) {
      const t = await this.getDeviceInfo();
      await s(20);
      const r = t[5],
        n = t[6],
        i = t[7],
        o = t[8],
        a = this.protocol.setLedQuantity(r, n, i, o, e);
      (await this.write(a), await s(100));
    }
    async setLampsAmount(e) {
      const t = this.protocol.setLampsAmount(e);
      return (await this.write(t)).readUInt8(5);
    }
    async setWhiteBright(e, t) {
      const r = this.protocol.setWhiteBright(e, t);
      return (await this.write(r)).readUInt8(5);
    }
    async turnOffLight() {
      if (this.productId === a || this.productId === c) {
        const e = this.keyboardAndMouseProtocol.setStaticColor(0, 0, 0);
        return (await this.writeWithoutResponse(e)).readUInt8(5);
      }
      const e = this.protocol.turnOffLight();
      return (await this.write(e)).readUInt8(5);
    }
    async setComputerRhythm(e, t) {
      const r = this.protocol.setComputerRhythm(e, t);
      return (await this.write(r)).readUInt8(5);
    }
    excuteCustomLightEffect(e, t) {
      const r = this.keyboardAndMouseProtocol.excuteCustomLightEffect(e, t);
      this.write(r);
    }
    customSingleColor(e, t, r) {
      const n = this.keyboardAndMouseProtocol.customSingleColor(e, t, r);
      this.write(n);
    }
  };
};

module.exports = (e, t, r) => {
  const n = r(5503),
    i = r(60895),
    { sleep: o } = r(72139);
  e.exports = class extends n {
    constructor() {
      (super(), (this.protocol = new i()));
    }
    async setDeviceInfo(e, t, r, n, i) {
      const o = this.protocol.setDeviceInfo(e, t, r, n, i);
      return (await this.write(o))[4];
    }
    async getDeviceInfo() {
      const e = this.protocol.getDeviceInfo();
      return await this.write(e);
    }
    async getDeviceFullInfo() {
      const e = this.protocol.getDeviceFullInfo(),
        t = await this.write(e),
        r = t.slice(5, 8),
        n = [t.readUInt8(21), t.readUInt8(22), t.readUInt8(23)].join("."),
        i = r.toString("hex"),
        o = t.slice(12, 20).toString("hex"),
        s = t.readUInt8(8),
        a = t.readUInt8(11);
      return (
        (this.id = i),
        (this.uuid = o),
        (this.version = n),
        (this.lampsAmount = a),
        { id: i, displaySize: s, version: n, lampsAmount: a, uuid: o }
      );
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
    setSectionLED(e) {
      const t = this.protocol.setSectionLED(e);
      this.writeWithoutResponse(t);
    }
    setSyncScreen(e) {
      const t = this.protocol.setSyncScreen(e);
      this.writeWithoutResponse(t);
    }
    setSyncScreenStatus(e) {
      console.log("status:", e);
    }
    setLedEffect(e, t) {
      const r = this.protocol.setLedEffect(e, t);
      this.write(r);
    }
    setBrightness(e) {
      const t = this.protocol.setBrightness(e);
      this.write(t);
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
    async setLedQuantity(e) {
      const t = await this.getDeviceInfo();
      await o(20);
      const r = t[5],
        n = t[6],
        i = t[7],
        s = t[8],
        a = this.protocol.setLedQuantity(r, n, i, s, e);
      (await this.write(a), await o(100));
    }
  };
};

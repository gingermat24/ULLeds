module.exports = (e, t, r) => {
  const { sleep: n } = r(72139),
    i = r(55883),
    o = r(62564);
  e.exports = class extends i {
    constructor() {
      (super(), (this.protocol = new o()));
    }
    async getDongleInfo() {
      const e = this.protocol.getDongleInfo(0);
      (await this.write(e), await n(1e3));
      const t = this.protocol.getDongleInfo(1);
      return await this.write(t);
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
        r = [t[12], t[13], t[14]].join("."),
        i = [255, 255, 255, 255, 255, 255],
        o = i.join(""),
        s = t[8],
        a = "888888";
      ((this.id = a), (this.mac = i), (this.uuid = this.mac.join("")));
      const c = { id: a, displaySize: s, version: r, lampsAmount: 0, uuid: o };
      (console.log('🥒 设置关闭"开机打开URL"'), await n(80));
      const l = this.protocol.setOpenUrl(this.mac, 0);
      return (await this.write(l), c);
    }
    async getDeviceID() {
      const e = this.protocol.getDeviceID();
      return (await this.write(e)).slice(5, 8).toString("hex");
    }
    async getLampAmount() {
      const e = this.protocol.getLampAmount();
      return (await this.write(e))[20];
    }
    getDeviceUUID() {
      return this.uuid;
    }
    setSwitchStatus(e) {
      const t = this.protocol.setSwitchStatus(this.mac, e);
      this.writeWithoutResponse(t);
    }
    setSectionLED(e) {
      const t = e.length > 3 ? e[1] : e[0],
        r = e.length > 3 ? e[2] : e[1],
        n = e.length > 3 ? e[3] : e[2],
        i = this.protocol.setSectionLED(this.mac, t, r, n);
      this.writeWithoutResponse(i);
    }
    setSyncScreenStatus(e) {
      const t = this.protocol.setSyncScreenStatus(this.mac, e);
      this.write(t);
    }
    setSyncScreen(e, t, r, n, i) {
      const o = this.protocol.setSyncScreen(e, t, r, n, i);
      this.writeWithoutResponse(o);
    }
    setLedEffect(e, t) {
      const r = this.protocol.setLedEffect(this.mac, e, t);
      this.write(r);
    }
    setBrightness(e) {
      const t = this.protocol.setBrightness(this.mac, e);
      this.write(t);
    }
    setDynamicSpeed(e) {
      const t = this.protocol.setDynamicSpeed(this.mac, e);
      this.write(t);
    }
    setSoundSensitivity(e) {
      const t = this.protocol.setSoundSensitivity(this.mac, e);
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
    setLedQuantity(e) {
      const t = this.protocol.setLedQuantity(this.mac, e);
      this.write(t);
    }
    setLineSequence(e, t) {
      const r = this.protocol.setLineSequence(this.mac, e, t);
      this.write(r);
    }
    setDeviceLocation(e) {
      let t = 0;
      switch (e) {
        case 1:
        default:
          t = 0;
          break;
        case 2:
          t = 1;
          break;
        case 3:
          t = 2;
          break;
        case 4:
          t = 3;
          break;
        case 5:
          t = 4;
          break;
        case 6:
          t = 6;
          break;
        case 7:
          t = 5;
      }
      const r = this.protocol.setDeviceLocation(this.mac, t);
      this.write(r);
    }
    setEdgeNumber(e) {
      const t = this.protocol.setEdgeNumber(this.mac, e);
      this.write(t);
    }
    setPowerDirection(e) {
      const t = this.protocol.setPowerDirection(this.mac, e);
      this.write(t);
    }
    setWhiteBright(e, t) {
      const r = this.protocol.setWhiteBright(this.mac, e, t);
      this.write(r);
    }
  };
};

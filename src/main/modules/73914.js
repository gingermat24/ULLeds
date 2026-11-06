module.exports = (e, t, r) => {
  const n = r(55883),
    i = r(62564),
    { bleLocationConvert: o, bleWireMapConvert: s } = r(10994),
    { sleep: a } = r(72139);
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
        r = t.slice(15, 19),
        n = t.slice(6, 12),
        i = Array.from(n),
        c = [t[12], t[13], t[14]].join("."),
        l = r.toString("hex"),
        u = n.toString("hex"),
        p = t[8],
        d = t[20],
        f = t[21],
        h = t[22],
        m = t[23],
        g = t[24],
        v = t[30];
      ((this.id = l), (this.mac = i), (this.uuid = u));
      const y = {
        id: l,
        displaySize: p,
        version: c,
        lampsAmount: d,
        location: o(f),
        installationMethod: m,
        wireMap: s(g),
        edgeNumber: h,
        uuid: u,
        whiteColorDriver: v,
      };
      (console.log('🥒 设置关闭"开机打开URL"'), await a(80));
      const w = this.protocol.setOpenUrl(this.mac, 0);
      return (await this.write(w), y);
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
      this.writeWithoutResponse(t);
    }
    setSyncScreen(e, t, r, n, i) {
      const o = this.protocol.setSyncScreen(e, t, r, n, i);
      this.writeWithoutResponse(o);
    }
    setLedEffect(e, t) {
      const r = this.protocol.setLedEffect(this.mac, e, t);
      this.writeWithoutResponse(r);
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

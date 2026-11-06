module.exports = (e, t, r) => {
  const n = r(51070),
    i = r(51545),
    o = r(73914),
    s = r(57069),
    { checkDeviceType: a } = r(10994),
    c = r(5503),
    l = r(5786),
    u = r(55883),
    { sleep: p } = r(72139),
    d = r(70112),
    { eventEmitter: f } = r(36132),
    { LIGHT_PID: h, KEYBOARD_PID: m, MOUSE_PID: g } = r(51800);
  e.exports = class {
    constructor() {
      ((this.isAutoConnected = !1),
        (this.isGroup = !1),
        (this.devices = []),
        (this.currentDevice = null));
    }
    static async list() {
      try {
        const e = await c.list(),
          t = await l.list(),
          r = await u.list(),
          n = await u.list("dongle");
        return e.concat(t).concat(r).concat(n);
      } catch (e) {
        return [];
      }
    }
    static async listDongleChildren(e) {
      const t = await e.getDongleInfo();
      return d.list(t);
    }
    async connect(e) {
      const t = e.productId,
        r = a(e);
      ("hid" === r
        ? ((this.currentDevice = new i()), await p(500))
        : "ble" === r
          ? ((this.currentDevice = new o()), await p(500))
          : "dongle" === r
            ? ((this.currentDevice = new s()), await p(500), f.emit("dongleScan", !0))
            : (this.currentDevice = new n()),
        (this.currentDevice.type = r));
      const c = await this.currentDevice.connect(e.path, t);
      return (c && this.devices.push(this.currentDevice), c);
    }
    getType() {
      return this.currentDevice ? this.currentDevice.type : null;
    }
    getProductType() {
      let e = "light";
      switch (this.currentDevice ? this.currentDevice.productId : "") {
        case h:
          e = "light";
          break;
        case m:
          e = "keyboard";
          break;
        case g:
          e = "mouse";
          break;
        default:
          e = "light";
      }
      return e;
    }
    disconnect() {
      this.currentDevice.disconnect();
    }
  };
};

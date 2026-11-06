module.exports = (e, t, r) => {
  const { compare: n } = r(30979),
    i = r(96439),
    { sleep: o } = r(72139),
    { eventEmitter: s } = r(36132),
    { store: a } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = a), (this.connectSingleton = new i()));
    }
    async send(e) {
      await o(49);
      const t = this.connectSingleton.devices.find((e) => "dongle" === e.type),
        r = this.connectSingleton.currentDevice,
        { type: i, version: a } = r;
      "ble" === i
        ? t
          ? (s.emit("updateBreakingSyncScreen", !0),
            await o(100),
            setTimeout(() => {
              s.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await r.setLedQuantity(e))
          : await r.setLedQuantity(e)
        : ("hid" !== i && "serialport" !== i) || !n(a, "1.7.1", ">=")
          ? await r.setLedQuantity(e)
          : await r.setLampsAmount(e);
    }
  };
};

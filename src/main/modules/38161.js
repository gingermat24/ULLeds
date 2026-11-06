module.exports = (e, t, r) => {
  const n = r(96439),
    { sleep: i } = r(72139),
    { eventEmitter: o } = r(36132),
    { store: s } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = s), (this.connectSingleton = new n()));
    }
    async send(e) {
      await i(49);
      const t = this.connectSingleton.devices.find((e) => "dongle" === e.type),
        r = this.connectSingleton.currentDevice;
      if (r) {
        const { type: n } = r;
        t && "ble" === n
          ? (o.emit("updateBreakingSyncScreen", !0),
            await i(100),
            setTimeout(() => {
              o.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await r.setPowerDirection(e))
          : await r.setPowerDirection(e);
      }
    }
  };
};

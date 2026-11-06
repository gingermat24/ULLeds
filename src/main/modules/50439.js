module.exports = (e, t, r) => {
  const { store: n } = r(81687),
    i = r(96439),
    { sleep: o } = r(72139),
    { eventEmitter: s } = r(36132);
  e.exports = class {
    constructor() {
      ((this.store = n), (this.connectSingleton = new i()));
    }
    async send(e) {
      await o(49);
      const t = this.connectSingleton.devices.find((e) => "dongle" === e.type),
        r = this.connectSingleton.currentDevice;
      if (r) {
        const { type: n } = r;
        t && "ble" === n
          ? (s.emit("updateBreakingSyncScreen", !0),
            await o(100),
            setTimeout(() => {
              s.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await r.setEdgeNumber(e))
          : await r.setEdgeNumber(e);
      }
    }
  };
};

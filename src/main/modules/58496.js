module.exports = (e, t, r) => {
  const n = r(96439),
    { sleep: i } = r(72139),
    { eventEmitter: o } = r(36132),
    { store: s } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = s), (this.connectSingleton = new n()));
    }
    async send(e, t) {
      await i(49);
      const r = this.connectSingleton.devices.find((e) => "dongle" === e.type),
        n = this.connectSingleton.currentDevice;
      if (n) {
        const { type: s } = n;
        r && "ble" === s
          ? (o.emit("updateBreakingSyncScreen", !0),
            await i(100),
            setTimeout(() => {
              o.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await n.setLineSequence(e, t))
          : await n.setLineSequence(e, t);
      }
    }
  };
};

module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { eventEmitter: o } = r(36132),
    { sleep: s } = r(72139),
    { store: a } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = a), (this.connectSingleton = new i()));
    }
    async send(e) {
      await s(49);
      const t = this.connectSingleton.devices,
        r = t.find((e) => "dongle" === e.type),
        i = t.filter((e) => "serialport" === e.type || "hid" === e.type),
        a = t.filter((e) => "ble" === e.type),
        c = this.connectSingleton.currentDevice;
      c
        ? r
          ? (o.emit("updateBreakingSyncScreen", !0),
            await s(100),
            setTimeout(() => {
              o.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await c.setDynamicSpeed(e))
          : await c.setDynamicSpeed(e)
        : (n.mapLimit(i, 1, async (t) => {
            await t.setDynamicSpeed(e);
          }),
          r
            ? await r.setDynamicSpeed(e)
            : n.mapLimit(a, 1, async (t) => {
                await t.setDynamicSpeed(e);
              }));
    }
  };
};

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
    convertModeParam(e) {
      let t = 1;
      return ((1 === e || 2 === e) && (t = 255), t);
    }
    async send(e, t) {
      const r = this.convertModeParam(e);
      await s(49);
      const i = this.connectSingleton.devices,
        a = i.find((e) => "dongle" === e.type),
        c = i.filter((e) => "serialport" === e.type || "hid" === e.type),
        l = i.filter((e) => "ble" === e.type),
        u = this.connectSingleton.currentDevice;
      if (u) {
        const { type: n } = u;
        a
          ? (o.emit("updateBreakingSyncScreen", !0),
            await s(100),
            setTimeout(() => {
              o.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await u.setWhiteBright(r, t))
          : "ble" === n
            ? await u.setWhiteBright(r, t)
            : await u.setWhiteBright(e, t);
      } else
        (n.mapLimit(c, 1, async (r) => {
          await r.setWhiteBright(e, t);
        }),
          a
            ? await a.setWhiteBright(r, t)
            : n.mapLimit(l, 1, async (e) => {
                await e.setWhiteBright(r, t);
              }));
    }
  };
};

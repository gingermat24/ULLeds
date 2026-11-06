module.exports = (e, t, r) => {
  const n = r(4745),
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
      const t = this.connectSingleton.devices,
        r = t.find((e) => "dongle" === e.type),
        i = t.filter((e) => "serialport" === e.type || "hid" === e.type),
        a = t.filter((e) => "ble" === e.type),
        c = this.connectSingleton.currentDevice;
      if (c) {
        const { uuid: t } = c,
          r = Math.round((e / 100) * 10) / 10;
        (s.emit("updateLedControllerSettings", t, { sensitivity: r }),
          await o(80),
          await c.setSoundSensitivity(e));
      } else
        (n.mapLimit(i, 1, async (t) => {
          const { uuid: r } = t,
            n = Math.round((e / 100) * 10) / 10;
          (s.emit("updateLedControllerSettings", r, { sensitivity: n }),
            await o(80),
            await t.setSoundSensitivity(e));
        }),
          r
            ? await r.setSoundSensitivity(e)
            : n.mapLimit(a, 1, async (t) => {
                const { uuid: r } = t,
                  n = Math.round((e / 100) * 10) / 10;
                (s.emit("updateLedControllerSettings", r, { sensitivity: n }),
                  await o(80),
                  await t.setSoundSensitivity(e));
              }));
    }
  };
};

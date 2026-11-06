module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { sleep: o } = r(72139),
    { eventEmitter: s } = r(36132),
    { hexToRgbArray: a } = r(42127),
    { store: c } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = c), (this.connectSingleton = new i()));
    }
    async send() {
      await o(49);
      const e = this.store.get("devices") ? this.store.get("devices") : [],
        t = this.connectSingleton.devices,
        r = t.find((e) => "dongle" === e.type),
        i = t.filter((e) => "serialport" === e.type || "hid" === e.type),
        c = t.filter((e) => "ble" === e.type),
        l = this.connectSingleton.currentDevice;
      if (l) {
        const { uuid: t } = l,
          r = e.find((e) => e.uuid === t),
          { effectIndex: n, rhythmColors: i } = r,
          c = i[n],
          u = c[0],
          p = c[1],
          d = a(u),
          f = a(p);
        (s.emit("updateLedControllerSettings", t, { baseColor: d, overlayColor: f }), await o(80));
      } else
        (n.mapLimit(i, 1, async (t) => {
          const { uuid: r } = t,
            n = e.find((e) => e.uuid === r),
            { effectIndex: i, rhythmColors: c } = n,
            l = c[i],
            u = l[0],
            p = l[1],
            d = a(u),
            f = a(p);
          (s.emit("updateLedControllerSettings", r, { baseColor: d, overlayColor: f }),
            await o(80));
        }),
          r ||
            n.mapLimit(c, 1, async (t) => {
              const { uuid: r } = t,
                n = e.find((e) => e.uuid === r),
                { effectIndex: i, rhythmColors: c } = n,
                l = c[i],
                u = l[0],
                p = l[1],
                d = a(u),
                f = a(p);
              (s.emit("updateLedControllerSettings", r, { baseColor: d, overlayColor: f }),
                await o(80));
            }));
    }
  };
};

module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { hexToRgb: o, ajustColorOrder: s } = r(42127),
    { lowLight: a } = r(79539),
    { sleep: c } = r(72139),
    { eventEmitter: l } = r(36132),
    { store: u } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = u), (this.connectSingleton = new i()));
    }
    getUsbProtocol(e, t) {
      const r = (this.store.get("devices") ? this.store.get("devices") : []).find(
          (t) => t.uuid === e,
        ),
        n = o(t),
        i = s(n, r.wireMap),
        c = a(r.id, [i.r, i.g, i.b]),
        l = r.lampsAmount;
      let u = [1, c[0], c[1], c[2], 254];
      return (l > 0 && l < 254 && (u = [1, c[0], c[1], c[2], l, l + 1, 0, 0, 0, 254]), u);
    }
    getBleProtocol(e, t) {
      const r = o(t),
        n = a(e, [r.r, r.g, r.b]);
      return [n[0], n[1], n[2]];
    }
    async send(e) {
      await c(49);
      const t = this.connectSingleton.devices,
        r = t.find((e) => "dongle" === e.type),
        i = t.filter((e) => "serialport" === e.type || "hid" === e.type),
        o = t.filter((e) => "ble" === e.type),
        s = this.connectSingleton.currentDevice;
      if (s) {
        const { uuid: t, type: n, id: i } = s,
          o = this.getBleProtocol(i, e),
          a = this.getUsbProtocol(t, e),
          u = "ble" === n ? o : a;
        r
          ? (l.emit("updateBreakingSyncScreen", !0),
            await c(100),
            setTimeout(() => {
              l.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await s.setSectionLED(u))
          : await s.setSectionLED(u);
      } else if (
        (l.emit("stopAudioWorker"),
        await c(80),
        n.mapLimit(i, 1, async (t) => {
          const { uuid: r } = t,
            n = this.getUsbProtocol(r, e);
          await t.setSectionLED(n);
        }),
        r)
      ) {
        const t = o[0].id,
          n = this.getBleProtocol(t, e);
        await r.setSectionLED(n);
      } else
        n.mapLimit(o, 1, async (t) => {
          const r = this.getBleProtocol(t.id, e);
          await t.setSectionLED(r);
        });
    }
  };
};

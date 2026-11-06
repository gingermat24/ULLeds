module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { eventEmitter: o } = r(36132),
    { hexToRgb: s, ajustColorOrder: a } = r(42127),
    { lowLight: c } = r(79539),
    { sleep: l } = r(72139),
    { KEYBOARD_PID: u } = r(51800),
    { store: p } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = p), (this.connectSingleton = new i()), (this.debounceTimer = null));
    }
    getUsbProtocol(e, t) {
      const r = (this.store.get("devices") ? this.store.get("devices") : []).find(
          (t) => t.uuid === e,
        ),
        n = s(r.hue),
        i = a(n, r.wireMap),
        o = c(r.id, [i.r, i.g, i.b]),
        l = r.lampsAmount;
      let u = [1, 0, 0, 0, 254];
      l > 0 && l < 254 && (u = [1, 0, 0, 0, l, l + 1, 0, 0, 0, 254]);
      let p = [1, o[0], o[1], o[2], 254];
      return (l > 0 && l < 254 && (p = [1, o[0], o[1], o[2], l, l + 1, 0, 0, 0, 254]), t ? u : p);
    }
    send(e, t) {
      (clearTimeout(this.debounceTimer),
        (this.debounceTimer = setTimeout(async () => {
          await l(49);
          const r = this.connectSingleton.devices,
            i = r.find((e) => "dongle" === e.type),
            s = r.filter((e) => "serialport" === e.type || "hid" === e.type),
            a = r.filter((e) => "ble" === e.type),
            c = this.connectSingleton.currentDevice;
          if (c) {
            const { uuid: r } = c,
              n = this.getUsbProtocol(r, !1);
            i
              ? (o.emit("updateBreakingSyncScreen", !0),
                await l(100),
                setTimeout(() => {
                  o.emit("updateBreakingSyncScreen", !1);
                }, 200),
                await c.setLedEffect(e, t))
              : (c.productId === u && c.setSectionLED(n), await c.setLedEffect(e, t));
          } else
            (2 === e && (o.emit("stopAudioWorker"), await l(80)),
              n.mapLimit(s, 1, async (r) => {
                const { uuid: n } = r,
                  i = this.getUsbProtocol(n, !1);
                (r.productId === u && (await r.setSectionLED(i)), await r.setLedEffect(e, t));
              }),
              i
                ? await i.setLedEffect(e, t)
                : n.mapLimit(a, 1, async (r) => {
                    await r.setLedEffect(e, t);
                  }));
        }, 200)));
    }
  };
};

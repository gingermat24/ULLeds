module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { hexToRgb: o, ajustColorOrder: s } = r(42127),
    { lowLight: a } = r(79539),
    { sleep: c } = r(72139),
    { singleDeviceAPI: l } = r(51772),
    { eventEmitter: u } = r(36132),
    { store: p } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = p), (this.connectSingleton = new i()));
    }
    getUsbProtocol(e) {
      const t = (this.store.get("devices") ? this.store.get("devices") : []).find(
          (t) => t.uuid === e,
        ),
        r = o(t.hue),
        n = s(r, t.wireMap),
        i = a(t.id, [n.r, n.g, n.b]),
        c = t.lampsAmount;
      let l = [1, i[0], i[1], i[2], 254];
      return (c > 0 && c < 254 && (l = [1, i[0], i[1], i[2], c, c + 1, 0, 0, 0, 254]), l);
    }
    getBleProtocol() {
      return 1;
    }
    async send() {
      await c(200);
      const e = this.connectSingleton.devices,
        t = e.find((e) => "dongle" === e.type),
        r = e.filter((e) => "serialport" === e.type || "hid" === e.type),
        i = e.filter((e) => "ble" === e.type);
      n.mapLimit(r, 1, async (e) => {
        const { uuid: t } = e,
          r = this.getUsbProtocol(t),
          n = (this.store.get("devices") ? this.store.get("devices") : []).find(
            (e) => e.uuid === t,
          ),
          { effectIndex: i, effectType: o, isSwitchOn: s, isSyncScreen: a } = n;
        (s && (await e.setSectionLED(r)),
          a && (console.log("😂 isSyncScreen:", a), u.emit("setScreenWorker", !0), await c(300)),
          o > -1 && i >= 0 && (await l(t, "setLedEffect", o, i)));
      });
      const o = this.getBleProtocol();
      (n.mapLimit(i, 1, async (e) => {
        const { uuid: t } = e,
          r = (this.store.get("devices") ? this.store.get("devices") : []).find(
            (e) => e.uuid === t,
          ),
          { effectIndex: n, effectType: i, isSwitchOn: s, isSyncScreen: a } = r;
        if (a) return (await e.setSyncScreenStatus(1), void u.emit("setScreenWorker", !0));
        s
          ? await e.setSwitchStatus(o)
          : (i > -1 && n >= 0 && (await l(t, "setLedEffect", i, n)), await c(100));
      }),
        t && u.emit("dongleScan", !0));
    }
  };
};

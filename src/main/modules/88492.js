module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { hexToRgb: o, ajustColorOrder: s } = r(42127),
    { lowLight: a } = r(79539),
    c = r(32048),
    { eventEmitter: l } = r(36132),
    { sleep: u } = r(72139),
    { store: p } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = p), (this.connectSingleton = new i()));
    }
    async send(e) {
      await u(49);
      const t = this.store.get("devices") ? this.store.get("devices") : [],
        r = this.connectSingleton.devices,
        i = r.find((e) => "dongle" === e.type),
        o = r.filter((e) => "serialport" === e.type || "hid" === e.type),
        s = r.filter((e) => "ble" === e.type),
        a = this.connectSingleton.currentDevice;
      if (a) {
        const { uuid: r, type: n } = a;
        if (i)
          (l.emit("updateBreakingSyncScreen", !0),
            await u(100),
            setTimeout(() => {
              l.emit("updateBreakingSyncScreen", !1);
            }, 200),
            await a.setBrightness(e));
        else if ("ble" === n) await a.setBrightness(e);
        else {
          (await a.setBrightness(e), await u(20));
          const n = t.find((e) => e.uuid === r),
            { effectType: i, effectIndex: o, isSyncScreen: s } = n;
          if ((-1 !== i && -1 !== o) || s) return;
          const c = this.turnOnPotocol(r);
          await a.setSectionLED(c);
        }
      } else
        (n.mapLimit(o, 1, async (r) => {
          const { uuid: n } = r;
          (await r.setBrightness(e), await u(20));
          const i = t.find((e) => e.uuid === n),
            { effectType: o, effectIndex: s, isSyncScreen: a } = i;
          if ((-1 !== o && -1 !== s) || a) return;
          const c = this.turnOnPotocol(n);
          await r.setSectionLED(c);
        }),
          i
            ? await i.setBrightness(e)
            : n.mapLimit(s, 1, async (t) => {
                await t.setBrightness(e);
              }));
    }
    turnOnPotocol(e) {
      const t = (this.store.get("devices") ? this.store.get("devices") : []).find(
          (t) => t.uuid === e,
        ),
        { colorIndex: r } = t,
        n = -1 === r ? t.hue : c.hexColors[r],
        i = o(n),
        l = s(i, t.wireMap),
        u = a(t.id, [l.r, l.g, l.b]),
        p = t.lampsAmount;
      let d = [1, u[0], u[1], u[2], 254];
      return (p > 0 && p < 254 && (d = [1, u[0], u[1], u[2], p, p + 1, 0, 0, 0, 254]), d);
    }
  };
};

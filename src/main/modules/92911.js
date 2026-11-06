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
      const t = this.store.get("devices") ? this.store.get("devices") : [],
        r = this.connectSingleton.devices,
        i = r.find((e) => "dongle" === e.type),
        a = r.filter((e) => "serialport" === e.type || "hid" === e.type),
        c = r.filter((e) => "ble" === e.type),
        l = this.connectSingleton.currentDevice;
      if (l) {
        const { uuid: r } = l,
          n = t.find((e) => e.uuid === r && 3 === e.effectType && -1 !== e.effectIndex);
        n &&
          (1 === e
            ? (console.log("🔥 电脑拾音:", e), s.emit("startAudioWorker", r, n.effectIndex))
            : 2 === e &&
              (console.log("✅ 控制器拾音:", e),
              await l.setLedEffect(n.effectType, n.effectIndex)));
      } else
        (n.mapLimit(a, 1, async (r) => {
          const { uuid: n } = r,
            i = t.find((e) => e.uuid === n && 3 === e.effectType && -1 !== e.effectIndex);
          i &&
            (1 === e
              ? (console.log("🔥 电脑拾音:", e), s.emit("startAudioWorker", n, i.effectIndex))
              : 2 === e &&
                (console.log("✅ 控制器拾音:", e),
                await r.setLedEffect(i.effectType, i.effectIndex)));
        }),
          i ||
            n.mapLimit(c, 1, async (r) => {
              const { uuid: n } = r,
                i = t.find((e) => e.uuid === n && 3 === e.effectType && -1 !== e.effectIndex);
              i &&
                (1 === e
                  ? (console.log("🔥 电脑拾音:", e), s.emit("startAudioWorker", n, i.effectIndex))
                  : 2 === e &&
                    (console.log("✅ 控制器拾音:", e),
                    await r.setLedEffect(i.effectType, i.effectIndex)));
            }));
    }
  };
};

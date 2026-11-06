module.exports = (e, t, r) => {
  const n = r(4745),
    i = r(96439),
    { sleep: o } = r(72139),
    { store: s } = r(81687);
  e.exports = class {
    constructor() {
      ((this.store = s), (this.connectSingleton = new i()));
    }
    getUsbProtocol(e) {
      const t = (this.store.get("devices") ? this.store.get("devices") : []).find(
        (t) => t.uuid === e,
      ).lampsAmount;
      let r = [1, 0, 0, 0, 254];
      return (t > 0 && t < 254 && (r = [1, 0, 0, 0, t, t + 1, 0, 0, 0, 254]), r);
    }
    getBleProtocol() {
      return 0;
    }
    async send() {
      await o(200);
      const e = this.connectSingleton.devices,
        t = e.find((e) => "dongle" === e.type),
        r = e.filter((e) => "serialport" === e.type || "hid" === e.type),
        i = e.filter((e) => "ble" === e.type);
      if (
        (n.mapLimit(r, 1, async (e) => {
          const { uuid: t } = e,
            r = this.getUsbProtocol(t);
          await e.setSectionLED(r);
        }),
        t)
      ) {
        const e = this.getBleProtocol();
        await t.setSwitchStatus(e);
      } else
        n.mapLimit(i, 1, async (e) => {
          const t = this.getBleProtocol();
          await e.setSectionLED(t);
        });
    }
  };
};

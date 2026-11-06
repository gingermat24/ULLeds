module.exports = (e, t, r) => {
  const n = r(87138),
    { store: i } = r(81687),
    { compare: o } = r(30979),
    s = r(88632),
    a = r(64025),
    { isInValidUUID: c } = r(10994),
    { sleep: l } = r(72139),
    { BLE_PID: u, DONGLE_PID: p } = r(51800);
  class d {
    constructor() {
      if (d.instance) return d.instance;
      ((d.instance = this), (this.devices = []), (this.currentDevice = null));
    }
    async autoConnect(e) {
      let t = await a.list();
      t.find((e) => e.productId === p) && (t = t.filter((e) => e.productId !== u));
      for (let r = 0; r < t.length; r++) {
        const u = t[r];
        if (!this.devices.find((e) => e.path === u.path))
          try {
            const t = u.path,
              r = new a(),
              p = await r.connect(u);
            p || (n.info("🔌 status:", p), await l(100), await r.connect(u));
            let d = await r.currentDevice.getDeviceFullInfo();
            for (
              let e = 0;
              e < 3 &&
              (!d ||
                "040404" !== d.id ||
                (await r.disconnect(),
                await l(300),
                await r.connect(u),
                await l(100),
                (d = await r.currentDevice.getDeviceFullInfo()),
                "040404" === d.id));
              e++
            );
            const f = r.getType(),
              h = r.getProductType();
            let {
              id: m,
              displaySize: g,
              version: v,
              lampsAmount: y,
              uuid: w,
              location: b,
              installationMethod: x,
              wireMap: E,
              edgeNumber: _,
              whiteColorDriver: S,
            } = d;
            if (!s.find((e) => e.id === m) && "hid" === f && o(v, "1.7.3", "<")) {
              const e = (i.get("devices") ? i.get("devices") : []).find((e) => e.uuid === w);
              if ((console.log("🍎 deviceCache:", e), !e)) return void (await r.disconnect());
              {
                ((m = e.id), await l(80));
                const t = Buffer.from(m, "hex"),
                  n = t.readUInt16BE(0),
                  i = t.readUInt8(2);
                await r.currentDevice.setDeviceInfo(n, i, g, y);
              }
            }
            if ("dongle" !== f && c(w)) return void (await r.disconnect());
            if (((r.currentDevice.version = v), this.devices.some((e) => e.uuid === w))) return;
            this.devices.push(r.currentDevice);
            const I = {
              uuid: w,
              path: t,
              id: m,
              displaySize: g,
              version: v,
              type: f,
              lampsAmount: y,
              location: b,
              installationMethod: x,
              wireMap: E,
              edgeNumber: _,
              whiteColorDriver: S,
              productType: h,
            };
            (e.webContents.send("getDeviceData", I),
              n.info(
                `[设备信息] ID: ${m} UUID: ${w} 设备类型: ${r.currentDevice.type} 产品类型: ${h} 固件版本: ${v} 灯珠数: ${y}  显示器尺寸: ${g}`,
              ));
          } catch (e) {
            n.error("设备连接出错:", e);
          }
      }
    }
    removeDevice(e) {
      const t = this.devices.findIndex((t) => t.path === e);
      -1 !== t && this.devices.splice(t, 1);
    }
  }
  e.exports = d;
};

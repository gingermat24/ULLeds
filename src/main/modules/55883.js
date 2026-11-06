module.exports = (e, t, r) => {
  const n = r(71746),
    { eventEmitter: i } = r(36132),
    { sleep: o } = r(72139),
    { BLE_PID: s, DONGLE_PID: a } = r(51800),
    c = (e) => {
      const t = Buffer.alloc(e.length + 1);
      return ((t[0] = 0), e.copy(t, 1), t);
    },
    l = (e, t) => {
      const r = [];
      for (let n = 0; n < e.length; n += t) r.push(e.slice(n, n + t));
      return r;
    };
  e.exports = class {
    constructor() {
      ((this.delay = 200),
        (this.device = null),
        (this.path = ""),
        (this.dataList = []),
        (this.uuid = ""),
        (this.defaultValue = Buffer.alloc(50, 4)));
    }
    static async list(e) {
      const t = s,
        r = a,
        i = "ROBOBLOQ";
      try {
        const o = await n.devicesAsync();
        return "dongle" === e
          ? o.filter((e) => (e.manufacturer === i && e.productId) === r && 2 === e.interface)
          : o.filter((e) => (e.manufacturer === i && e.productId) === t && 2 === e.interface);
      } catch (e) {
        return [];
      }
    }
    async connect(e) {
      try {
        return (
          (this.device = await n.HIDAsync.open(e)),
          (this.path = e),
          (this.device.path = e),
          this.device.on("data", (e) => {
            if ("RB" === e.toString("utf8", 0, 2)) this.dataList.push(e);
            else {
              const t = this.dataList.length,
                r = this.dataList[t - 1],
                n = Buffer.concat([r, e]);
              this.dataList[t - 1] = n;
            }
          }),
          this.device.on("error", (e) => {
            (console.error("err", e), i.emit("disconnected", this.device.path));
          }),
          !0
        );
      } catch (e) {
        return (console.error("connect:", e), !1);
      }
    }
    async write(e) {
      const t = e.readUInt8(4);
      try {
        const r = 64,
          n = e.toString("utf8", 0, 2);
        if (e.length > r) {
          const o = l(e, r);
          "RB" === n && 0 !== t && i.emit("donglePause", !0);
          for (let e = 0; e < o.length; e++) {
            const t = o[e],
              r = c(t);
            await this.device.write(r);
          }
        } else {
          const r = c(e);
          ("RB" === n && 0 !== t && i.emit("donglePause", !0), await this.device.write(r));
        }
        await o(this.delay);
        const s = this.dataList.find((e) => e.readUInt8(5) === t);
        return (s && this.dataList.pop(), s || this.defaultValue);
      } catch (e) {
        return (console.error("write:", e), this.defaultValue);
      }
    }
    async disconnect() {
      try {
        return await this.device.close();
      } catch (e) {
        return (console.error("err:", e), !1);
      }
    }
    async writeWithoutResponse(e) {
      const t = e.readUInt8(4);
      try {
        const r = 64,
          n = e.toString("utf8", 0, 2);
        if (e.length > r) {
          const o = l(e, r);
          "RB" === n && 0 !== t && i.emit("donglePause", !0);
          for (let e = 0; e < o.length; e++) {
            const t = o[e],
              r = c(t);
            await this.device.write(r);
          }
        } else {
          const r = c(e);
          ("RB" === n && 0 !== t && i.emit("donglePause", !0), await this.device.write(r));
        }
        return this.dataList.find((e) => e.readUInt8(3) === t) || new Array(50).fill(0);
      } catch (e) {
        return (console.error("write:", e), new Array(50).fill(0));
      }
    }
  };
};

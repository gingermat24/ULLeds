module.exports = (e, t, r) => {
  const n = r(71746),
    { eventEmitter: i } = r(36132),
    { sleep: o } = r(72139),
    {
      LIGHT_PID: s,
      LIGHT_VID: a,
      KEYBOARD_PID: c,
      KEYBOARD_VID: l,
      MOUSE_PID: u,
      MOUSE_VID: p,
    } = r(51800),
    d = (e) => {
      const t = Buffer.alloc(e.length + 1);
      return ((t[0] = 0), e.copy(t, 1), t);
    },
    f = (e, t) => {
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
        (this.defaultValue = Buffer.alloc(50, 4)),
        (this.productId = 0));
    }
    static async list() {
      try {
        return (await n.devicesAsync()).filter(
          (e) =>
            (e.productId === s && e.vendorId === a && 0 === e.interface) ||
            (e.productId === c && e.vendorId === l && 2 === e.interface) ||
            (e.productId === u && e.vendorId === p && 2 === e.interface),
        );
      } catch (e) {
        return [];
      }
    }
    async connect(e, t) {
      try {
        return (
          (this.productId = t),
          (this.device = await n.HIDAsync.open(e)),
          (this.path = e),
          (this.device.path = e),
          this.device.on("data", (e) => {
            const t = e.toString("utf8", 0, 2);
            if ("RB" === t || "SC" === t) {
              if (241 === e.readUInt8(4)) {
                const t = { status: Boolean(e.readUInt8(6)), path: this.path, uuid: this.uuid };
                i.emit("reportSyncScreen", t);
              }
              this.dataList.push(e);
            }
          }),
          this.device.on("error", (e) => {
            (i.emit("disconnected", this.device.path), console.error("err:", e));
          }),
          !0
        );
      } catch (e) {
        return (console.error("connect:", e), !1);
      }
    }
    async write(e) {
      if (!this.device) return this.defaultValue;
      try {
        const t = 64;
        if (e.length > t) {
          const r = f(e, t);
          for (let e = 0; e < r.length; e++) {
            const t = r[e],
              n = d(t);
            await this.device.write(n);
          }
        } else {
          const t = d(e);
          await this.device.write(t);
        }
        await o(this.delay);
        const r = e.readUInt8(3);
        return this.dataList.find((e) => e.readUInt8(3) === r) || this.defaultValue;
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
      try {
        const t = 64;
        if (e.length > t) {
          const r = f(e, t);
          for (let e = 0; e < r.length; e++) {
            const t = r[e],
              n = d(t);
            await this.device.write(n);
          }
        } else {
          const t = d(e);
          await this.device.write(t);
        }
        const r = e.readUInt8(3);
        return this.dataList.find((e) => e.readUInt8(3) === r) || this.defaultValue;
      } catch (e) {
        return (console.error("write:", e), this.defaultValue);
      }
    }
  };
};

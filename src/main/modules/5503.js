module.exports = (e, t, r) => {
  const { SerialPort: n } = r(57425),
    { eventEmitter: i } = r(36132),
    { sleep: o } = r(72139),
    { CDC_PID: s } = r(51800);
  e.exports = class {
    constructor() {
      ((this.delay = 200),
        (this.serialport = null),
        (this.path = ""),
        (this.dataList = []),
        (this.uuid = ""),
        (this.defaultValue = Buffer.alloc(50, 4)));
    }
    static async list() {
      try {
        const e = s;
        return (await n.list()).filter((t) => (t.productId && parseInt(t.productId, 16)) === e);
      } catch (e) {
        return [];
      }
    }
    connect(e) {
      return (
        (this.serialport = new n({ path: e, baudRate: 115200, dataBits: 8, autoOpen: !1 })),
        (this.path = e),
        this.serialport.on("data", (e) => {
          if ("RB" === e.toString("utf8", 0, 2)) {
            if (241 === e.readUInt8(4)) {
              const t = { status: Boolean(e.readUInt8(6)), path: this.path, uuid: this.uuid };
              i.emit("reportSyncScreen", t);
            }
            this.dataList.push(e);
          }
        }),
        this.serialport.on("error", (e) => {
          console.log(e);
        }),
        this.serialport.on("open", () => {
          console.log("open port");
        }),
        this.serialport.on("close", () => {
          (i.emit("disconnected", this.serialport.path),
            (this.serialport = null),
            (this.dataList = []));
        }),
        this.isOpen()
      );
    }
    isOpen() {
      return new Promise((e, t) => {
        this.serialport.open((t) => {
          e(!t);
        });
      });
    }
    disconnect() {
      return new Promise((e, t) => {
        this.serialport.close((r) => {
          r ? t(r) : ((this.serialport = null), (this.dataList = []), e(!0));
        });
      });
    }
    write(e) {
      return new Promise((t) => {
        (null === this.serialport && t(this.defaultValue),
          this.serialport.write(e, async (r) => {
            if (r) (console.error(r), t(this.defaultValue));
            else {
              await o(this.delay);
              const r = e.readUInt8(3);
              for (let e = 0; e < this.dataList.length; e += 1) {
                const n = this.dataList[e];
                r === n.readUInt8(3) && (this.dataList.splice(e, 1), t(n));
              }
              t(this.defaultValue);
            }
          }));
      });
    }
    writeWithoutResponse(e) {
      return new Promise((t) => {
        (null === this.serialport && t(this.defaultValue),
          this.serialport.write(e, async (r) => {
            if (r) (console.error(r), t(this.defaultValue));
            else {
              await o(2);
              const r = e.readUInt8(3);
              for (let e = 0; e < this.dataList.length; e += 1) {
                const n = this.dataList[e];
                r === n.readUInt8(3) && (this.dataList.splice(e, 1), t(n));
              }
              t(this.defaultValue);
            }
          }));
      });
    }
  };
};

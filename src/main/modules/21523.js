module.exports = (e, t, r) => {
  "use strict";
  const n = r(24434),
    i = r(79896),
    o = r(70857);
  e.exports = class extends n {
    asyncWriteQueue = [];
    bytesWritten = 0;
    hasActiveAsyncWriting = !1;
    path = null;
    initialSize = void 0;
    writeOptions = null;
    writeAsync = !1;
    constructor({
      path: e,
      writeOptions: t = { encoding: "utf8", flag: "a", mode: 438 },
      writeAsync: r = !1,
    }) {
      (super(), (this.path = e), (this.writeOptions = t), (this.writeAsync = r));
    }
    get size() {
      return this.getSize();
    }
    clear() {
      try {
        return (
          i.writeFileSync(this.path, "", { mode: this.writeOptions.mode, flag: "w" }),
          this.reset(),
          !0
        );
      } catch (e) {
        return "ENOENT" === e.code || (this.emit("error", e, this), !1);
      }
    }
    crop(e) {
      try {
        const t = (function (e, t) {
          const r = Buffer.alloc(t),
            n = i.statSync(e),
            o = Math.min(n.size, t),
            s = Math.max(0, n.size - t),
            a = i.openSync(e, "r"),
            c = i.readSync(a, r, 0, o, s);
          return (i.closeSync(a), r.toString("utf8", 0, c));
        })(this.path, e || 4096);
        (this.clear(), this.writeLine(`[log cropped]${o.EOL}${t}`));
      } catch (e) {
        this.emit("error", new Error(`Couldn't crop file ${this.path}. ${e.message}`), this);
      }
    }
    getSize() {
      if (void 0 === this.initialSize)
        try {
          const e = i.statSync(this.path);
          this.initialSize = e.size;
        } catch (e) {
          this.initialSize = 0;
        }
      return this.initialSize + this.bytesWritten;
    }
    increaseBytesWrittenCounter(e) {
      this.bytesWritten += Buffer.byteLength(e, this.writeOptions.encoding);
    }
    isNull() {
      return !1;
    }
    nextAsyncWrite() {
      const e = this;
      if (this.hasActiveAsyncWriting || 0 === this.asyncWriteQueue.length) return;
      const t = this.asyncWriteQueue.join("");
      ((this.asyncWriteQueue = []),
        (this.hasActiveAsyncWriting = !0),
        i.writeFile(this.path, t, this.writeOptions, (r) => {
          ((e.hasActiveAsyncWriting = !1),
            r
              ? e.emit("error", new Error(`Couldn't write to ${e.path}. ${r.message}`), this)
              : e.increaseBytesWrittenCounter(t),
            e.nextAsyncWrite());
        }));
    }
    reset() {
      ((this.initialSize = void 0), (this.bytesWritten = 0));
    }
    toString() {
      return this.path;
    }
    writeLine(e) {
      if (((e += o.EOL), this.writeAsync))
        return (this.asyncWriteQueue.push(e), void this.nextAsyncWrite());
      try {
        (i.writeFileSync(this.path, e, this.writeOptions), this.increaseBytesWrittenCounter(e));
      } catch (e) {
        this.emit("error", new Error(`Couldn't write to ${this.path}. ${e.message}`), this);
      }
    }
  };
};

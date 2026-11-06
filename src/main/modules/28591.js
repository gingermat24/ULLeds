module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.DataSplitter = void 0),
    (t.copyData = l));
  const n = r(23108),
    i = r(79896),
    o = r(2203),
    s = r(42472),
    a = Buffer.from("\r\n\r\n");
  var c;
  function l(e, t, r, n, o) {
    const s = (0, i.createReadStream)("", { fd: r, autoClose: !1, start: e.start, end: e.end - 1 });
    (s.on("error", n), s.once("end", o), s.pipe(t, { end: !1 }));
  }
  !(function (e) {
    ((e[(e.INIT = 0)] = "INIT"), (e[(e.HEADER = 1)] = "HEADER"), (e[(e.BODY = 2)] = "BODY"));
  })(c || (c = {}));
  class u extends o.Writable {
    constructor(e, t, r, n, i, o) {
      (super(),
        (this.out = e),
        (this.options = t),
        (this.partIndexToTaskIndex = r),
        (this.partIndexToLength = i),
        (this.finishHandler = o),
        (this.partIndex = -1),
        (this.headerListBuffer = null),
        (this.readState = c.INIT),
        (this.ignoreByteCount = 0),
        (this.remainingPartDataCount = 0),
        (this.actualPartLength = 0),
        (this.boundaryLength = n.length + 4),
        (this.ignoreByteCount = this.boundaryLength - 2));
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    _write(e, t, r) {
      this.isFinished
        ? console.error(`Trailing ignored data: ${e.length} bytes`)
        : this.handleData(e).then(r).catch(r);
    }
    async handleData(e) {
      let t = 0;
      if (0 !== this.ignoreByteCount && 0 !== this.remainingPartDataCount)
        throw (0, n.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const r = Math.min(this.ignoreByteCount, e.length);
        ((this.ignoreByteCount -= r), (t = r));
      } else if (this.remainingPartDataCount > 0) {
        const r = Math.min(this.remainingPartDataCount, e.length);
        ((this.remainingPartDataCount -= r), await this.processPartData(e, 0, r), (t = r));
      }
      if (t !== e.length) {
        if (this.readState === c.HEADER) {
          const r = this.searchHeaderListEnd(e, t);
          if (-1 === r) return;
          ((t = r), (this.readState = c.BODY), (this.headerListBuffer = null));
        }
        for (;;) {
          if (this.readState === c.BODY) this.readState = c.INIT;
          else {
            this.partIndex++;
            let r = this.partIndexToTaskIndex.get(this.partIndex);
            if (null == r) {
              if (!this.isFinished)
                throw (0, n.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
              r = this.options.end;
            }
            const i =
              0 === this.partIndex
                ? this.options.start
                : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (i < r) await this.copyExistingData(i, r);
            else if (i > r)
              throw (0, n.newError)(
                "prevTaskIndex must be < taskIndex",
                "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED",
              );
            if (this.isFinished) return (this.onPartEnd(), void this.finishHandler());
            if (((t = this.searchHeaderListEnd(e, t)), -1 === t))
              return void (this.readState = c.HEADER);
          }
          const r = this.partIndexToLength[this.partIndex],
            i = t + r,
            o = Math.min(i, e.length);
          if (
            (await this.processPartStarted(e, t, o),
            (this.remainingPartDataCount = r - (o - t)),
            this.remainingPartDataCount > 0)
          )
            return;
          if (((t = i + this.boundaryLength), t >= e.length))
            return void (this.ignoreByteCount = this.boundaryLength - (e.length - i));
        }
      }
    }
    copyExistingData(e, t) {
      return new Promise((r, n) => {
        const i = () => {
          if (e === t) return void r();
          const o = this.options.tasks[e];
          o.kind === s.OperationKind.COPY
            ? l(o, this.out, this.options.oldFileFd, n, () => {
                (e++, i());
              })
            : n(new Error("Task kind must be COPY"));
        };
        i();
      });
    }
    searchHeaderListEnd(e, t) {
      const r = e.indexOf(a, t);
      if (-1 !== r) return r + a.length;
      const n = 0 === t ? e : e.slice(t);
      return (
        null == this.headerListBuffer
          ? (this.headerListBuffer = n)
          : (this.headerListBuffer = Buffer.concat([this.headerListBuffer, n])),
        -1
      );
    }
    onPartEnd() {
      const e = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== e)
        throw (0, n.newError)(
          `Expected length: ${e} differs from actual: ${this.actualPartLength}`,
          "ERR_DATA_SPLITTER_LENGTH_MISMATCH",
        );
      this.actualPartLength = 0;
    }
    processPartStarted(e, t, r) {
      return (0 !== this.partIndex && this.onPartEnd(), this.processPartData(e, t, r));
    }
    processPartData(e, t, r) {
      this.actualPartLength += r - t;
      const n = this.out;
      return n.write(0 === t && e.length === r ? e : e.slice(t, r))
        ? Promise.resolve()
        : new Promise((e, t) => {
            (n.on("error", t),
              n.once("drain", () => {
                (n.removeListener("error", t), e());
              }));
          });
    }
  }
  t.DataSplitter = u;
};

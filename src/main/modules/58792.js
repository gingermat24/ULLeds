module.exports = (e, t, r) => {
  "use strict";
  const n = r(24434),
    i = r(79896),
    o = r(16928),
    s = r(21523),
    a = r(40886);
  e.exports = class extends n {
    store = {};
    constructor() {
      (super(), (this.emitError = this.emitError.bind(this)));
    }
    provide({ filePath: e, writeOptions: t = {}, writeAsync: r = !1 }) {
      let n;
      try {
        if (((e = o.resolve(e)), this.store[e])) return this.store[e];
        n = this.createFile({ filePath: e, writeOptions: t, writeAsync: r });
      } catch (t) {
        ((n = new a({ path: e })), this.emitError(t, n));
      }
      return (n.on("error", this.emitError), (this.store[e] = n), n);
    }
    createFile({ filePath: e, writeOptions: t, writeAsync: r }) {
      return (
        this.testFileWriting({ filePath: e, writeOptions: t }),
        new s({ path: e, writeOptions: t, writeAsync: r })
      );
    }
    emitError(e, t) {
      this.emit("error", e, t);
    }
    testFileWriting({ filePath: e, writeOptions: t }) {
      (i.mkdirSync(o.dirname(e), { recursive: !0 }),
        i.writeFileSync(e, "", { flag: "a", mode: t.mode }));
    }
  };
};

module.exports = (e, t) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = (e, t) => `${e.id}-${t}`;
  t.default = new (class {
    constructor() {
      ((this.nextId = 0),
        (this.storage = {}),
        (this.owners = {}),
        (this.electronIds = new WeakMap()));
    }
    add(e, t, n) {
      const i = this.saveToStorage(n),
        o = r(e, t);
      let s = this.owners[o];
      return (
        s || ((s = this.owners[o] = new Map()), this.registerDeleteListener(e, t)),
        s.has(i) || (s.set(i, 0), this.storage[i].count++),
        s.set(i, s.get(i) + 1),
        i
      );
    }
    get(e) {
      const t = this.storage[e];
      if (null != t) return t.object;
    }
    remove(e, t, n) {
      const i = r(e, t),
        o = this.owners[i];
      if (o && o.has(n)) {
        const e = o.get(n) - 1;
        e <= 0 ? (o.delete(n), this.dereference(n)) : o.set(n, e);
      }
    }
    clear(e, t) {
      const n = r(e, t),
        i = this.owners[n];
      if (i) {
        for (const e of i.keys()) this.dereference(e);
        delete this.owners[n];
      }
    }
    saveToStorage(e) {
      let t = this.electronIds.get(e);
      return (
        t ||
          ((t = ++this.nextId),
          (this.storage[t] = { count: 0, object: e }),
          this.electronIds.set(e, t)),
        t
      );
    }
    dereference(e) {
      const t = this.storage[e];
      null != t &&
        ((t.count -= 1),
        0 === t.count && (this.electronIds.delete(t.object), delete this.storage[e]));
    }
    registerDeleteListener(e, t) {
      const r = t.split("-")[0],
        n = (i, o) => {
          o && o.toString() === r && (e.removeListener("render-view-deleted", n), this.clear(e, t));
        };
      e.on("render-view-deleted", n);
    }
  })();
};

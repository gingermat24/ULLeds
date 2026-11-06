module.exports = (e, t) => {
  "use strict";
  function r(e, t) {
    if ("object" == typeof e && null !== e && "object" == typeof t && null !== t) {
      const n = Object.keys(e),
        i = Object.keys(t);
      return n.length === i.length && n.every((n) => r(e[n], t[n]));
    }
    return e === t;
  }
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.MemoLazy = void 0),
    (t.MemoLazy = class {
      constructor(e, t) {
        ((this.selector = e), (this.creator = t), (this.selected = void 0), (this._value = void 0));
      }
      get hasValue() {
        return void 0 !== this._value;
      }
      get value() {
        const e = this.selector();
        if (void 0 !== this._value && r(this.selected, e)) return this._value;
        this.selected = e;
        const t = this.creator(e);
        return ((this.value = t), t);
      }
      set value(e) {
        this._value = e;
      }
    }));
};

module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.Lazy = void 0),
    (t.Lazy = class {
      constructor(e) {
        ((this._value = null), (this.creator = e));
      }
      get hasValue() {
        return null == this.creator;
      }
      get value() {
        if (null == this.creator) return this._value;
        const e = this.creator();
        return ((this.value = e), e);
      }
      set value(e) {
        ((this._value = e), (this.creator = null));
      }
    }));
};

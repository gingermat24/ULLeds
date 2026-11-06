module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = r(54206);
  class i extends Error {
    constructor(e, t, r, i) {
      (super(i || `can't resolve reference ${r} from id ${t}`),
        (this.missingRef = (0, n.resolveUrl)(e, t, r)),
        (this.missingSchema = (0, n.normalizeId)((0, n.getFullPath)(e, this.missingRef))));
    }
  }
  t.default = i;
};

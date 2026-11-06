module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.GenericDifferentialDownloader = void 0));
  const n = r(6514);
  class i extends n.DifferentialDownloader {
    download(e, t) {
      return this.doDownload(e, t);
    }
  }
  t.GenericDifferentialDownloader = i;
};

module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.newBaseUrl = function (e) {
      const t = new n.URL(e);
      return (t.pathname.endsWith("/") || (t.pathname += "/"), t);
    }),
    (t.newUrlFromBase = o),
    (t.getChannelFilename = function (e) {
      return `${e}.yml`;
    }),
    (t.blockmapFiles = function (e, t, r) {
      const n = o(`${e.pathname}.blockmap`, e);
      return [o(`${e.pathname.replace(new RegExp(i(r), "g"), t)}.blockmap`, e), n];
    }));
  const n = r(87016),
    i = r(57993);
  function o(e, t, r = !1) {
    const i = new n.URL(e, t),
      o = t.search;
    return (
      null != o && 0 !== o.length
        ? (i.search = o)
        : r && (i.search = `noCache=${Date.now().toString(32)}`),
      i
    );
  }
};

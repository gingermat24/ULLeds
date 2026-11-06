module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.retry = async function e(t, r, i, o = 0, s = 0, a) {
      var c;
      const l = new n.CancellationToken();
      try {
        return await t();
      } catch (n) {
        if (
          (null === (c = null == a ? void 0 : a(n)) || void 0 === c || c) &&
          r > 0 &&
          !l.cancelled
        )
          return (
            await new Promise((e) => setTimeout(e, i + o * s)),
            await e(t, r - 1, i, o, s + 1, a)
          );
        throw n;
      }
    }));
  const n = r(88260);
};

module.exports = (e, t, r) => {
  "use strict";
  (r.r(t), r.d(t, { convertToBlack: () => i, isCloseToBlack: () => o, rgbChangerBili: () => n }));
  const n = (e) => {
      const t = Math.max(...e);
      if (0 !== t) {
        const r = 255 / t;
        ((e[0] = Math.floor(e[0] * r)),
          (e[1] = Math.floor(e[1] * r)),
          (e[2] = Math.floor(e[2] * r)));
      }
      return e;
    },
    i = (e, t) => {
      if ((e.r <= t && e.g <= t && e.b <= t) || (e.red <= t && e.green <= t && e.blue <= t))
        return { r: 0, g: 0, b: 0, red: 0, green: 0, blue: 0 };
      const r = ((e) => {
        const t = Object.keys(e);
        let r = null;
        const n = [];
        return (
          t.forEach((t) => {
            e[t] >= 200 ? (r = t) : e[t] <= 50 && n.push(t);
          }),
          null !== r &&
            2 === n.length &&
            ((e[r] = 1.5 * e[r] > 255 ? 255 : 1.5 * e[r]),
            n.forEach((t) => {
              e[t] = 0;
            })),
          e
        );
      })(e);
      return r;
    },
    o = (e, t) => {
      if (e && Object.prototype.hasOwnProperty.call(e, "red")) {
        const r = e.red,
          n = e.green,
          i = e.blue;
        if (r < t && n < t && i < t) return !0;
      }
      return !1;
    };
};

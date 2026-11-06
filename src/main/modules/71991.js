module.exports = (e, t, r) => {
  "use strict";
  (r.r(t), r.d(t, { setComputerRhythm: () => o }));
  const { compare: n } = r(30979),
    i = new (r(96439))(),
    o = (e, t) => {
      const r = e.length;
      if (!e || 0 === r) return;
      const o = e.filter(
          (e) =>
            ("serialport" === e.type || "hid" === e.type) &&
            3 === e.effectType &&
            1 === e.rhythmType,
        ),
        s = i.devices;
      for (let r = 0; r < o.length; r++) {
        const i = o[r],
          a = e.find((e) => e.uuid === i.uuid),
          { effectIndex: c, uuid: l } = a;
        try {
          const e = s.find((e) => e.uuid === l);
          if (e) {
            const { type: r, version: i } = e;
            if ("hid" === r && n(i, "1.8.2", ">=") && c >= 0) {
              const r = parseInt(100 * t, 10);
              e.setComputerRhythm(c, r);
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
};

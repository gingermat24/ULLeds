module.exports = (e) => {
  "use strict";
  e.exports = function (e) {
    return Object.defineProperties(t, {
      defaultLabel: { value: "", writable: !0 },
      labelPadding: { value: !0, writable: !0 },
      maxLabelLength: { value: 0, writable: !0 },
      labelLength: {
        get() {
          switch (typeof t.labelPadding) {
            case "boolean":
              return t.labelPadding ? t.maxLabelLength : 0;
            case "number":
              return t.labelPadding;
            default:
              return 0;
          }
        },
      },
    });
    function t(r) {
      t.maxLabelLength = Math.max(t.maxLabelLength, r.length);
      const n = {};
      for (const t of e.levels) n[t] = (...n) => e.logData(n, { level: t, scope: r });
      return ((n.log = n.info), n);
    }
  };
};

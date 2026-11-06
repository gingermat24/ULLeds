module.exports = (e, t, r) => {
  "use strict";
  r.d(t, { U: () => i });
  var n = r(29783);
  const i = (e, t, r) => {
      a(r);
      const i = (0, n.Z)(e, t);
      return o[r].includes(i);
    },
    o = { ">": [1], ">=": [0, 1], "=": [0], "<=": [-1, 0], "<": [-1], "!=": [-1, 1] },
    s = Object.keys(o),
    a = (e) => {
      if ("string" != typeof e)
        throw new TypeError("Invalid operator type, expected string but got " + typeof e);
      if (-1 === s.indexOf(e)) throw new Error(`Invalid operator, expected one of ${s.join("|")}`);
    };
};

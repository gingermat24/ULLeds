module.exports = (e, t, r) => {
  const n = r(72904),
    i = r(71444),
    o = r(70201),
    s = r(138),
    a = r(47782),
    c = r(11871);
  e.exports = (e, t, r, l) => {
    switch (t) {
      case "===":
        return (
          "object" == typeof e && (e = e.version),
          "object" == typeof r && (r = r.version),
          e === r
        );
      case "!==":
        return (
          "object" == typeof e && (e = e.version),
          "object" == typeof r && (r = r.version),
          e !== r
        );
      case "":
      case "=":
      case "==":
        return n(e, r, l);
      case "!=":
        return i(e, r, l);
      case ">":
        return o(e, r, l);
      case ">=":
        return s(e, r, l);
      case "<":
        return a(e, r, l);
      case "<=":
        return c(e, r, l);
      default:
        throw new TypeError(`Invalid operator: ${t}`);
    }
  };
};

module.exports = (e, t, r) => {
  const n = r(91338),
    i = r(81006),
    o = r(92503),
    s = r(26164),
    a = r(5952),
    c = r(18349);
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

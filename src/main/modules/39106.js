module.exports = (e, t, r) => {
  const n = r(87662),
    i = r(76770),
    o = r(92627),
    s = r(48976),
    a = r(80956),
    c = r(39273);
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

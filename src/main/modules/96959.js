module.exports = (e) => {
  "use strict";
  e.exports = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : 1 === e.length ? "-" : "--",
      n = t.indexOf(r + e),
      i = t.indexOf("--");
    return -1 !== n && (-1 === i || n < i);
  };
};

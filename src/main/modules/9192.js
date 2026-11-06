module.exports = (e, t, r) => {
  "undefined" == typeof process ||
  "renderer" === process.type ||
  !0 === process.browser ||
  process.__nwjs
    ? (e.exports = r(47044))
    : (e.exports = r(97910));
};

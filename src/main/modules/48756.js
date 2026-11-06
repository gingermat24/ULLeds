module.exports = (e, t, r) => {
  var n;
  e.exports = function () {
    if (!n) {
      try {
        n = r(9192)("follow-redirects");
      } catch (e) {}
      "function" != typeof n && (n = function () {});
    }
    n.apply(null, arguments);
  };
};

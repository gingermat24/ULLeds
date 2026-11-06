module.exports = (e, t, n) => {
  var r = n(7860),
    o = Object.create,
    i = (function () {
      function e() {}
      return function (t) {
        if (!r(t)) return {};
        if (o) return o(t);
        e.prototype = t;
        var n = new e();
        return ((e.prototype = void 0), n);
      };
    })();
  e.exports = i;
};

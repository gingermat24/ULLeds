module.exports = (e, t, n) => {
  var r = n(1643),
    o = n(7860);
  e.exports = function (e) {
    if (!o(e)) return !1;
    var t = r(e);
    return (
      "[object Function]" == t ||
      "[object GeneratorFunction]" == t ||
      "[object AsyncFunction]" == t ||
      "[object Proxy]" == t
    );
  };
};

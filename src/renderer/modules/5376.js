module.exports = (e, t, n) => {
  var r = n(415),
    o = n(6575),
    i = n(7860),
    a = n(9978),
    s = /^\[object .+?Constructor\]$/,
    l = Function.prototype,
    d = Object.prototype,
    c = l.toString,
    A = d.hasOwnProperty,
    u = RegExp(
      "^" +
        c
          .call(A)
          .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") +
        "$",
    );
  e.exports = function (e) {
    return !(!i(e) || o(e)) && (r(e) ? u : s).test(a(e));
  };
};

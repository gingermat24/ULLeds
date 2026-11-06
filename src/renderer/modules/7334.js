module.exports = (e, t, n) => {
  var r = n(7433),
    o = n(6693),
    i = Object.prototype.hasOwnProperty;
  e.exports = function (e, t, n) {
    var a = e[t];
    (i.call(e, t) && o(a, n) && (void 0 !== n || t in e)) || r(e, t, n);
  };
};

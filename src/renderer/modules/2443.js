module.exports = (e, t, n) => {
  var r = n(2522),
    o = n(7329),
    i = Object.prototype.hasOwnProperty;
  e.exports = function (e) {
    if (!r(e)) return o(e);
    var t = [];
    for (var n in Object(e)) i.call(e, n) && "constructor" != n && t.push(n);
    return t;
  };
};

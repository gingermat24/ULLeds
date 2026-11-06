module.exports = (e, t, n) => {
  var r = n(861),
    o =
      /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    i = /\\(\\)?/g,
    a = r(function (e) {
      var t = [];
      return (
        46 === e.charCodeAt(0) && t.push(""),
        e.replace(o, function (e, n, r, o) {
          t.push(r ? o.replace(i, "$1") : n || e);
        }),
        t
      );
    });
  e.exports = a;
};

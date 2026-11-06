module.exports = (e) => {
  e.exports = function (e, t, n, r) {
    var o = n ? n.call(r, e, t) : void 0;
    if (void 0 !== o) return !!o;
    if (e === t) return !0;
    if ("object" != typeof e || !e || "object" != typeof t || !t) return !1;
    var i = Object.keys(e),
      a = Object.keys(t);
    if (i.length !== a.length) return !1;
    for (var s = Object.prototype.hasOwnProperty.bind(t), l = 0; l < i.length; l++) {
      var d = i[l];
      if (!s(d)) return !1;
      var c = e[d],
        A = t[d];
      if (!1 === (o = n ? n.call(r, c, A, d) : void 0) || (void 0 === o && c !== A)) return !1;
    }
    return !0;
  };
};

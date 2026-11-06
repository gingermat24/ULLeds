module.exports = (e) => {
  "use strict";
  var t = [];
  function n(e) {
    for (var n = -1, r = 0; r < t.length; r++)
      if (t[r].identifier === e) {
        n = r;
        break;
      }
    return n;
  }
  function r(e, r) {
    for (var i = {}, a = [], s = 0; s < e.length; s++) {
      var l = e[s],
        d = r.base ? l[0] + r.base : l[0],
        c = i[d] || 0,
        A = "".concat(d, " ").concat(c);
      i[d] = c + 1;
      var u = n(A),
        p = { css: l[1], media: l[2], sourceMap: l[3], supports: l[4], layer: l[5] };
      if (-1 !== u) (t[u].references++, t[u].updater(p));
      else {
        var f = o(p, r);
        ((r.byIndex = s), t.splice(s, 0, { identifier: A, updater: f, references: 1 }));
      }
      a.push(A);
    }
    return a;
  }
  function o(e, t) {
    var n = t.domAPI(t);
    return (
      n.update(e),
      function (t) {
        if (t) {
          if (
            t.css === e.css &&
            t.media === e.media &&
            t.sourceMap === e.sourceMap &&
            t.supports === e.supports &&
            t.layer === e.layer
          )
            return;
          n.update((e = t));
        } else n.remove();
      }
    );
  }
  e.exports = function (e, o) {
    var i = r((e = e || []), (o = o || {}));
    return function (e) {
      e = e || [];
      for (var a = 0; a < i.length; a++) {
        var s = n(i[a]);
        t[s].references--;
      }
      for (var l = r(e, o), d = 0; d < i.length; d++) {
        var c = n(i[d]);
        0 === t[c].references && (t[c].updater(), t.splice(c, 1));
      }
      i = l;
    };
  };
};

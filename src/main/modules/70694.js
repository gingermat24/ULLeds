module.exports = (e, t, r) => {
  "use strict";
  var n = r(90554);
  function i(e, t, r, n, i) {
    var o = "",
      s = "",
      a = Math.floor(i / 2) - 1;
    return (
      n - t > a && (t = n - a + (o = " ... ").length),
      r - n > a && (r = n + a - (s = " ...").length),
      { str: o + e.slice(t, r).replace(/\t/g, "→") + s, pos: n - t + o.length }
    );
  }
  function o(e, t) {
    return n.repeat(" ", t - e.length) + e;
  }
  e.exports = function (e, t) {
    if (((t = Object.create(t || null)), !e.buffer)) return null;
    (t.maxLength || (t.maxLength = 79),
      "number" != typeof t.indent && (t.indent = 1),
      "number" != typeof t.linesBefore && (t.linesBefore = 3),
      "number" != typeof t.linesAfter && (t.linesAfter = 2));
    for (var r, s = /\r?\n|\r|\0/g, a = [0], c = [], l = -1; (r = s.exec(e.buffer));)
      (c.push(r.index),
        a.push(r.index + r[0].length),
        e.position <= r.index && l < 0 && (l = a.length - 2));
    l < 0 && (l = a.length - 1);
    var u,
      p,
      d = "",
      f = Math.min(e.line + t.linesAfter, c.length).toString().length,
      h = t.maxLength - (t.indent + f + 3);
    for (u = 1; u <= t.linesBefore && !(l - u < 0); u++)
      ((p = i(e.buffer, a[l - u], c[l - u], e.position - (a[l] - a[l - u]), h)),
        (d =
          n.repeat(" ", t.indent) + o((e.line - u + 1).toString(), f) + " | " + p.str + "\n" + d));
    for (
      p = i(e.buffer, a[l], c[l], e.position, h),
        d += n.repeat(" ", t.indent) + o((e.line + 1).toString(), f) + " | " + p.str + "\n",
        d += n.repeat("-", t.indent + f + 3 + p.pos) + "^\n",
        u = 1;
      u <= t.linesAfter && !(l + u >= c.length);
      u++
    )
      ((p = i(e.buffer, a[l + u], c[l + u], e.position - (a[l] - a[l + u]), h)),
        (d += n.repeat(" ", t.indent) + o((e.line + u + 1).toString(), f) + " | " + p.str + "\n"));
    return d.replace(/\n$/, "");
  };
};

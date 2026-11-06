module.exports = (e, t, r) => {
  "use strict";
  var n = r(90554),
    i = r(92701),
    o = r(89698),
    s = Object.prototype.toString,
    a = Object.prototype.hasOwnProperty,
    c = 65279,
    l = {
      0: "\\0",
      7: "\\a",
      8: "\\b",
      9: "\\t",
      10: "\\n",
      11: "\\v",
      12: "\\f",
      13: "\\r",
      27: "\\e",
      34: '\\"',
      92: "\\\\",
      133: "\\N",
      160: "\\_",
      8232: "\\L",
      8233: "\\P",
    },
    u = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF",
    ],
    p = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function d(e) {
    var t, r, o;
    if (((t = e.toString(16).toUpperCase()), e <= 255)) ((r = "x"), (o = 2));
    else if (e <= 65535) ((r = "u"), (o = 4));
    else {
      if (!(e <= 4294967295))
        throw new i("code point within a string may not be greater than 0xFFFFFFFF");
      ((r = "U"), (o = 8));
    }
    return "\\" + r + n.repeat("0", o - t.length) + t;
  }
  function f(e) {
    ((this.schema = e.schema || o),
      (this.indent = Math.max(1, e.indent || 2)),
      (this.noArrayIndent = e.noArrayIndent || !1),
      (this.skipInvalid = e.skipInvalid || !1),
      (this.flowLevel = n.isNothing(e.flowLevel) ? -1 : e.flowLevel),
      (this.styleMap = (function (e, t) {
        var r, n, i, o, s, c, l;
        if (null === t) return {};
        for (r = {}, i = 0, o = (n = Object.keys(t)).length; i < o; i += 1)
          ((s = n[i]),
            (c = String(t[s])),
            "!!" === s.slice(0, 2) && (s = "tag:yaml.org,2002:" + s.slice(2)),
            (l = e.compiledTypeMap.fallback[s]) &&
              a.call(l.styleAliases, c) &&
              (c = l.styleAliases[c]),
            (r[s] = c));
        return r;
      })(this.schema, e.styles || null)),
      (this.sortKeys = e.sortKeys || !1),
      (this.lineWidth = e.lineWidth || 80),
      (this.noRefs = e.noRefs || !1),
      (this.noCompatMode = e.noCompatMode || !1),
      (this.condenseFlow = e.condenseFlow || !1),
      (this.quotingType = '"' === e.quotingType ? 2 : 1),
      (this.forceQuotes = e.forceQuotes || !1),
      (this.replacer = "function" == typeof e.replacer ? e.replacer : null),
      (this.implicitTypes = this.schema.compiledImplicit),
      (this.explicitTypes = this.schema.compiledExplicit),
      (this.tag = null),
      (this.result = ""),
      (this.duplicates = []),
      (this.usedDuplicates = null));
  }
  function h(e, t) {
    for (var r, i = n.repeat(" ", t), o = 0, s = -1, a = "", c = e.length; o < c;)
      (-1 === (s = e.indexOf("\n", o))
        ? ((r = e.slice(o)), (o = c))
        : ((r = e.slice(o, s + 1)), (o = s + 1)),
        r.length && "\n" !== r && (a += i),
        (a += r));
    return a;
  }
  function m(e, t) {
    return "\n" + n.repeat(" ", e.indent * t);
  }
  function g(e) {
    return 32 === e || 9 === e;
  }
  function v(e) {
    return (
      (32 <= e && e <= 126) ||
      (161 <= e && e <= 55295 && 8232 !== e && 8233 !== e) ||
      (57344 <= e && e <= 65533 && e !== c) ||
      (65536 <= e && e <= 1114111)
    );
  }
  function y(e) {
    return v(e) && e !== c && 13 !== e && 10 !== e;
  }
  function w(e, t, r) {
    var n = y(e),
      i = n && !g(e);
    return (
      ((r ? n : n && 44 !== e && 91 !== e && 93 !== e && 123 !== e && 125 !== e) &&
        35 !== e &&
        !(58 === t && !i)) ||
      (y(t) && !g(t) && 35 === e) ||
      (58 === t && i)
    );
  }
  function b(e, t) {
    var r,
      n = e.charCodeAt(t);
    return n >= 55296 &&
      n <= 56319 &&
      t + 1 < e.length &&
      (r = e.charCodeAt(t + 1)) >= 56320 &&
      r <= 57343
      ? 1024 * (n - 55296) + r - 56320 + 65536
      : n;
  }
  function x(e) {
    return /^\n* /.test(e);
  }
  function E(e, t, r, n, o) {
    e.dump = (function () {
      if (0 === t.length) return 2 === e.quotingType ? '""' : "''";
      if (!e.noCompatMode && (-1 !== u.indexOf(t) || p.test(t)))
        return 2 === e.quotingType ? '"' + t + '"' : "'" + t + "'";
      var s = e.indent * Math.max(1, r),
        a = -1 === e.lineWidth ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - s),
        f = n || (e.flowLevel > -1 && r >= e.flowLevel);
      switch (
        (function (e, t, r, n, i, o, s, a) {
          var l,
            u,
            p = 0,
            d = null,
            f = !1,
            h = !1,
            m = -1 !== n,
            y = -1,
            E =
              v((u = b(e, 0))) &&
              u !== c &&
              !g(u) &&
              45 !== u &&
              63 !== u &&
              58 !== u &&
              44 !== u &&
              91 !== u &&
              93 !== u &&
              123 !== u &&
              125 !== u &&
              35 !== u &&
              38 !== u &&
              42 !== u &&
              33 !== u &&
              124 !== u &&
              61 !== u &&
              62 !== u &&
              39 !== u &&
              34 !== u &&
              37 !== u &&
              64 !== u &&
              96 !== u &&
              (function (e) {
                return !g(e) && 58 !== e;
              })(b(e, e.length - 1));
          if (t || s)
            for (l = 0; l < e.length; p >= 65536 ? (l += 2) : l++) {
              if (!v((p = b(e, l)))) return 5;
              ((E = E && w(p, d, a)), (d = p));
            }
          else {
            for (l = 0; l < e.length; p >= 65536 ? (l += 2) : l++) {
              if (10 === (p = b(e, l)))
                ((f = !0), m && ((h = h || (l - y - 1 > n && " " !== e[y + 1])), (y = l)));
              else if (!v(p)) return 5;
              ((E = E && w(p, d, a)), (d = p));
            }
            h = h || (m && l - y - 1 > n && " " !== e[y + 1]);
          }
          return f || h
            ? r > 9 && x(e)
              ? 5
              : s
                ? 2 === o
                  ? 5
                  : 2
                : h
                  ? 4
                  : 3
            : !E || s || i(e)
              ? 2 === o
                ? 5
                : 2
              : 1;
        })(
          t,
          f,
          e.indent,
          a,
          function (t) {
            return (function (e, t) {
              var r, n;
              for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
                if (e.implicitTypes[r].resolve(t)) return !0;
              return !1;
            })(e, t);
          },
          e.quotingType,
          e.forceQuotes && !n,
          o,
        )
      ) {
        case 1:
          return t;
        case 2:
          return "'" + t.replace(/'/g, "''") + "'";
        case 3:
          return "|" + _(t, e.indent) + S(h(t, s));
        case 4:
          return (
            ">" +
            _(t, e.indent) +
            S(
              h(
                (function (e, t) {
                  for (
                    var r,
                      n,
                      i,
                      o = /(\n+)([^\n]*)/g,
                      s =
                        ((i = -1 !== (i = e.indexOf("\n")) ? i : e.length),
                        (o.lastIndex = i),
                        I(e.slice(0, i), t)),
                      a = "\n" === e[0] || " " === e[0];
                    (n = o.exec(e));
                  ) {
                    var c = n[1],
                      l = n[2];
                    ((r = " " === l[0]),
                      (s += c + (a || r || "" === l ? "" : "\n") + I(l, t)),
                      (a = r));
                  }
                  return s;
                })(t, a),
                s,
              ),
            )
          );
        case 5:
          return (
            '"' +
            (function (e) {
              for (var t, r = "", n = 0, i = 0; i < e.length; n >= 65536 ? (i += 2) : i++)
                ((n = b(e, i)),
                  !(t = l[n]) && v(n)
                    ? ((r += e[i]), n >= 65536 && (r += e[i + 1]))
                    : (r += t || d(n)));
              return r;
            })(t) +
            '"'
          );
        default:
          throw new i("impossible error: invalid scalar style");
      }
    })();
  }
  function _(e, t) {
    var r = x(e) ? String(t) : "",
      n = "\n" === e[e.length - 1];
    return r + (!n || ("\n" !== e[e.length - 2] && "\n" !== e) ? (n ? "" : "-") : "+") + "\n";
  }
  function S(e) {
    return "\n" === e[e.length - 1] ? e.slice(0, -1) : e;
  }
  function I(e, t) {
    if ("" === e || " " === e[0]) return e;
    for (var r, n, i = / [^ ]/g, o = 0, s = 0, a = 0, c = ""; (r = i.exec(e));)
      ((a = r.index) - o > t && ((n = s > o ? s : a), (c += "\n" + e.slice(o, n)), (o = n + 1)),
        (s = a));
    return (
      (c += "\n"),
      e.length - o > t && s > o ? (c += e.slice(o, s) + "\n" + e.slice(s + 1)) : (c += e.slice(o)),
      c.slice(1)
    );
  }
  function $(e, t, r, n) {
    var i,
      o,
      s,
      a = "",
      c = e.tag;
    for (i = 0, o = r.length; i < o; i += 1)
      ((s = r[i]),
        e.replacer && (s = e.replacer.call(r, String(i), s)),
        (R(e, t + 1, s, !0, !0, !1, !0) || (void 0 === s && R(e, t + 1, null, !0, !0, !1, !0))) &&
          ((n && "" === a) || (a += m(e, t)),
          e.dump && 10 === e.dump.charCodeAt(0) ? (a += "-") : (a += "- "),
          (a += e.dump)));
    ((e.tag = c), (e.dump = a || "[]"));
  }
  function O(e, t, r) {
    var n, o, c, l, u, p;
    for (c = 0, l = (o = r ? e.explicitTypes : e.implicitTypes).length; c < l; c += 1)
      if (
        ((u = o[c]).instanceOf || u.predicate) &&
        (!u.instanceOf || ("object" == typeof t && t instanceof u.instanceOf)) &&
        (!u.predicate || u.predicate(t))
      ) {
        if (
          (r
            ? u.multi && u.representName
              ? (e.tag = u.representName(t))
              : (e.tag = u.tag)
            : (e.tag = "?"),
          u.represent)
        ) {
          if (
            ((p = e.styleMap[u.tag] || u.defaultStyle), "[object Function]" === s.call(u.represent))
          )
            n = u.represent(t, p);
          else {
            if (!a.call(u.represent, p))
              throw new i("!<" + u.tag + '> tag resolver accepts not "' + p + '" style');
            n = u.represent[p](t, p);
          }
          e.dump = n;
        }
        return !0;
      }
    return !1;
  }
  function R(e, t, r, n, o, a, c) {
    ((e.tag = null), (e.dump = r), O(e, r, !1) || O(e, r, !0));
    var l,
      u = s.call(e.dump),
      p = n;
    n && (n = e.flowLevel < 0 || e.flowLevel > t);
    var d,
      f,
      h = "[object Object]" === u || "[object Array]" === u;
    if (
      (h && (f = -1 !== (d = e.duplicates.indexOf(r))),
      ((null !== e.tag && "?" !== e.tag) || f || (2 !== e.indent && t > 0)) && (o = !1),
      f && e.usedDuplicates[d])
    )
      e.dump = "*ref_" + d;
    else {
      if ((h && f && !e.usedDuplicates[d] && (e.usedDuplicates[d] = !0), "[object Object]" === u))
        n && 0 !== Object.keys(e.dump).length
          ? ((function (e, t, r, n) {
              var o,
                s,
                a,
                c,
                l,
                u,
                p = "",
                d = e.tag,
                f = Object.keys(r);
              if (!0 === e.sortKeys) f.sort();
              else if ("function" == typeof e.sortKeys) f.sort(e.sortKeys);
              else if (e.sortKeys) throw new i("sortKeys must be a boolean or a function");
              for (o = 0, s = f.length; o < s; o += 1)
                ((u = ""),
                  (n && "" === p) || (u += m(e, t)),
                  (c = r[(a = f[o])]),
                  e.replacer && (c = e.replacer.call(r, a, c)),
                  R(e, t + 1, a, !0, !0, !0) &&
                    ((l = (null !== e.tag && "?" !== e.tag) || (e.dump && e.dump.length > 1024)) &&
                      (e.dump && 10 === e.dump.charCodeAt(0) ? (u += "?") : (u += "? ")),
                    (u += e.dump),
                    l && (u += m(e, t)),
                    R(e, t + 1, c, !0, l) &&
                      (e.dump && 10 === e.dump.charCodeAt(0) ? (u += ":") : (u += ": "),
                      (p += u += e.dump))));
              ((e.tag = d), (e.dump = p || "{}"));
            })(e, t, e.dump, o),
            f && (e.dump = "&ref_" + d + e.dump))
          : ((function (e, t, r) {
              var n,
                i,
                o,
                s,
                a,
                c = "",
                l = e.tag,
                u = Object.keys(r);
              for (n = 0, i = u.length; n < i; n += 1)
                ((a = ""),
                  "" !== c && (a += ", "),
                  e.condenseFlow && (a += '"'),
                  (s = r[(o = u[n])]),
                  e.replacer && (s = e.replacer.call(r, o, s)),
                  R(e, t, o, !1, !1) &&
                    (e.dump.length > 1024 && (a += "? "),
                    (a += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " ")),
                    R(e, t, s, !1, !1) && (c += a += e.dump)));
              ((e.tag = l), (e.dump = "{" + c + "}"));
            })(e, t, e.dump),
            f && (e.dump = "&ref_" + d + " " + e.dump));
      else if ("[object Array]" === u)
        n && 0 !== e.dump.length
          ? (e.noArrayIndent && !c && t > 0 ? $(e, t - 1, e.dump, o) : $(e, t, e.dump, o),
            f && (e.dump = "&ref_" + d + e.dump))
          : ((function (e, t, r) {
              var n,
                i,
                o,
                s = "",
                a = e.tag;
              for (n = 0, i = r.length; n < i; n += 1)
                ((o = r[n]),
                  e.replacer && (o = e.replacer.call(r, String(n), o)),
                  (R(e, t, o, !1, !1) || (void 0 === o && R(e, t, null, !1, !1))) &&
                    ("" !== s && (s += "," + (e.condenseFlow ? "" : " ")), (s += e.dump)));
              ((e.tag = a), (e.dump = "[" + s + "]"));
            })(e, t, e.dump),
            f && (e.dump = "&ref_" + d + " " + e.dump));
      else {
        if ("[object String]" !== u) {
          if ("[object Undefined]" === u) return !1;
          if (e.skipInvalid) return !1;
          throw new i("unacceptable kind of an object to dump " + u);
        }
        "?" !== e.tag && E(e, e.dump, t, a, p);
      }
      null !== e.tag &&
        "?" !== e.tag &&
        ((l = encodeURI("!" === e.tag[0] ? e.tag.slice(1) : e.tag).replace(/!/g, "%21")),
        (l =
          "!" === e.tag[0]
            ? "!" + l
            : "tag:yaml.org,2002:" === l.slice(0, 18)
              ? "!!" + l.slice(18)
              : "!<" + l + ">"),
        (e.dump = l + " " + e.dump));
    }
    return !0;
  }
  function P(e, t) {
    var r,
      n,
      i = [],
      o = [];
    for (A(e, i, o), r = 0, n = o.length; r < n; r += 1) t.duplicates.push(i[o[r]]);
    t.usedDuplicates = new Array(n);
  }
  function A(e, t, r) {
    var n, i, o;
    if (null !== e && "object" == typeof e)
      if (-1 !== (i = t.indexOf(e))) -1 === r.indexOf(i) && r.push(i);
      else if ((t.push(e), Array.isArray(e)))
        for (i = 0, o = e.length; i < o; i += 1) A(e[i], t, r);
      else for (i = 0, o = (n = Object.keys(e)).length; i < o; i += 1) A(e[n[i]], t, r);
  }
  e.exports.dump = function (e, t) {
    var r = new f((t = t || {}));
    r.noRefs || P(e, r);
    var n = e;
    return (
      r.replacer && (n = r.replacer.call({ "": n }, "", n)),
      R(r, 0, n, !0, !0) ? r.dump + "\n" : ""
    );
  };
};

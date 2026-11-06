module.exports = (e, t, r) => {
  "use strict";
  var n = r(90554),
    i = r(92701),
    o = r(70694),
    s = r(89698),
    a = Object.prototype.hasOwnProperty,
    c =
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,
    l = /[\x85\u2028\u2029]/,
    u = /[,\[\]\{\}]/,
    p = /^(?:!|!!|![a-z\-]+!)$/i,
    d = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function f(e) {
    return Object.prototype.toString.call(e);
  }
  function h(e) {
    return 10 === e || 13 === e;
  }
  function m(e) {
    return 9 === e || 32 === e;
  }
  function g(e) {
    return 9 === e || 32 === e || 10 === e || 13 === e;
  }
  function v(e) {
    return 44 === e || 91 === e || 93 === e || 123 === e || 125 === e;
  }
  function y(e) {
    var t;
    return 48 <= e && e <= 57 ? e - 48 : 97 <= (t = 32 | e) && t <= 102 ? t - 97 + 10 : -1;
  }
  function w(e) {
    return 48 === e
      ? "\0"
      : 97 === e
        ? ""
        : 98 === e
          ? "\b"
          : 116 === e || 9 === e
            ? "\t"
            : 110 === e
              ? "\n"
              : 118 === e
                ? "\v"
                : 102 === e
                  ? "\f"
                  : 114 === e
                    ? "\r"
                    : 101 === e
                      ? ""
                      : 32 === e
                        ? " "
                        : 34 === e
                          ? '"'
                          : 47 === e
                            ? "/"
                            : 92 === e
                              ? "\\"
                              : 78 === e
                                ? ""
                                : 95 === e
                                  ? " "
                                  : 76 === e
                                    ? "\u2028"
                                    : 80 === e
                                      ? "\u2029"
                                      : "";
  }
  function b(e) {
    return e <= 65535
      ? String.fromCharCode(e)
      : String.fromCharCode(55296 + ((e - 65536) >> 10), 56320 + ((e - 65536) & 1023));
  }
  for (var x = new Array(256), E = new Array(256), _ = 0; _ < 256; _++)
    ((x[_] = w(_) ? 1 : 0), (E[_] = w(_)));
  function S(e, t) {
    ((this.input = e),
      (this.filename = t.filename || null),
      (this.schema = t.schema || s),
      (this.onWarning = t.onWarning || null),
      (this.legacy = t.legacy || !1),
      (this.json = t.json || !1),
      (this.listener = t.listener || null),
      (this.implicitTypes = this.schema.compiledImplicit),
      (this.typeMap = this.schema.compiledTypeMap),
      (this.length = e.length),
      (this.position = 0),
      (this.line = 0),
      (this.lineStart = 0),
      (this.lineIndent = 0),
      (this.firstTabInLine = -1),
      (this.documents = []));
  }
  function I(e, t) {
    var r = {
      name: e.filename,
      buffer: e.input.slice(0, -1),
      position: e.position,
      line: e.line,
      column: e.position - e.lineStart,
    };
    return ((r.snippet = o(r)), new i(t, r));
  }
  function $(e, t) {
    throw I(e, t);
  }
  function O(e, t) {
    e.onWarning && e.onWarning.call(null, I(e, t));
  }
  var R = {
    YAML: function (e, t, r) {
      var n, i, o;
      (null !== e.version && $(e, "duplication of %YAML directive"),
        1 !== r.length && $(e, "YAML directive accepts exactly one argument"),
        null === (n = /^([0-9]+)\.([0-9]+)$/.exec(r[0])) &&
          $(e, "ill-formed argument of the YAML directive"),
        (i = parseInt(n[1], 10)),
        (o = parseInt(n[2], 10)),
        1 !== i && $(e, "unacceptable YAML version of the document"),
        (e.version = r[0]),
        (e.checkLineBreaks = o < 2),
        1 !== o && 2 !== o && O(e, "unsupported YAML version of the document"));
    },
    TAG: function (e, t, r) {
      var n, i;
      (2 !== r.length && $(e, "TAG directive accepts exactly two arguments"),
        (n = r[0]),
        (i = r[1]),
        p.test(n) || $(e, "ill-formed tag handle (first argument) of the TAG directive"),
        a.call(e.tagMap, n) &&
          $(e, 'there is a previously declared suffix for "' + n + '" tag handle'),
        d.test(i) || $(e, "ill-formed tag prefix (second argument) of the TAG directive"));
      try {
        i = decodeURIComponent(i);
      } catch (t) {
        $(e, "tag prefix is malformed: " + i);
      }
      e.tagMap[n] = i;
    },
  };
  function P(e, t, r, n) {
    var i, o, s, a;
    if (t < r) {
      if (((a = e.input.slice(t, r)), n))
        for (i = 0, o = a.length; i < o; i += 1)
          9 === (s = a.charCodeAt(i)) ||
            (32 <= s && s <= 1114111) ||
            $(e, "expected valid JSON character");
      else c.test(a) && $(e, "the stream contains non-printable characters");
      e.result += a;
    }
  }
  function A(e, t, r, i) {
    var o, s, c, l;
    for (
      n.isObject(r) || $(e, "cannot merge mappings; the provided source object is unacceptable"),
        c = 0,
        l = (o = Object.keys(r)).length;
      c < l;
      c += 1
    )
      ((s = o[c]), a.call(t, s) || ((t[s] = r[s]), (i[s] = !0)));
  }
  function T(e, t, r, n, i, o, s, c, l) {
    var u, p;
    if (Array.isArray(i))
      for (u = 0, p = (i = Array.prototype.slice.call(i)).length; u < p; u += 1)
        (Array.isArray(i[u]) && $(e, "nested arrays are not supported inside keys"),
          "object" == typeof i && "[object Object]" === f(i[u]) && (i[u] = "[object Object]"));
    if (
      ("object" == typeof i && "[object Object]" === f(i) && (i = "[object Object]"),
      (i = String(i)),
      null === t && (t = {}),
      "tag:yaml.org,2002:merge" === n)
    )
      if (Array.isArray(o)) for (u = 0, p = o.length; u < p; u += 1) A(e, t, o[u], r);
      else A(e, t, o, r);
    else
      (e.json ||
        a.call(r, i) ||
        !a.call(t, i) ||
        ((e.line = s || e.line),
        (e.lineStart = c || e.lineStart),
        (e.position = l || e.position),
        $(e, "duplicated mapping key")),
        "__proto__" === i
          ? Object.defineProperty(t, i, {
              configurable: !0,
              enumerable: !0,
              writable: !0,
              value: o,
            })
          : (t[i] = o),
        delete r[i]);
    return t;
  }
  function k(e) {
    var t;
    (10 === (t = e.input.charCodeAt(e.position))
      ? e.position++
      : 13 === t
        ? (e.position++, 10 === e.input.charCodeAt(e.position) && e.position++)
        : $(e, "a line break is expected"),
      (e.line += 1),
      (e.lineStart = e.position),
      (e.firstTabInLine = -1));
  }
  function N(e, t, r) {
    for (var n = 0, i = e.input.charCodeAt(e.position); 0 !== i;) {
      for (; m(i);)
        (9 === i && -1 === e.firstTabInLine && (e.firstTabInLine = e.position),
          (i = e.input.charCodeAt(++e.position)));
      if (t && 35 === i)
        do {
          i = e.input.charCodeAt(++e.position);
        } while (10 !== i && 13 !== i && 0 !== i);
      if (!h(i)) break;
      for (k(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; 32 === i;)
        (e.lineIndent++, (i = e.input.charCodeAt(++e.position)));
    }
    return (-1 !== r && 0 !== n && e.lineIndent < r && O(e, "deficient indentation"), n);
  }
  function C(e) {
    var t,
      r = e.position;
    return !(
      (45 !== (t = e.input.charCodeAt(r)) && 46 !== t) ||
      t !== e.input.charCodeAt(r + 1) ||
      t !== e.input.charCodeAt(r + 2) ||
      ((r += 3), 0 !== (t = e.input.charCodeAt(r)) && !g(t))
    );
  }
  function L(e, t) {
    1 === t ? (e.result += " ") : t > 1 && (e.result += n.repeat("\n", t - 1));
  }
  function D(e, t) {
    var r,
      n,
      i = e.tag,
      o = e.anchor,
      s = [],
      a = !1;
    if (-1 !== e.firstTabInLine) return !1;
    for (
      null !== e.anchor && (e.anchorMap[e.anchor] = s), n = e.input.charCodeAt(e.position);
      0 !== n &&
      (-1 !== e.firstTabInLine &&
        ((e.position = e.firstTabInLine), $(e, "tab characters must not be used in indentation")),
      45 === n) &&
      g(e.input.charCodeAt(e.position + 1));
    )
      if (((a = !0), e.position++, N(e, !0, -1) && e.lineIndent <= t))
        (s.push(null), (n = e.input.charCodeAt(e.position)));
      else if (
        ((r = e.line),
        M(e, t, 3, !1, !0),
        s.push(e.result),
        N(e, !0, -1),
        (n = e.input.charCodeAt(e.position)),
        (e.line === r || e.lineIndent > t) && 0 !== n)
      )
        $(e, "bad indentation of a sequence entry");
      else if (e.lineIndent < t) break;
    return !!a && ((e.tag = i), (e.anchor = o), (e.kind = "sequence"), (e.result = s), !0);
  }
  function j(e) {
    var t,
      r,
      n,
      i,
      o = !1,
      s = !1;
    if (33 !== (i = e.input.charCodeAt(e.position))) return !1;
    if (
      (null !== e.tag && $(e, "duplication of a tag property"),
      60 === (i = e.input.charCodeAt(++e.position))
        ? ((o = !0), (i = e.input.charCodeAt(++e.position)))
        : 33 === i
          ? ((s = !0), (r = "!!"), (i = e.input.charCodeAt(++e.position)))
          : (r = "!"),
      (t = e.position),
      o)
    ) {
      do {
        i = e.input.charCodeAt(++e.position);
      } while (0 !== i && 62 !== i);
      e.position < e.length
        ? ((n = e.input.slice(t, e.position)), (i = e.input.charCodeAt(++e.position)))
        : $(e, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; 0 !== i && !g(i);)
        (33 === i &&
          (s
            ? $(e, "tag suffix cannot contain exclamation marks")
            : ((r = e.input.slice(t - 1, e.position + 1)),
              p.test(r) || $(e, "named tag handle cannot contain such characters"),
              (s = !0),
              (t = e.position + 1))),
          (i = e.input.charCodeAt(++e.position)));
      ((n = e.input.slice(t, e.position)),
        u.test(n) && $(e, "tag suffix cannot contain flow indicator characters"));
    }
    n && !d.test(n) && $(e, "tag name cannot contain such characters: " + n);
    try {
      n = decodeURIComponent(n);
    } catch (t) {
      $(e, "tag name is malformed: " + n);
    }
    return (
      o
        ? (e.tag = n)
        : a.call(e.tagMap, r)
          ? (e.tag = e.tagMap[r] + n)
          : "!" === r
            ? (e.tag = "!" + n)
            : "!!" === r
              ? (e.tag = "tag:yaml.org,2002:" + n)
              : $(e, 'undeclared tag handle "' + r + '"'),
      !0
    );
  }
  function U(e) {
    var t, r;
    if (38 !== (r = e.input.charCodeAt(e.position))) return !1;
    for (
      null !== e.anchor && $(e, "duplication of an anchor property"),
        r = e.input.charCodeAt(++e.position),
        t = e.position;
      0 !== r && !g(r) && !v(r);
    )
      r = e.input.charCodeAt(++e.position);
    return (
      e.position === t && $(e, "name of an anchor node must contain at least one character"),
      (e.anchor = e.input.slice(t, e.position)),
      !0
    );
  }
  function M(e, t, r, i, o) {
    var s,
      c,
      l,
      u,
      p,
      d,
      f,
      w,
      _,
      S = 1,
      I = !1,
      O = !1;
    if (
      (null !== e.listener && e.listener("open", e),
      (e.tag = null),
      (e.anchor = null),
      (e.kind = null),
      (e.result = null),
      (s = c = l = 4 === r || 3 === r),
      i &&
        N(e, !0, -1) &&
        ((I = !0),
        e.lineIndent > t ? (S = 1) : e.lineIndent === t ? (S = 0) : e.lineIndent < t && (S = -1)),
      1 === S)
    )
      for (; j(e) || U(e);)
        N(e, !0, -1)
          ? ((I = !0),
            (l = s),
            e.lineIndent > t
              ? (S = 1)
              : e.lineIndent === t
                ? (S = 0)
                : e.lineIndent < t && (S = -1))
          : (l = !1);
    if (
      (l && (l = I || o),
      (1 !== S && 4 !== r) ||
        ((w = 1 === r || 2 === r ? t : t + 1),
        (_ = e.position - e.lineStart),
        1 === S
          ? (l &&
              (D(e, _) ||
                (function (e, t, r) {
                  var n,
                    i,
                    o,
                    s,
                    a,
                    c,
                    l,
                    u = e.tag,
                    p = e.anchor,
                    d = {},
                    f = Object.create(null),
                    h = null,
                    v = null,
                    y = null,
                    w = !1,
                    b = !1;
                  if (-1 !== e.firstTabInLine) return !1;
                  for (
                    null !== e.anchor && (e.anchorMap[e.anchor] = d),
                      l = e.input.charCodeAt(e.position);
                    0 !== l;
                  ) {
                    if (
                      (w ||
                        -1 === e.firstTabInLine ||
                        ((e.position = e.firstTabInLine),
                        $(e, "tab characters must not be used in indentation")),
                      (n = e.input.charCodeAt(e.position + 1)),
                      (o = e.line),
                      (63 !== l && 58 !== l) || !g(n))
                    ) {
                      if (((s = e.line), (a = e.lineStart), (c = e.position), !M(e, r, 2, !1, !0)))
                        break;
                      if (e.line === o) {
                        for (l = e.input.charCodeAt(e.position); m(l);)
                          l = e.input.charCodeAt(++e.position);
                        if (58 === l)
                          (g((l = e.input.charCodeAt(++e.position))) ||
                            $(
                              e,
                              "a whitespace character is expected after the key-value separator within a block mapping",
                            ),
                            w && (T(e, d, f, h, v, null, s, a, c), (h = v = y = null)),
                            (b = !0),
                            (w = !1),
                            (i = !1),
                            (h = e.tag),
                            (v = e.result));
                        else {
                          if (!b) return ((e.tag = u), (e.anchor = p), !0);
                          $(e, "can not read an implicit mapping pair; a colon is missed");
                        }
                      } else {
                        if (!b) return ((e.tag = u), (e.anchor = p), !0);
                        $(
                          e,
                          "can not read a block mapping entry; a multiline key may not be an implicit key",
                        );
                      }
                    } else
                      (63 === l
                        ? (w && (T(e, d, f, h, v, null, s, a, c), (h = v = y = null)),
                          (b = !0),
                          (w = !0),
                          (i = !0))
                        : w
                          ? ((w = !1), (i = !0))
                          : $(
                              e,
                              "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line",
                            ),
                        (e.position += 1),
                        (l = n));
                    if (
                      ((e.line === o || e.lineIndent > t) &&
                        (w && ((s = e.line), (a = e.lineStart), (c = e.position)),
                        M(e, t, 4, !0, i) && (w ? (v = e.result) : (y = e.result)),
                        w || (T(e, d, f, h, v, y, s, a, c), (h = v = y = null)),
                        N(e, !0, -1),
                        (l = e.input.charCodeAt(e.position))),
                      (e.line === o || e.lineIndent > t) && 0 !== l)
                    )
                      $(e, "bad indentation of a mapping entry");
                    else if (e.lineIndent < t) break;
                  }
                  return (
                    w && T(e, d, f, h, v, null, s, a, c),
                    b && ((e.tag = u), (e.anchor = p), (e.kind = "mapping"), (e.result = d)),
                    b
                  );
                })(e, _, w))) ||
            (function (e, t) {
              var r,
                n,
                i,
                o,
                s,
                a,
                c,
                l,
                u,
                p,
                d,
                f,
                h = !0,
                m = e.tag,
                v = e.anchor,
                y = Object.create(null);
              if (91 === (f = e.input.charCodeAt(e.position))) ((s = 93), (l = !1), (o = []));
              else {
                if (123 !== f) return !1;
                ((s = 125), (l = !0), (o = {}));
              }
              for (
                null !== e.anchor && (e.anchorMap[e.anchor] = o),
                  f = e.input.charCodeAt(++e.position);
                0 !== f;
              ) {
                if ((N(e, !0, t), (f = e.input.charCodeAt(e.position)) === s))
                  return (
                    e.position++,
                    (e.tag = m),
                    (e.anchor = v),
                    (e.kind = l ? "mapping" : "sequence"),
                    (e.result = o),
                    !0
                  );
                (h
                  ? 44 === f && $(e, "expected the node content, but found ','")
                  : $(e, "missed comma between flow collection entries"),
                  (d = null),
                  (a = c = !1),
                  63 === f &&
                    g(e.input.charCodeAt(e.position + 1)) &&
                    ((a = c = !0), e.position++, N(e, !0, t)),
                  (r = e.line),
                  (n = e.lineStart),
                  (i = e.position),
                  M(e, t, 1, !1, !0),
                  (p = e.tag),
                  (u = e.result),
                  N(e, !0, t),
                  (f = e.input.charCodeAt(e.position)),
                  (!c && e.line !== r) ||
                    58 !== f ||
                    ((a = !0),
                    (f = e.input.charCodeAt(++e.position)),
                    N(e, !0, t),
                    M(e, t, 1, !1, !0),
                    (d = e.result)),
                  l
                    ? T(e, o, y, p, u, d, r, n, i)
                    : a
                      ? o.push(T(e, null, y, p, u, d, r, n, i))
                      : o.push(u),
                  N(e, !0, t),
                  44 === (f = e.input.charCodeAt(e.position))
                    ? ((h = !0), (f = e.input.charCodeAt(++e.position)))
                    : (h = !1));
              }
              $(e, "unexpected end of the stream within a flow collection");
            })(e, w)
            ? (O = !0)
            : ((c &&
                (function (e, t) {
                  var r,
                    i,
                    o,
                    s,
                    a,
                    c = 1,
                    l = !1,
                    u = !1,
                    p = t,
                    d = 0,
                    f = !1;
                  if (124 === (s = e.input.charCodeAt(e.position))) i = !1;
                  else {
                    if (62 !== s) return !1;
                    i = !0;
                  }
                  for (e.kind = "scalar", e.result = ""; 0 !== s;)
                    if (43 === (s = e.input.charCodeAt(++e.position)) || 45 === s)
                      1 === c
                        ? (c = 43 === s ? 3 : 2)
                        : $(e, "repeat of a chomping mode identifier");
                    else {
                      if (!((o = 48 <= (a = s) && a <= 57 ? a - 48 : -1) >= 0)) break;
                      0 === o
                        ? $(
                            e,
                            "bad explicit indentation width of a block scalar; it cannot be less than one",
                          )
                        : u
                          ? $(e, "repeat of an indentation width identifier")
                          : ((p = t + o - 1), (u = !0));
                    }
                  if (m(s)) {
                    do {
                      s = e.input.charCodeAt(++e.position);
                    } while (m(s));
                    if (35 === s)
                      do {
                        s = e.input.charCodeAt(++e.position);
                      } while (!h(s) && 0 !== s);
                  }
                  for (; 0 !== s;) {
                    for (
                      k(e), e.lineIndent = 0, s = e.input.charCodeAt(e.position);
                      (!u || e.lineIndent < p) && 32 === s;
                    )
                      (e.lineIndent++, (s = e.input.charCodeAt(++e.position)));
                    if ((!u && e.lineIndent > p && (p = e.lineIndent), h(s))) d++;
                    else {
                      if (e.lineIndent < p) {
                        3 === c
                          ? (e.result += n.repeat("\n", l ? 1 + d : d))
                          : 1 === c && l && (e.result += "\n");
                        break;
                      }
                      for (
                        i
                          ? m(s)
                            ? ((f = !0), (e.result += n.repeat("\n", l ? 1 + d : d)))
                            : f
                              ? ((f = !1), (e.result += n.repeat("\n", d + 1)))
                              : 0 === d
                                ? l && (e.result += " ")
                                : (e.result += n.repeat("\n", d))
                          : (e.result += n.repeat("\n", l ? 1 + d : d)),
                          l = !0,
                          u = !0,
                          d = 0,
                          r = e.position;
                        !h(s) && 0 !== s;
                      )
                        s = e.input.charCodeAt(++e.position);
                      P(e, r, e.position, !1);
                    }
                  }
                  return !0;
                })(e, w)) ||
              (function (e, t) {
                var r, n, i;
                if (39 !== (r = e.input.charCodeAt(e.position))) return !1;
                for (
                  e.kind = "scalar", e.result = "", e.position++, n = i = e.position;
                  0 !== (r = e.input.charCodeAt(e.position));
                )
                  if (39 === r) {
                    if ((P(e, n, e.position, !0), 39 !== (r = e.input.charCodeAt(++e.position))))
                      return !0;
                    ((n = e.position), e.position++, (i = e.position));
                  } else
                    h(r)
                      ? (P(e, n, i, !0), L(e, N(e, !1, t)), (n = i = e.position))
                      : e.position === e.lineStart && C(e)
                        ? $(e, "unexpected end of the document within a single quoted scalar")
                        : (e.position++, (i = e.position));
                $(e, "unexpected end of the stream within a single quoted scalar");
              })(e, w) ||
              (function (e, t) {
                var r, n, i, o, s, a, c;
                if (34 !== (a = e.input.charCodeAt(e.position))) return !1;
                for (
                  e.kind = "scalar", e.result = "", e.position++, r = n = e.position;
                  0 !== (a = e.input.charCodeAt(e.position));
                ) {
                  if (34 === a) return (P(e, r, e.position, !0), e.position++, !0);
                  if (92 === a) {
                    if ((P(e, r, e.position, !0), h((a = e.input.charCodeAt(++e.position)))))
                      N(e, !1, t);
                    else if (a < 256 && x[a]) ((e.result += E[a]), e.position++);
                    else if ((s = 120 === (c = a) ? 2 : 117 === c ? 4 : 85 === c ? 8 : 0) > 0) {
                      for (i = s, o = 0; i > 0; i--)
                        (s = y((a = e.input.charCodeAt(++e.position)))) >= 0
                          ? (o = (o << 4) + s)
                          : $(e, "expected hexadecimal character");
                      ((e.result += b(o)), e.position++);
                    } else $(e, "unknown escape sequence");
                    r = n = e.position;
                  } else
                    h(a)
                      ? (P(e, r, n, !0), L(e, N(e, !1, t)), (r = n = e.position))
                      : e.position === e.lineStart && C(e)
                        ? $(e, "unexpected end of the document within a double quoted scalar")
                        : (e.position++, (n = e.position));
                }
                $(e, "unexpected end of the stream within a double quoted scalar");
              })(e, w)
                ? (O = !0)
                : (function (e) {
                      var t, r, n;
                      if (42 !== (n = e.input.charCodeAt(e.position))) return !1;
                      for (
                        n = e.input.charCodeAt(++e.position), t = e.position;
                        0 !== n && !g(n) && !v(n);
                      )
                        n = e.input.charCodeAt(++e.position);
                      return (
                        e.position === t &&
                          $(e, "name of an alias node must contain at least one character"),
                        (r = e.input.slice(t, e.position)),
                        a.call(e.anchorMap, r) || $(e, 'unidentified alias "' + r + '"'),
                        (e.result = e.anchorMap[r]),
                        N(e, !0, -1),
                        !0
                      );
                    })(e)
                  ? ((O = !0),
                    (null === e.tag && null === e.anchor) ||
                      $(e, "alias node should not have any properties"))
                  : (function (e, t, r) {
                      var n,
                        i,
                        o,
                        s,
                        a,
                        c,
                        l,
                        u,
                        p = e.kind,
                        d = e.result;
                      if (
                        g((u = e.input.charCodeAt(e.position))) ||
                        v(u) ||
                        35 === u ||
                        38 === u ||
                        42 === u ||
                        33 === u ||
                        124 === u ||
                        62 === u ||
                        39 === u ||
                        34 === u ||
                        37 === u ||
                        64 === u ||
                        96 === u
                      )
                        return !1;
                      if (
                        (63 === u || 45 === u) &&
                        (g((n = e.input.charCodeAt(e.position + 1))) || (r && v(n)))
                      )
                        return !1;
                      for (e.kind = "scalar", e.result = "", i = o = e.position, s = !1; 0 !== u;) {
                        if (58 === u) {
                          if (g((n = e.input.charCodeAt(e.position + 1))) || (r && v(n))) break;
                        } else if (35 === u) {
                          if (g(e.input.charCodeAt(e.position - 1))) break;
                        } else {
                          if ((e.position === e.lineStart && C(e)) || (r && v(u))) break;
                          if (h(u)) {
                            if (
                              ((a = e.line),
                              (c = e.lineStart),
                              (l = e.lineIndent),
                              N(e, !1, -1),
                              e.lineIndent >= t)
                            ) {
                              ((s = !0), (u = e.input.charCodeAt(e.position)));
                              continue;
                            }
                            ((e.position = o), (e.line = a), (e.lineStart = c), (e.lineIndent = l));
                            break;
                          }
                        }
                        (s && (P(e, i, o, !1), L(e, e.line - a), (i = o = e.position), (s = !1)),
                          m(u) || (o = e.position + 1),
                          (u = e.input.charCodeAt(++e.position)));
                      }
                      return (P(e, i, o, !1), !!e.result || ((e.kind = p), (e.result = d), !1));
                    })(e, w, 1 === r) && ((O = !0), null === e.tag && (e.tag = "?")),
              null !== e.anchor && (e.anchorMap[e.anchor] = e.result))
          : 0 === S && (O = l && D(e, _))),
      null === e.tag)
    )
      null !== e.anchor && (e.anchorMap[e.anchor] = e.result);
    else if ("?" === e.tag) {
      for (
        null !== e.result &&
          "scalar" !== e.kind &&
          $(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'),
          u = 0,
          p = e.implicitTypes.length;
        u < p;
        u += 1
      )
        if ((f = e.implicitTypes[u]).resolve(e.result)) {
          ((e.result = f.construct(e.result)),
            (e.tag = f.tag),
            null !== e.anchor && (e.anchorMap[e.anchor] = e.result));
          break;
        }
    } else if ("!" !== e.tag) {
      if (a.call(e.typeMap[e.kind || "fallback"], e.tag))
        f = e.typeMap[e.kind || "fallback"][e.tag];
      else
        for (f = null, u = 0, p = (d = e.typeMap.multi[e.kind || "fallback"]).length; u < p; u += 1)
          if (e.tag.slice(0, d[u].tag.length) === d[u].tag) {
            f = d[u];
            break;
          }
      (f || $(e, "unknown tag !<" + e.tag + ">"),
        null !== e.result &&
          f.kind !== e.kind &&
          $(
            e,
            "unacceptable node kind for !<" +
              e.tag +
              '> tag; it should be "' +
              f.kind +
              '", not "' +
              e.kind +
              '"',
          ),
        f.resolve(e.result, e.tag)
          ? ((e.result = f.construct(e.result, e.tag)),
            null !== e.anchor && (e.anchorMap[e.anchor] = e.result))
          : $(e, "cannot resolve a node with !<" + e.tag + "> explicit tag"));
    }
    return (
      null !== e.listener && e.listener("close", e),
      null !== e.tag || null !== e.anchor || O
    );
  }
  function F(e) {
    var t,
      r,
      n,
      i,
      o = e.position,
      s = !1;
    for (
      e.version = null,
        e.checkLineBreaks = e.legacy,
        e.tagMap = Object.create(null),
        e.anchorMap = Object.create(null);
      0 !== (i = e.input.charCodeAt(e.position)) &&
      (N(e, !0, -1), (i = e.input.charCodeAt(e.position)), !(e.lineIndent > 0 || 37 !== i));
    ) {
      for (s = !0, i = e.input.charCodeAt(++e.position), t = e.position; 0 !== i && !g(i);)
        i = e.input.charCodeAt(++e.position);
      for (
        n = [],
          (r = e.input.slice(t, e.position)).length < 1 &&
            $(e, "directive name must not be less than one character in length");
        0 !== i;
      ) {
        for (; m(i);) i = e.input.charCodeAt(++e.position);
        if (35 === i) {
          do {
            i = e.input.charCodeAt(++e.position);
          } while (0 !== i && !h(i));
          break;
        }
        if (h(i)) break;
        for (t = e.position; 0 !== i && !g(i);) i = e.input.charCodeAt(++e.position);
        n.push(e.input.slice(t, e.position));
      }
      (0 !== i && k(e),
        a.call(R, r) ? R[r](e, r, n) : O(e, 'unknown document directive "' + r + '"'));
    }
    (N(e, !0, -1),
      0 === e.lineIndent &&
      45 === e.input.charCodeAt(e.position) &&
      45 === e.input.charCodeAt(e.position + 1) &&
      45 === e.input.charCodeAt(e.position + 2)
        ? ((e.position += 3), N(e, !0, -1))
        : s && $(e, "directives end mark is expected"),
      M(e, e.lineIndent - 1, 4, !1, !0),
      N(e, !0, -1),
      e.checkLineBreaks &&
        l.test(e.input.slice(o, e.position)) &&
        O(e, "non-ASCII line breaks are interpreted as content"),
      e.documents.push(e.result),
      e.position === e.lineStart && C(e)
        ? 46 === e.input.charCodeAt(e.position) && ((e.position += 3), N(e, !0, -1))
        : e.position < e.length - 1 &&
          $(e, "end of the stream or a document separator is expected"));
  }
  function z(e, t) {
    ((t = t || {}),
      0 !== (e = String(e)).length &&
        (10 !== e.charCodeAt(e.length - 1) && 13 !== e.charCodeAt(e.length - 1) && (e += "\n"),
        65279 === e.charCodeAt(0) && (e = e.slice(1))));
    var r = new S(e, t),
      n = e.indexOf("\0");
    for (
      -1 !== n && ((r.position = n), $(r, "null byte is not allowed in input")), r.input += "\0";
      32 === r.input.charCodeAt(r.position);
    )
      ((r.lineIndent += 1), (r.position += 1));
    for (; r.position < r.length - 1;) F(r);
    return r.documents;
  }
  ((e.exports.loadAll = function (e, t, r) {
    null !== t && "object" == typeof t && void 0 === r && ((r = t), (t = null));
    var n = z(e, r);
    if ("function" != typeof t) return n;
    for (var i = 0, o = n.length; i < o; i += 1) t(n[i]);
  }),
    (e.exports.load = function (e, t) {
      var r = z(e, t);
      if (0 !== r.length) {
        if (1 === r.length) return r[0];
        throw new i("expected a single document in the stream, but found more");
      }
    }));
};

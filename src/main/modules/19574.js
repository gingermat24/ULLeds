module.exports = (e, t, r) => {
  !(function (e) {
    ((e.parser = function (e, t) {
      return new i(e, t);
    }),
      (e.SAXParser = i),
      (e.SAXStream = s),
      (e.createStream = function (e, t) {
        return new s(e, t);
      }),
      (e.MAX_BUFFER_LENGTH = 65536));
    var t,
      n = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script",
      ];
    function i(t, r) {
      if (!(this instanceof i)) return new i(t, r);
      var o = this;
      (!(function (e) {
        for (var t = 0, r = n.length; t < r; t++) e[n[t]] = "";
      })(o),
        (o.q = o.c = ""),
        (o.bufferCheckPosition = e.MAX_BUFFER_LENGTH),
        (o.opt = r || {}),
        (o.opt.lowercase = o.opt.lowercase || o.opt.lowercasetags),
        (o.looseCase = o.opt.lowercase ? "toLowerCase" : "toUpperCase"),
        (o.tags = []),
        (o.closed = o.closedRoot = o.sawRoot = !1),
        (o.tag = o.error = null),
        (o.strict = !!t),
        (o.noscript = !(!t && !o.opt.noscript)),
        (o.state = S.BEGIN),
        (o.strictEntities = o.opt.strictEntities),
        (o.ENTITIES = o.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES)),
        (o.attribList = []),
        o.opt.xmlns && (o.ns = Object.create(p)),
        void 0 === o.opt.unquotedAttributeValues && (o.opt.unquotedAttributeValues = !t),
        (o.trackPosition = !1 !== o.opt.position),
        o.trackPosition && (o.position = o.line = o.column = 0),
        $(o, "onready"));
    }
    ((e.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace",
    ]),
      Object.create ||
        (Object.create = function (e) {
          function t() {}
          return ((t.prototype = e), new t());
        }),
      Object.keys ||
        (Object.keys = function (e) {
          var t = [];
          for (var r in e) e.hasOwnProperty(r) && t.push(r);
          return t;
        }),
      (i.prototype = {
        end: function () {
          T(this);
        },
        write: function (t) {
          var r = this;
          if (this.error) throw this.error;
          if (r.closed) return A(r, "Cannot write after close. Assign an onready handler.");
          if (null === t) return T(r);
          "object" == typeof t && (t = t.toString());
          for (var i = 0, o = ""; (o = F(t, i++)), (r.c = o), o;)
            switch (
              (r.trackPosition &&
                (r.position++, "\n" === o ? (r.line++, (r.column = 0)) : r.column++),
              r.state)
            ) {
              case S.BEGIN:
                if (((r.state = S.BEGIN_WHITESPACE), "\ufeff" === o)) continue;
                M(r, o);
                continue;
              case S.BEGIN_WHITESPACE:
                M(r, o);
                continue;
              case S.TEXT:
                if (r.sawRoot && !r.closedRoot) {
                  for (var s = i - 1; o && "<" !== o && "&" !== o;)
                    (o = F(t, i++)) &&
                      r.trackPosition &&
                      (r.position++, "\n" === o ? (r.line++, (r.column = 0)) : r.column++);
                  r.textNode += t.substring(s, i - 1);
                }
                "<" !== o || (r.sawRoot && r.closedRoot && !r.strict)
                  ? (g(o) ||
                      (r.sawRoot && !r.closedRoot) ||
                      k(r, "Text data outside of root node."),
                    "&" === o ? (r.state = S.TEXT_ENTITY) : (r.textNode += o))
                  : ((r.state = S.OPEN_WAKA), (r.startTagPosition = r.position));
                continue;
              case S.SCRIPT:
                "<" === o ? (r.state = S.SCRIPT_ENDING) : (r.script += o);
                continue;
              case S.SCRIPT_ENDING:
                "/" === o ? (r.state = S.CLOSE_TAG) : ((r.script += "<" + o), (r.state = S.SCRIPT));
                continue;
              case S.OPEN_WAKA:
                if ("!" === o) ((r.state = S.SGML_DECL), (r.sgmlDecl = ""));
                else if (g(o));
                else if (w(d, o)) ((r.state = S.OPEN_TAG), (r.tagName = o));
                else if ("/" === o) ((r.state = S.CLOSE_TAG), (r.tagName = ""));
                else if ("?" === o)
                  ((r.state = S.PROC_INST), (r.procInstName = r.procInstBody = ""));
                else {
                  if ((k(r, "Unencoded <"), r.startTagPosition + 1 < r.position)) {
                    var l = r.position - r.startTagPosition;
                    o = new Array(l).join(" ") + o;
                  }
                  ((r.textNode += "<" + o), (r.state = S.TEXT));
                }
                continue;
              case S.SGML_DECL:
                if (r.sgmlDecl + o === "--") {
                  ((r.state = S.COMMENT), (r.comment = ""), (r.sgmlDecl = ""));
                  continue;
                }
                r.doctype && !0 !== r.doctype && r.sgmlDecl
                  ? ((r.state = S.DOCTYPE_DTD),
                    (r.doctype += "<!" + r.sgmlDecl + o),
                    (r.sgmlDecl = ""))
                  : (r.sgmlDecl + o).toUpperCase() === a
                    ? (O(r, "onopencdata"), (r.state = S.CDATA), (r.sgmlDecl = ""), (r.cdata = ""))
                    : (r.sgmlDecl + o).toUpperCase() === c
                      ? ((r.state = S.DOCTYPE),
                        (r.doctype || r.sawRoot) &&
                          k(r, "Inappropriately located doctype declaration"),
                        (r.doctype = ""),
                        (r.sgmlDecl = ""))
                      : ">" === o
                        ? (O(r, "onsgmldeclaration", r.sgmlDecl),
                          (r.sgmlDecl = ""),
                          (r.state = S.TEXT))
                        : v(o)
                          ? ((r.state = S.SGML_DECL_QUOTED), (r.sgmlDecl += o))
                          : (r.sgmlDecl += o);
                continue;
              case S.SGML_DECL_QUOTED:
                (o === r.q && ((r.state = S.SGML_DECL), (r.q = "")), (r.sgmlDecl += o));
                continue;
              case S.DOCTYPE:
                ">" === o
                  ? ((r.state = S.TEXT), O(r, "ondoctype", r.doctype), (r.doctype = !0))
                  : ((r.doctype += o),
                    "[" === o
                      ? (r.state = S.DOCTYPE_DTD)
                      : v(o) && ((r.state = S.DOCTYPE_QUOTED), (r.q = o)));
                continue;
              case S.DOCTYPE_QUOTED:
                ((r.doctype += o), o === r.q && ((r.q = ""), (r.state = S.DOCTYPE)));
                continue;
              case S.DOCTYPE_DTD:
                "]" === o
                  ? ((r.doctype += o), (r.state = S.DOCTYPE))
                  : "<" === o
                    ? ((r.state = S.OPEN_WAKA), (r.startTagPosition = r.position))
                    : v(o)
                      ? ((r.doctype += o), (r.state = S.DOCTYPE_DTD_QUOTED), (r.q = o))
                      : (r.doctype += o);
                continue;
              case S.DOCTYPE_DTD_QUOTED:
                ((r.doctype += o), o === r.q && ((r.state = S.DOCTYPE_DTD), (r.q = "")));
                continue;
              case S.COMMENT:
                "-" === o ? (r.state = S.COMMENT_ENDING) : (r.comment += o);
                continue;
              case S.COMMENT_ENDING:
                "-" === o
                  ? ((r.state = S.COMMENT_ENDED),
                    (r.comment = P(r.opt, r.comment)),
                    r.comment && O(r, "oncomment", r.comment),
                    (r.comment = ""))
                  : ((r.comment += "-" + o), (r.state = S.COMMENT));
                continue;
              case S.COMMENT_ENDED:
                ">" !== o
                  ? (k(r, "Malformed comment"), (r.comment += "--" + o), (r.state = S.COMMENT))
                  : r.doctype && !0 !== r.doctype
                    ? (r.state = S.DOCTYPE_DTD)
                    : (r.state = S.TEXT);
                continue;
              case S.CDATA:
                "]" === o ? (r.state = S.CDATA_ENDING) : (r.cdata += o);
                continue;
              case S.CDATA_ENDING:
                "]" === o
                  ? (r.state = S.CDATA_ENDING_2)
                  : ((r.cdata += "]" + o), (r.state = S.CDATA));
                continue;
              case S.CDATA_ENDING_2:
                ">" === o
                  ? (r.cdata && O(r, "oncdata", r.cdata),
                    O(r, "onclosecdata"),
                    (r.cdata = ""),
                    (r.state = S.TEXT))
                  : "]" === o
                    ? (r.cdata += "]")
                    : ((r.cdata += "]]" + o), (r.state = S.CDATA));
                continue;
              case S.PROC_INST:
                "?" === o
                  ? (r.state = S.PROC_INST_ENDING)
                  : g(o)
                    ? (r.state = S.PROC_INST_BODY)
                    : (r.procInstName += o);
                continue;
              case S.PROC_INST_BODY:
                if (!r.procInstBody && g(o)) continue;
                "?" === o ? (r.state = S.PROC_INST_ENDING) : (r.procInstBody += o);
                continue;
              case S.PROC_INST_ENDING:
                ">" === o
                  ? (O(r, "onprocessinginstruction", {
                      name: r.procInstName,
                      body: r.procInstBody,
                    }),
                    (r.procInstName = r.procInstBody = ""),
                    (r.state = S.TEXT))
                  : ((r.procInstBody += "?" + o), (r.state = S.PROC_INST_BODY));
                continue;
              case S.OPEN_TAG:
                w(f, o)
                  ? (r.tagName += o)
                  : (N(r),
                    ">" === o
                      ? D(r)
                      : "/" === o
                        ? (r.state = S.OPEN_TAG_SLASH)
                        : (g(o) || k(r, "Invalid character in tag name"), (r.state = S.ATTRIB)));
                continue;
              case S.OPEN_TAG_SLASH:
                ">" === o
                  ? (D(r, !0), j(r))
                  : (k(r, "Forward-slash in opening tag not followed by >"), (r.state = S.ATTRIB));
                continue;
              case S.ATTRIB:
                if (g(o)) continue;
                ">" === o
                  ? D(r)
                  : "/" === o
                    ? (r.state = S.OPEN_TAG_SLASH)
                    : w(d, o)
                      ? ((r.attribName = o), (r.attribValue = ""), (r.state = S.ATTRIB_NAME))
                      : k(r, "Invalid attribute name");
                continue;
              case S.ATTRIB_NAME:
                "=" === o
                  ? (r.state = S.ATTRIB_VALUE)
                  : ">" === o
                    ? (k(r, "Attribute without value"), (r.attribValue = r.attribName), L(r), D(r))
                    : g(o)
                      ? (r.state = S.ATTRIB_NAME_SAW_WHITE)
                      : w(f, o)
                        ? (r.attribName += o)
                        : k(r, "Invalid attribute name");
                continue;
              case S.ATTRIB_NAME_SAW_WHITE:
                if ("=" === o) r.state = S.ATTRIB_VALUE;
                else {
                  if (g(o)) continue;
                  (k(r, "Attribute without value"),
                    (r.tag.attributes[r.attribName] = ""),
                    (r.attribValue = ""),
                    O(r, "onattribute", { name: r.attribName, value: "" }),
                    (r.attribName = ""),
                    ">" === o
                      ? D(r)
                      : w(d, o)
                        ? ((r.attribName = o), (r.state = S.ATTRIB_NAME))
                        : (k(r, "Invalid attribute name"), (r.state = S.ATTRIB)));
                }
                continue;
              case S.ATTRIB_VALUE:
                if (g(o)) continue;
                v(o)
                  ? ((r.q = o), (r.state = S.ATTRIB_VALUE_QUOTED))
                  : (r.opt.unquotedAttributeValues || A(r, "Unquoted attribute value"),
                    (r.state = S.ATTRIB_VALUE_UNQUOTED),
                    (r.attribValue = o));
                continue;
              case S.ATTRIB_VALUE_QUOTED:
                if (o !== r.q) {
                  "&" === o ? (r.state = S.ATTRIB_VALUE_ENTITY_Q) : (r.attribValue += o);
                  continue;
                }
                (L(r), (r.q = ""), (r.state = S.ATTRIB_VALUE_CLOSED));
                continue;
              case S.ATTRIB_VALUE_CLOSED:
                g(o)
                  ? (r.state = S.ATTRIB)
                  : ">" === o
                    ? D(r)
                    : "/" === o
                      ? (r.state = S.OPEN_TAG_SLASH)
                      : w(d, o)
                        ? (k(r, "No whitespace between attributes"),
                          (r.attribName = o),
                          (r.attribValue = ""),
                          (r.state = S.ATTRIB_NAME))
                        : k(r, "Invalid attribute name");
                continue;
              case S.ATTRIB_VALUE_UNQUOTED:
                if (!y(o)) {
                  "&" === o ? (r.state = S.ATTRIB_VALUE_ENTITY_U) : (r.attribValue += o);
                  continue;
                }
                (L(r), ">" === o ? D(r) : (r.state = S.ATTRIB));
                continue;
              case S.CLOSE_TAG:
                if (r.tagName)
                  ">" === o
                    ? j(r)
                    : w(f, o)
                      ? (r.tagName += o)
                      : r.script
                        ? ((r.script += "</" + r.tagName), (r.tagName = ""), (r.state = S.SCRIPT))
                        : (g(o) || k(r, "Invalid tagname in closing tag"),
                          (r.state = S.CLOSE_TAG_SAW_WHITE));
                else {
                  if (g(o)) continue;
                  b(d, o)
                    ? r.script
                      ? ((r.script += "</" + o), (r.state = S.SCRIPT))
                      : k(r, "Invalid tagname in closing tag.")
                    : (r.tagName = o);
                }
                continue;
              case S.CLOSE_TAG_SAW_WHITE:
                if (g(o)) continue;
                ">" === o ? j(r) : k(r, "Invalid characters in closing tag");
                continue;
              case S.TEXT_ENTITY:
              case S.ATTRIB_VALUE_ENTITY_Q:
              case S.ATTRIB_VALUE_ENTITY_U:
                var u, p;
                switch (r.state) {
                  case S.TEXT_ENTITY:
                    ((u = S.TEXT), (p = "textNode"));
                    break;
                  case S.ATTRIB_VALUE_ENTITY_Q:
                    ((u = S.ATTRIB_VALUE_QUOTED), (p = "attribValue"));
                    break;
                  case S.ATTRIB_VALUE_ENTITY_U:
                    ((u = S.ATTRIB_VALUE_UNQUOTED), (p = "attribValue"));
                }
                if (";" === o) {
                  var x = U(r);
                  r.opt.unparsedEntities && !Object.values(e.XML_ENTITIES).includes(x)
                    ? ((r.entity = ""), (r.state = u), r.write(x))
                    : ((r[p] += x), (r.entity = ""), (r.state = u));
                } else
                  w(r.entity.length ? m : h, o)
                    ? (r.entity += o)
                    : (k(r, "Invalid character in entity name"),
                      (r[p] += "&" + r.entity + o),
                      (r.entity = ""),
                      (r.state = u));
                continue;
              default:
                throw new Error(r, "Unknown state: " + r.state);
            }
          return (
            r.position >= r.bufferCheckPosition &&
              (function (t) {
                for (
                  var r = Math.max(e.MAX_BUFFER_LENGTH, 10), i = 0, o = 0, s = n.length;
                  o < s;
                  o++
                ) {
                  var a = t[n[o]].length;
                  if (a > r)
                    switch (n[o]) {
                      case "textNode":
                        R(t);
                        break;
                      case "cdata":
                        (O(t, "oncdata", t.cdata), (t.cdata = ""));
                        break;
                      case "script":
                        (O(t, "onscript", t.script), (t.script = ""));
                        break;
                      default:
                        A(t, "Max buffer length exceeded: " + n[o]);
                    }
                  i = Math.max(i, a);
                }
                var c = e.MAX_BUFFER_LENGTH - i;
                t.bufferCheckPosition = c + t.position;
              })(r),
            r
          );
        },
        resume: function () {
          return ((this.error = null), this);
        },
        close: function () {
          return this.write(null);
        },
        flush: function () {
          var e;
          (R((e = this)),
            "" !== e.cdata && (O(e, "oncdata", e.cdata), (e.cdata = "")),
            "" !== e.script && (O(e, "onscript", e.script), (e.script = "")));
        },
      }));
    try {
      t = r(2203).Stream;
    } catch (e) {
      t = function () {};
    }
    t || (t = function () {});
    var o = e.EVENTS.filter(function (e) {
      return "error" !== e && "end" !== e;
    });
    function s(e, r) {
      if (!(this instanceof s)) return new s(e, r);
      (t.apply(this), (this._parser = new i(e, r)), (this.writable = !0), (this.readable = !0));
      var n = this;
      ((this._parser.onend = function () {
        n.emit("end");
      }),
        (this._parser.onerror = function (e) {
          (n.emit("error", e), (n._parser.error = null));
        }),
        (this._decoder = null),
        o.forEach(function (e) {
          Object.defineProperty(n, "on" + e, {
            get: function () {
              return n._parser["on" + e];
            },
            set: function (t) {
              if (!t) return (n.removeAllListeners(e), (n._parser["on" + e] = t), t);
              n.on(e, t);
            },
            enumerable: !0,
            configurable: !1,
          });
        }));
    }
    ((s.prototype = Object.create(t.prototype, { constructor: { value: s } })),
      (s.prototype.write = function (e) {
        if (
          "function" == typeof Buffer &&
          "function" == typeof Buffer.isBuffer &&
          Buffer.isBuffer(e)
        ) {
          if (!this._decoder) {
            var t = r(13193).StringDecoder;
            this._decoder = new t("utf8");
          }
          e = this._decoder.write(e);
        }
        return (this._parser.write(e.toString()), this.emit("data", e), !0);
      }),
      (s.prototype.end = function (e) {
        return (e && e.length && this.write(e), this._parser.end(), !0);
      }),
      (s.prototype.on = function (e, r) {
        var n = this;
        return (
          n._parser["on" + e] ||
            -1 === o.indexOf(e) ||
            (n._parser["on" + e] = function () {
              var t = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
              (t.splice(0, 0, e), n.emit.apply(n, t));
            }),
          t.prototype.on.call(n, e, r)
        );
      }));
    var a = "[CDATA[",
      c = "DOCTYPE",
      l = "http://www.w3.org/XML/1998/namespace",
      u = "http://www.w3.org/2000/xmlns/",
      p = { xml: l, xmlns: u },
      d =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      f =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/,
      h =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      m =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function g(e) {
      return " " === e || "\n" === e || "\r" === e || "\t" === e;
    }
    function v(e) {
      return '"' === e || "'" === e;
    }
    function y(e) {
      return ">" === e || g(e);
    }
    function w(e, t) {
      return e.test(t);
    }
    function b(e, t) {
      return !w(e, t);
    }
    var x,
      E,
      _,
      S = 0;
    for (var I in ((e.STATE = {
      BEGIN: S++,
      BEGIN_WHITESPACE: S++,
      TEXT: S++,
      TEXT_ENTITY: S++,
      OPEN_WAKA: S++,
      SGML_DECL: S++,
      SGML_DECL_QUOTED: S++,
      DOCTYPE: S++,
      DOCTYPE_QUOTED: S++,
      DOCTYPE_DTD: S++,
      DOCTYPE_DTD_QUOTED: S++,
      COMMENT_STARTING: S++,
      COMMENT: S++,
      COMMENT_ENDING: S++,
      COMMENT_ENDED: S++,
      CDATA: S++,
      CDATA_ENDING: S++,
      CDATA_ENDING_2: S++,
      PROC_INST: S++,
      PROC_INST_BODY: S++,
      PROC_INST_ENDING: S++,
      OPEN_TAG: S++,
      OPEN_TAG_SLASH: S++,
      ATTRIB: S++,
      ATTRIB_NAME: S++,
      ATTRIB_NAME_SAW_WHITE: S++,
      ATTRIB_VALUE: S++,
      ATTRIB_VALUE_QUOTED: S++,
      ATTRIB_VALUE_CLOSED: S++,
      ATTRIB_VALUE_UNQUOTED: S++,
      ATTRIB_VALUE_ENTITY_Q: S++,
      ATTRIB_VALUE_ENTITY_U: S++,
      CLOSE_TAG: S++,
      CLOSE_TAG_SAW_WHITE: S++,
      SCRIPT: S++,
      SCRIPT_ENDING: S++,
    }),
    (e.XML_ENTITIES = { amp: "&", gt: ">", lt: "<", quot: '"', apos: "'" }),
    (e.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830,
    }),
    Object.keys(e.ENTITIES).forEach(function (t) {
      var r = e.ENTITIES[t],
        n = "number" == typeof r ? String.fromCharCode(r) : r;
      e.ENTITIES[t] = n;
    }),
    e.STATE))
      e.STATE[e.STATE[I]] = I;
    function $(e, t, r) {
      e[t] && e[t](r);
    }
    function O(e, t, r) {
      (e.textNode && R(e), $(e, t, r));
    }
    function R(e) {
      ((e.textNode = P(e.opt, e.textNode)),
        e.textNode && $(e, "ontext", e.textNode),
        (e.textNode = ""));
    }
    function P(e, t) {
      return (e.trim && (t = t.trim()), e.normalize && (t = t.replace(/\s+/g, " ")), t);
    }
    function A(e, t) {
      return (
        R(e),
        e.trackPosition && (t += "\nLine: " + e.line + "\nColumn: " + e.column + "\nChar: " + e.c),
        (t = new Error(t)),
        (e.error = t),
        $(e, "onerror", t),
        e
      );
    }
    function T(e) {
      return (
        e.sawRoot && !e.closedRoot && k(e, "Unclosed root tag"),
        e.state !== S.BEGIN &&
          e.state !== S.BEGIN_WHITESPACE &&
          e.state !== S.TEXT &&
          A(e, "Unexpected end"),
        R(e),
        (e.c = ""),
        (e.closed = !0),
        $(e, "onend"),
        i.call(e, e.strict, e.opt),
        e
      );
    }
    function k(e, t) {
      if ("object" != typeof e || !(e instanceof i)) throw new Error("bad call to strictFail");
      e.strict && A(e, t);
    }
    function N(e) {
      e.strict || (e.tagName = e.tagName[e.looseCase]());
      var t = e.tags[e.tags.length - 1] || e,
        r = (e.tag = { name: e.tagName, attributes: {} });
      (e.opt.xmlns && (r.ns = t.ns), (e.attribList.length = 0), O(e, "onopentagstart", r));
    }
    function C(e, t) {
      var r = e.indexOf(":") < 0 ? ["", e] : e.split(":"),
        n = r[0],
        i = r[1];
      return (t && "xmlns" === e && ((n = "xmlns"), (i = "")), { prefix: n, local: i });
    }
    function L(e) {
      if (
        (e.strict || (e.attribName = e.attribName[e.looseCase]()),
        -1 !== e.attribList.indexOf(e.attribName) || e.tag.attributes.hasOwnProperty(e.attribName))
      )
        e.attribName = e.attribValue = "";
      else {
        if (e.opt.xmlns) {
          var t = C(e.attribName, !0),
            r = t.prefix,
            n = t.local;
          if ("xmlns" === r)
            if ("xml" === n && e.attribValue !== l)
              k(e, "xml: prefix must be bound to " + l + "\nActual: " + e.attribValue);
            else if ("xmlns" === n && e.attribValue !== u)
              k(e, "xmlns: prefix must be bound to " + u + "\nActual: " + e.attribValue);
            else {
              var i = e.tag,
                o = e.tags[e.tags.length - 1] || e;
              (i.ns === o.ns && (i.ns = Object.create(o.ns)), (i.ns[n] = e.attribValue));
            }
          e.attribList.push([e.attribName, e.attribValue]);
        } else
          ((e.tag.attributes[e.attribName] = e.attribValue),
            O(e, "onattribute", { name: e.attribName, value: e.attribValue }));
        e.attribName = e.attribValue = "";
      }
    }
    function D(e, t) {
      if (e.opt.xmlns) {
        var r = e.tag,
          n = C(e.tagName);
        ((r.prefix = n.prefix),
          (r.local = n.local),
          (r.uri = r.ns[n.prefix] || ""),
          r.prefix &&
            !r.uri &&
            (k(e, "Unbound namespace prefix: " + JSON.stringify(e.tagName)), (r.uri = n.prefix)));
        var i = e.tags[e.tags.length - 1] || e;
        r.ns &&
          i.ns !== r.ns &&
          Object.keys(r.ns).forEach(function (t) {
            O(e, "onopennamespace", { prefix: t, uri: r.ns[t] });
          });
        for (var o = 0, s = e.attribList.length; o < s; o++) {
          var a = e.attribList[o],
            c = a[0],
            l = a[1],
            u = C(c, !0),
            p = u.prefix,
            d = u.local,
            f = "" === p ? "" : r.ns[p] || "",
            h = { name: c, value: l, prefix: p, local: d, uri: f };
          (p &&
            "xmlns" !== p &&
            !f &&
            (k(e, "Unbound namespace prefix: " + JSON.stringify(p)), (h.uri = p)),
            (e.tag.attributes[c] = h),
            O(e, "onattribute", h));
        }
        e.attribList.length = 0;
      }
      ((e.tag.isSelfClosing = !!t),
        (e.sawRoot = !0),
        e.tags.push(e.tag),
        O(e, "onopentag", e.tag),
        t ||
          (e.noscript || "script" !== e.tagName.toLowerCase()
            ? (e.state = S.TEXT)
            : (e.state = S.SCRIPT),
          (e.tag = null),
          (e.tagName = "")),
        (e.attribName = e.attribValue = ""),
        (e.attribList.length = 0));
    }
    function j(e) {
      if (!e.tagName)
        return (k(e, "Weird empty close tag."), (e.textNode += "</>"), void (e.state = S.TEXT));
      if (e.script) {
        if ("script" !== e.tagName)
          return (
            (e.script += "</" + e.tagName + ">"),
            (e.tagName = ""),
            void (e.state = S.SCRIPT)
          );
        (O(e, "onscript", e.script), (e.script = ""));
      }
      var t = e.tags.length,
        r = e.tagName;
      e.strict || (r = r[e.looseCase]());
      for (var n = r; t-- && e.tags[t].name !== n;) k(e, "Unexpected close tag");
      if (t < 0)
        return (
          k(e, "Unmatched closing tag: " + e.tagName),
          (e.textNode += "</" + e.tagName + ">"),
          void (e.state = S.TEXT)
        );
      e.tagName = r;
      for (var i = e.tags.length; i-- > t;) {
        var o = (e.tag = e.tags.pop());
        ((e.tagName = e.tag.name), O(e, "onclosetag", e.tagName));
        var s = {};
        for (var a in o.ns) s[a] = o.ns[a];
        var c = e.tags[e.tags.length - 1] || e;
        e.opt.xmlns &&
          o.ns !== c.ns &&
          Object.keys(o.ns).forEach(function (t) {
            var r = o.ns[t];
            O(e, "onclosenamespace", { prefix: t, uri: r });
          });
      }
      (0 === t && (e.closedRoot = !0),
        (e.tagName = e.attribValue = e.attribName = ""),
        (e.attribList.length = 0),
        (e.state = S.TEXT));
    }
    function U(e) {
      var t,
        r = e.entity,
        n = r.toLowerCase(),
        i = "";
      return e.ENTITIES[r]
        ? e.ENTITIES[r]
        : e.ENTITIES[n]
          ? e.ENTITIES[n]
          : ("#" === (r = n).charAt(0) &&
              ("x" === r.charAt(1)
                ? ((r = r.slice(2)), (i = (t = parseInt(r, 16)).toString(16)))
                : ((r = r.slice(1)), (i = (t = parseInt(r, 10)).toString(10)))),
            (r = r.replace(/^0+/, "")),
            isNaN(t) || i.toLowerCase() !== r
              ? (k(e, "Invalid character entity"), "&" + e.entity + ";")
              : String.fromCodePoint(t));
    }
    function M(e, t) {
      "<" === t
        ? ((e.state = S.OPEN_WAKA), (e.startTagPosition = e.position))
        : g(t) || (k(e, "Non-whitespace before first tag."), (e.textNode = t), (e.state = S.TEXT));
    }
    function F(e, t) {
      var r = "";
      return (t < e.length && (r = e.charAt(t)), r);
    }
    ((S = e.STATE),
      String.fromCodePoint ||
        ((x = String.fromCharCode),
        (E = Math.floor),
        (_ = function () {
          var e,
            t,
            r = [],
            n = -1,
            i = arguments.length;
          if (!i) return "";
          for (var o = ""; ++n < i;) {
            var s = Number(arguments[n]);
            if (!isFinite(s) || s < 0 || s > 1114111 || E(s) !== s)
              throw RangeError("Invalid code point: " + s);
            (s <= 65535
              ? r.push(s)
              : ((e = 55296 + ((s -= 65536) >> 10)), (t = (s % 1024) + 56320), r.push(e, t)),
              (n + 1 === i || r.length > 16384) && ((o += x.apply(null, r)), (r.length = 0)));
          }
          return o;
        }),
        Object.defineProperty
          ? Object.defineProperty(String, "fromCodePoint", {
              value: _,
              configurable: !0,
              writable: !0,
            })
          : (String.fromCodePoint = _)));
  })(t);
};

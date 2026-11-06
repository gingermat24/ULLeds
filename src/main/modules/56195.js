module.exports = (e, t, r) => {
  const { MAX_SAFE_COMPONENT_LENGTH: n, MAX_SAFE_BUILD_LENGTH: i, MAX_LENGTH: o } = r(83593),
    s = r(17403),
    a = ((t = e.exports = {}).re = []),
    c = (t.safeRe = []),
    l = (t.src = []),
    u = (t.t = {});
  let p = 0;
  const d = "[a-zA-Z0-9-]",
    f = [
      ["\\s", 1],
      ["\\d", o],
      [d, i],
    ],
    h = (e, t, r) => {
      const n = ((e) => {
          for (const [t, r] of f)
            e = e.split(`${t}*`).join(`${t}{0,${r}}`).split(`${t}+`).join(`${t}{1,${r}}`);
          return e;
        })(t),
        i = p++;
      (s(e, i, t),
        (u[e] = i),
        (l[i] = t),
        (a[i] = new RegExp(t, r ? "g" : void 0)),
        (c[i] = new RegExp(n, r ? "g" : void 0)));
    };
  (h("NUMERICIDENTIFIER", "0|[1-9]\\d*"),
    h("NUMERICIDENTIFIERLOOSE", "\\d+"),
    h("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`),
    h(
      "MAINVERSION",
      `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`,
    ),
    h(
      "MAINVERSIONLOOSE",
      `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`,
    ),
    h("PRERELEASEIDENTIFIER", `(?:${l[u.NUMERICIDENTIFIER]}|${l[u.NONNUMERICIDENTIFIER]})`),
    h(
      "PRERELEASEIDENTIFIERLOOSE",
      `(?:${l[u.NUMERICIDENTIFIERLOOSE]}|${l[u.NONNUMERICIDENTIFIER]})`,
    ),
    h("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`),
    h(
      "PRERELEASELOOSE",
      `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`,
    ),
    h("BUILDIDENTIFIER", `${d}+`),
    h("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`),
    h("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`),
    h("FULL", `^${l[u.FULLPLAIN]}$`),
    h("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`),
    h("LOOSE", `^${l[u.LOOSEPLAIN]}$`),
    h("GTLT", "((?:<|>)?=?)"),
    h("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),
    h("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`),
    h(
      "XRANGEPLAIN",
      `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`,
    ),
    h(
      "XRANGEPLAINLOOSE",
      `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`,
    ),
    h("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`),
    h("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`),
    h("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`),
    h("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`),
    h(
      "COERCEFULL",
      l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?` + `(?:${l[u.BUILD]})?(?:$|[^\\d])`,
    ),
    h("COERCERTL", l[u.COERCE], !0),
    h("COERCERTLFULL", l[u.COERCEFULL], !0),
    h("LONETILDE", "(?:~>?)"),
    h("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0),
    (t.tildeTrimReplace = "$1~"),
    h("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`),
    h("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`),
    h("LONECARET", "(?:\\^)"),
    h("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0),
    (t.caretTrimReplace = "$1^"),
    h("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`),
    h("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`),
    h("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`),
    h("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`),
    h("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0),
    (t.comparatorTrimReplace = "$1$2$3"),
    h("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`),
    h(
      "HYPHENRANGELOOSE",
      `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`,
    ),
    h("STAR", "(<|>)?=?\\s*\\*"),
    h("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"),
    h("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$"));
};

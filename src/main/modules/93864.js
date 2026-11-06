module.exports = (e, t, r) => {
  "use strict";
  const n = r(70857),
    i = r(52018),
    o = r(96959),
    { env: s } = process;
  let a;
  function c(e) {
    return 0 !== e && { level: e, hasBasic: !0, has256: e >= 2, has16m: e >= 3 };
  }
  function l(e, t) {
    if (0 === a) return 0;
    if (o("color=16m") || o("color=full") || o("color=truecolor")) return 3;
    if (o("color=256")) return 2;
    if (e && !t && void 0 === a) return 0;
    const r = a || 0;
    if ("dumb" === s.TERM) return r;
    if ("win32" === process.platform) {
      const e = n.release().split(".");
      return Number(e[0]) >= 10 && Number(e[2]) >= 10586 ? (Number(e[2]) >= 14931 ? 3 : 2) : 1;
    }
    if ("CI" in s)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some(
        (e) => e in s,
      ) || "codeship" === s.CI_NAME
        ? 1
        : r;
    if ("TEAMCITY_VERSION" in s)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(s.TEAMCITY_VERSION) ? 1 : 0;
    if ("truecolor" === s.COLORTERM) return 3;
    if ("TERM_PROGRAM" in s) {
      const e = parseInt((s.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (s.TERM_PROGRAM) {
        case "iTerm.app":
          return e >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(s.TERM)
      ? 2
      : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(s.TERM) ||
          "COLORTERM" in s
        ? 1
        : r;
  }
  (o("no-color") || o("no-colors") || o("color=false") || o("color=never")
    ? (a = 0)
    : (o("color") || o("colors") || o("color=true") || o("color=always")) && (a = 1),
    "FORCE_COLOR" in s &&
      (a =
        "true" === s.FORCE_COLOR
          ? 1
          : "false" === s.FORCE_COLOR
            ? 0
            : 0 === s.FORCE_COLOR.length
              ? 1
              : Math.min(parseInt(s.FORCE_COLOR, 10), 3)),
    (e.exports = {
      supportsColor: function (e) {
        return c(l(e, e && e.isTTY));
      },
      stdout: c(l(!0, i.isatty(1))),
      stderr: c(l(!0, i.isatty(2))),
    }));
};

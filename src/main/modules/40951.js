module.exports = (e, t, r) => {
  "use strict";
  var n = r(92701),
    i = [
      "kind",
      "multi",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "representName",
      "defaultStyle",
      "styleAliases",
    ],
    o = ["scalar", "sequence", "mapping"];
  e.exports = function (e, t) {
    var r, s;
    if (
      ((t = t || {}),
      Object.keys(t).forEach(function (t) {
        if (-1 === i.indexOf(t))
          throw new n('Unknown option "' + t + '" is met in definition of "' + e + '" YAML type.');
      }),
      (this.options = t),
      (this.tag = e),
      (this.kind = t.kind || null),
      (this.resolve =
        t.resolve ||
        function () {
          return !0;
        }),
      (this.construct =
        t.construct ||
        function (e) {
          return e;
        }),
      (this.instanceOf = t.instanceOf || null),
      (this.predicate = t.predicate || null),
      (this.represent = t.represent || null),
      (this.representName = t.representName || null),
      (this.defaultStyle = t.defaultStyle || null),
      (this.multi = t.multi || !1),
      (this.styleAliases =
        ((r = t.styleAliases || null),
        (s = {}),
        null !== r &&
          Object.keys(r).forEach(function (e) {
            r[e].forEach(function (t) {
              s[String(t)] = e;
            });
          }),
        s)),
      -1 === o.indexOf(this.kind))
    )
      throw new n('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
  };
};

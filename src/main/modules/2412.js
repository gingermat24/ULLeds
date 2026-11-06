module.exports = (e, t, r) => {
  "use strict";
  var n = r(40951);
  e.exports = new n("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: function (e) {
      return "<<" === e || null === e;
    },
  });
};

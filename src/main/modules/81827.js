module.exports = (e, t, r) => {
  "use strict";
  var n = r(63760),
    i = r(37338);
  function o(e, t) {
    return function () {
      throw new Error(
        "Function yaml." +
          e +
          " is removed in js-yaml 4. Use yaml." +
          t +
          " instead, which is now safe by default.",
      );
    };
  }
  ((e.exports.Type = r(40951)),
    (e.exports.Schema = r(48304)),
    (e.exports.FAILSAFE_SCHEMA = r(47790)),
    (e.exports.JSON_SCHEMA = r(73161)),
    (e.exports.CORE_SCHEMA = r(1632)),
    (e.exports.DEFAULT_SCHEMA = r(89698)),
    (e.exports.load = n.load),
    (e.exports.loadAll = n.loadAll),
    (e.exports.dump = i.dump),
    (e.exports.YAMLException = r(92701)),
    (e.exports.types = {
      binary: r(92507),
      float: r(5806),
      map: r(27546),
      null: r(23003),
      pairs: r(1545),
      set: r(64288),
      timestamp: r(63608),
      bool: r(64118),
      int: r(79713),
      merge: r(2412),
      omap: r(34679),
      seq: r(66195),
      str: r(53119),
    }),
    (e.exports.safeLoad = o("safeLoad", "load")),
    (e.exports.safeLoadAll = o("safeLoadAll", "loadAll")),
    (e.exports.safeDump = o("safeDump", "dump")));
};

module.exports = (e, t, n) => {
  "use strict";
  var r = n(6689),
    o =
      "function" == typeof Object.is
        ? Object.is
        : function (e, t) {
            return (e === t && (0 !== e || 1 / e == 1 / t)) || (e != e && t != t);
          },
    i = r.useState,
    a = r.useEffect,
    s = r.useLayoutEffect,
    l = r.useDebugValue;
  function d(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !o(e, n);
    } catch (e) {
      return !0;
    }
  }
  var c =
    "undefined" == typeof window ||
    void 0 === window.document ||
    void 0 === window.document.createElement
      ? function (e, t) {
          return t();
        }
      : function (e, t) {
          var n = t(),
            r = i({ inst: { value: n, getSnapshot: t } }),
            o = r[0].inst,
            c = r[1];
          return (
            s(
              function () {
                ((o.value = n), (o.getSnapshot = t), d(o) && c({ inst: o }));
              },
              [e, n, t],
            ),
            a(
              function () {
                return (
                  d(o) && c({ inst: o }),
                  e(function () {
                    d(o) && c({ inst: o });
                  })
                );
              },
              [e],
            ),
            l(n),
            n
          );
        };
  t.useSyncExternalStore = void 0 !== r.useSyncExternalStore ? r.useSyncExternalStore : c;
};

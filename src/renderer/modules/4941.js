module.exports = (e, t, n) => {
  "use strict";
  var r = n(6689),
    o = n(4339),
    i =
      "function" == typeof Object.is
        ? Object.is
        : function (e, t) {
            return (e === t && (0 !== e || 1 / e == 1 / t)) || (e != e && t != t);
          },
    a = o.useSyncExternalStore,
    s = r.useRef,
    l = r.useEffect,
    d = r.useMemo,
    c = r.useDebugValue;
  t.useSyncExternalStoreWithSelector = function (e, t, n, r, o) {
    var A = s(null);
    if (null === A.current) {
      var u = { hasValue: !1, value: null };
      A.current = u;
    } else u = A.current;
    A = d(
      function () {
        function e(e) {
          if (!l) {
            if (((l = !0), (a = e), (e = r(e)), void 0 !== o && u.hasValue)) {
              var t = u.value;
              if (o(t, e)) return (s = t);
            }
            return (s = e);
          }
          if (((t = s), i(a, e))) return t;
          var n = r(e);
          return void 0 !== o && o(t, n) ? t : ((a = e), (s = n));
        }
        var a,
          s,
          l = !1,
          d = void 0 === n ? null : n;
        return [
          function () {
            return e(t());
          },
          null === d
            ? void 0
            : function () {
                return e(d());
              },
        ];
      },
      [t, n, r, o],
    );
    var p = a(e, A[0], A[1]);
    return (
      l(
        function () {
          ((u.hasValue = !0), (u.value = p));
        },
        [p],
      ),
      c(p),
      p
    );
  };
};

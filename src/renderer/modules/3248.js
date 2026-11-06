module.exports = (e, t) => {
  "use strict";
  function n(e, t) {
    var n = e.length;
    e.push(t);
    e: for (; 0 < n;) {
      var r = (n - 1) >>> 1,
        o = e[r];
      if (!(0 < i(o, t))) break e;
      ((e[r] = t), (e[n] = o), (n = r));
    }
  }
  function r(e) {
    return 0 === e.length ? null : e[0];
  }
  function o(e) {
    if (0 === e.length) return null;
    var t = e[0],
      n = e.pop();
    if (n !== t) {
      e[0] = n;
      e: for (var r = 0, o = e.length, a = o >>> 1; r < a;) {
        var s = 2 * (r + 1) - 1,
          l = e[s],
          d = s + 1,
          c = e[d];
        if (0 > i(l, n))
          d < o && 0 > i(c, l)
            ? ((e[r] = c), (e[d] = n), (r = d))
            : ((e[r] = l), (e[s] = n), (r = s));
        else {
          if (!(d < o && 0 > i(c, n))) break e;
          ((e[r] = c), (e[d] = n), (r = d));
        }
      }
    }
    return t;
  }
  function i(e, t) {
    var n = e.sortIndex - t.sortIndex;
    return 0 !== n ? n : e.id - t.id;
  }
  if ("object" == typeof performance && "function" == typeof performance.now) {
    var a = performance;
    t.unstable_now = function () {
      return a.now();
    };
  } else {
    var s = Date,
      l = s.now();
    t.unstable_now = function () {
      return s.now() - l;
    };
  }
  var d = [],
    c = [],
    A = 1,
    u = null,
    p = 3,
    f = !1,
    m = !1,
    b = !1,
    h = "function" == typeof setTimeout ? setTimeout : null,
    g = "function" == typeof clearTimeout ? clearTimeout : null,
    C = "undefined" != typeof setImmediate ? setImmediate : null;
  function v(e) {
    for (var t = r(c); null !== t;) {
      if (null === t.callback) o(c);
      else {
        if (!(t.startTime <= e)) break;
        (o(c), (t.sortIndex = t.expirationTime), n(d, t));
      }
      t = r(c);
    }
  }
  function y(e) {
    if (((b = !1), v(e), !m))
      if (null !== r(d)) ((m = !0), P(x));
      else {
        var t = r(c);
        null !== t && D(y, t.startTime - e);
      }
  }
  function x(e, n) {
    ((m = !1), b && ((b = !1), g($), ($ = -1)), (f = !0));
    var i = p;
    try {
      for (v(n), u = r(d); null !== u && (!(u.expirationTime > n) || (e && !S()));) {
        var a = u.callback;
        if ("function" == typeof a) {
          ((u.callback = null), (p = u.priorityLevel));
          var s = a(u.expirationTime <= n);
          ((n = t.unstable_now()),
            "function" == typeof s ? (u.callback = s) : u === r(d) && o(d),
            v(n));
        } else o(d);
        u = r(d);
      }
      if (null !== u) var l = !0;
      else {
        var A = r(c);
        (null !== A && D(y, A.startTime - n), (l = !1));
      }
      return l;
    } finally {
      ((u = null), (p = i), (f = !1));
    }
  }
  "undefined" != typeof navigator &&
    void 0 !== navigator.scheduling &&
    void 0 !== navigator.scheduling.isInputPending &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  var w,
    k = !1,
    B = null,
    $ = -1,
    E = 5,
    _ = -1;
  function S() {
    return !(t.unstable_now() - _ < E);
  }
  function O() {
    if (null !== B) {
      var e = t.unstable_now();
      _ = e;
      var n = !0;
      try {
        n = B(!0, e);
      } finally {
        n ? w() : ((k = !1), (B = null));
      }
    } else k = !1;
  }
  if ("function" == typeof C)
    w = function () {
      C(O);
    };
  else if ("undefined" != typeof MessageChannel) {
    var I = new MessageChannel(),
      R = I.port2;
    ((I.port1.onmessage = O),
      (w = function () {
        R.postMessage(null);
      }));
  } else
    w = function () {
      h(O, 0);
    };
  function P(e) {
    ((B = e), k || ((k = !0), w()));
  }
  function D(e, n) {
    $ = h(function () {
      e(t.unstable_now());
    }, n);
  }
  ((t.unstable_IdlePriority = 5),
    (t.unstable_ImmediatePriority = 1),
    (t.unstable_LowPriority = 4),
    (t.unstable_NormalPriority = 3),
    (t.unstable_Profiling = null),
    (t.unstable_UserBlockingPriority = 2),
    (t.unstable_cancelCallback = function (e) {
      e.callback = null;
    }),
    (t.unstable_continueExecution = function () {
      m || f || ((m = !0), P(x));
    }),
    (t.unstable_forceFrameRate = function (e) {
      0 > e || 125 < e
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (E = 0 < e ? Math.floor(1e3 / e) : 5);
    }),
    (t.unstable_getCurrentPriorityLevel = function () {
      return p;
    }),
    (t.unstable_getFirstCallbackNode = function () {
      return r(d);
    }),
    (t.unstable_next = function (e) {
      switch (p) {
        case 1:
        case 2:
        case 3:
          var t = 3;
          break;
        default:
          t = p;
      }
      var n = p;
      p = t;
      try {
        return e();
      } finally {
        p = n;
      }
    }),
    (t.unstable_pauseExecution = function () {}),
    (t.unstable_requestPaint = function () {}),
    (t.unstable_runWithPriority = function (e, t) {
      switch (e) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          e = 3;
      }
      var n = p;
      p = e;
      try {
        return t();
      } finally {
        p = n;
      }
    }),
    (t.unstable_scheduleCallback = function (e, o, i) {
      var a = t.unstable_now();
      switch (
        ((i =
          "object" == typeof i && null !== i && "number" == typeof (i = i.delay) && 0 < i
            ? a + i
            : a),
        e)
      ) {
        case 1:
          var s = -1;
          break;
        case 2:
          s = 250;
          break;
        case 5:
          s = 1073741823;
          break;
        case 4:
          s = 1e4;
          break;
        default:
          s = 5e3;
      }
      return (
        (e = {
          id: A++,
          callback: o,
          priorityLevel: e,
          startTime: i,
          expirationTime: (s = i + s),
          sortIndex: -1,
        }),
        i > a
          ? ((e.sortIndex = i),
            n(c, e),
            null === r(d) && e === r(c) && (b ? (g($), ($ = -1)) : (b = !0), D(y, i - a)))
          : ((e.sortIndex = s), n(d, e), m || f || ((m = !0), P(x))),
        e
      );
    }),
    (t.unstable_shouldYield = S),
    (t.unstable_wrapCallback = function (e) {
      var t = p;
      return function () {
        var n = p;
        p = t;
        try {
          return e.apply(this, arguments);
        } finally {
          p = n;
        }
      };
    }));
};

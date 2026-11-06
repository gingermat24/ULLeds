module.exports = (e) => {
  "use strict";
  var t,
    n = "object" == typeof Reflect ? Reflect : null,
    r =
      n && "function" == typeof n.apply
        ? n.apply
        : function (e, t, n) {
            return Function.prototype.apply.call(e, t, n);
          };
  t =
    n && "function" == typeof n.ownKeys
      ? n.ownKeys
      : Object.getOwnPropertySymbols
        ? function (e) {
            return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
          }
        : function (e) {
            return Object.getOwnPropertyNames(e);
          };
  var o =
    Number.isNaN ||
    function (e) {
      return e != e;
    };
  function i() {
    i.init.call(this);
  }
  ((e.exports = i),
    (e.exports.once = function (e, t) {
      return new Promise(function (n, r) {
        function o(n) {
          (e.removeListener(t, i), r(n));
        }
        function i() {
          ("function" == typeof e.removeListener && e.removeListener("error", o),
            n([].slice.call(arguments)));
        }
        (m(e, t, i, { once: !0 }),
          "error" !== t &&
            (function (e, t) {
              "function" == typeof e.on && m(e, "error", t, { once: !0 });
            })(e, o));
      });
    }),
    (i.EventEmitter = i),
    (i.prototype._events = void 0),
    (i.prototype._eventsCount = 0),
    (i.prototype._maxListeners = void 0));
  var a = 10;
  function s(e) {
    if ("function" != typeof e)
      throw new TypeError(
        'The "listener" argument must be of type Function. Received type ' + typeof e,
      );
  }
  function l(e) {
    return void 0 === e._maxListeners ? i.defaultMaxListeners : e._maxListeners;
  }
  function d(e, t, n, r) {
    var o, i, a, d;
    if (
      (s(n),
      void 0 === (i = e._events)
        ? ((i = e._events = Object.create(null)), (e._eventsCount = 0))
        : (void 0 !== i.newListener &&
            (e.emit("newListener", t, n.listener ? n.listener : n), (i = e._events)),
          (a = i[t])),
      void 0 === a)
    )
      ((a = i[t] = n), ++e._eventsCount);
    else if (
      ("function" == typeof a ? (a = i[t] = r ? [n, a] : [a, n]) : r ? a.unshift(n) : a.push(n),
      (o = l(e)) > 0 && a.length > o && !a.warned)
    ) {
      a.warned = !0;
      var c = new Error(
        "Possible EventEmitter memory leak detected. " +
          a.length +
          " " +
          String(t) +
          " listeners added. Use emitter.setMaxListeners() to increase limit",
      );
      ((c.name = "MaxListenersExceededWarning"),
        (c.emitter = e),
        (c.type = t),
        (c.count = a.length),
        (d = c),
        console && console.warn && console.warn(d));
    }
    return e;
  }
  function c() {
    if (!this.fired)
      return (
        this.target.removeListener(this.type, this.wrapFn),
        (this.fired = !0),
        0 === arguments.length
          ? this.listener.call(this.target)
          : this.listener.apply(this.target, arguments)
      );
  }
  function A(e, t, n) {
    var r = { fired: !1, wrapFn: void 0, target: e, type: t, listener: n },
      o = c.bind(r);
    return ((o.listener = n), (r.wrapFn = o), o);
  }
  function u(e, t, n) {
    var r = e._events;
    if (void 0 === r) return [];
    var o = r[t];
    return void 0 === o
      ? []
      : "function" == typeof o
        ? n
          ? [o.listener || o]
          : [o]
        : n
          ? (function (e) {
              for (var t = new Array(e.length), n = 0; n < t.length; ++n)
                t[n] = e[n].listener || e[n];
              return t;
            })(o)
          : f(o, o.length);
  }
  function p(e) {
    var t = this._events;
    if (void 0 !== t) {
      var n = t[e];
      if ("function" == typeof n) return 1;
      if (void 0 !== n) return n.length;
    }
    return 0;
  }
  function f(e, t) {
    for (var n = new Array(t), r = 0; r < t; ++r) n[r] = e[r];
    return n;
  }
  function m(e, t, n, r) {
    if ("function" == typeof e.on) r.once ? e.once(t, n) : e.on(t, n);
    else {
      if ("function" != typeof e.addEventListener)
        throw new TypeError(
          'The "emitter" argument must be of type EventEmitter. Received type ' + typeof e,
        );
      e.addEventListener(t, function o(i) {
        (r.once && e.removeEventListener(t, o), n(i));
      });
    }
  }
  (Object.defineProperty(i, "defaultMaxListeners", {
    enumerable: !0,
    get: function () {
      return a;
    },
    set: function (e) {
      if ("number" != typeof e || e < 0 || o(e))
        throw new RangeError(
          'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
            e +
            ".",
        );
      a = e;
    },
  }),
    (i.init = function () {
      ((void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events) ||
        ((this._events = Object.create(null)), (this._eventsCount = 0)),
        (this._maxListeners = this._maxListeners || void 0));
    }),
    (i.prototype.setMaxListeners = function (e) {
      if ("number" != typeof e || e < 0 || o(e))
        throw new RangeError(
          'The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".",
        );
      return ((this._maxListeners = e), this);
    }),
    (i.prototype.getMaxListeners = function () {
      return l(this);
    }),
    (i.prototype.emit = function (e) {
      for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
      var o = "error" === e,
        i = this._events;
      if (void 0 !== i) o = o && void 0 === i.error;
      else if (!o) return !1;
      if (o) {
        var a;
        if ((t.length > 0 && (a = t[0]), a instanceof Error)) throw a;
        var s = new Error("Unhandled error." + (a ? " (" + a.message + ")" : ""));
        throw ((s.context = a), s);
      }
      var l = i[e];
      if (void 0 === l) return !1;
      if ("function" == typeof l) r(l, this, t);
      else {
        var d = l.length,
          c = f(l, d);
        for (n = 0; n < d; ++n) r(c[n], this, t);
      }
      return !0;
    }),
    (i.prototype.addListener = function (e, t) {
      return d(this, e, t, !1);
    }),
    (i.prototype.on = i.prototype.addListener),
    (i.prototype.prependListener = function (e, t) {
      return d(this, e, t, !0);
    }),
    (i.prototype.once = function (e, t) {
      return (s(t), this.on(e, A(this, e, t)), this);
    }),
    (i.prototype.prependOnceListener = function (e, t) {
      return (s(t), this.prependListener(e, A(this, e, t)), this);
    }),
    (i.prototype.removeListener = function (e, t) {
      var n, r, o, i, a;
      if ((s(t), void 0 === (r = this._events))) return this;
      if (void 0 === (n = r[e])) return this;
      if (n === t || n.listener === t)
        0 == --this._eventsCount
          ? (this._events = Object.create(null))
          : (delete r[e], r.removeListener && this.emit("removeListener", e, n.listener || t));
      else if ("function" != typeof n) {
        for (o = -1, i = n.length - 1; i >= 0; i--)
          if (n[i] === t || n[i].listener === t) {
            ((a = n[i].listener), (o = i));
            break;
          }
        if (o < 0) return this;
        (0 === o
          ? n.shift()
          : (function (e, t) {
              for (; t + 1 < e.length; t++) e[t] = e[t + 1];
              e.pop();
            })(n, o),
          1 === n.length && (r[e] = n[0]),
          void 0 !== r.removeListener && this.emit("removeListener", e, a || t));
      }
      return this;
    }),
    (i.prototype.off = i.prototype.removeListener),
    (i.prototype.removeAllListeners = function (e) {
      var t, n, r;
      if (void 0 === (n = this._events)) return this;
      if (void 0 === n.removeListener)
        return (
          0 === arguments.length
            ? ((this._events = Object.create(null)), (this._eventsCount = 0))
            : void 0 !== n[e] &&
              (0 == --this._eventsCount ? (this._events = Object.create(null)) : delete n[e]),
          this
        );
      if (0 === arguments.length) {
        var o,
          i = Object.keys(n);
        for (r = 0; r < i.length; ++r)
          "removeListener" !== (o = i[r]) && this.removeAllListeners(o);
        return (
          this.removeAllListeners("removeListener"),
          (this._events = Object.create(null)),
          (this._eventsCount = 0),
          this
        );
      }
      if ("function" == typeof (t = n[e])) this.removeListener(e, t);
      else if (void 0 !== t) for (r = t.length - 1; r >= 0; r--) this.removeListener(e, t[r]);
      return this;
    }),
    (i.prototype.listeners = function (e) {
      return u(this, e, !0);
    }),
    (i.prototype.rawListeners = function (e) {
      return u(this, e, !1);
    }),
    (i.listenerCount = function (e, t) {
      return "function" == typeof e.listenerCount ? e.listenerCount(t) : p.call(e, t);
    }),
    (i.prototype.listenerCount = p),
    (i.prototype.eventNames = function () {
      return this._eventsCount > 0 ? t(this._events) : [];
    }));
};

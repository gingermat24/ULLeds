module.exports = (e, t, n) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.active = void 0));
  var r,
    o =
      Object.assign ||
      function (e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t];
          for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
        }
        return e;
      },
    i = (r = n(6689)) && r.__esModule ? r : { default: r };
  function a(e, t) {
    if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return !t || ("object" != typeof t && "function" != typeof t) ? e : t;
  }
  var s = (t.active = function (e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "span";
    return (function (n) {
      function r() {
        var n, s, l;
        !(function (e, t) {
          if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        })(this, r);
        for (var d = arguments.length, c = Array(d), A = 0; A < d; A++) c[A] = arguments[A];
        return (
          (s = l =
            a(this, (n = r.__proto__ || Object.getPrototypeOf(r)).call.apply(n, [this].concat(c)))),
          (l.state = { active: !1 }),
          (l.handleMouseDown = function () {
            return l.setState({ active: !0 });
          }),
          (l.handleMouseUp = function () {
            return l.setState({ active: !1 });
          }),
          (l.render = function () {
            return i.default.createElement(
              t,
              { onMouseDown: l.handleMouseDown, onMouseUp: l.handleMouseUp },
              i.default.createElement(e, o({}, l.props, l.state)),
            );
          }),
          a(l, s)
        );
      }
      return (
        (function (e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError(
              "Super expression must either be null or a function, not " + typeof t,
            );
          ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 },
          })),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : (e.__proto__ = t)));
        })(r, n),
        r
      );
    })(i.default.Component);
  });
  t.default = s;
};

module.exports = (e, t) => {
  "use strict";
  var n = Symbol.for("react.element"),
    r = Symbol.for("react.portal"),
    o = Symbol.for("react.fragment"),
    i = Symbol.for("react.strict_mode"),
    a = Symbol.for("react.profiler"),
    s = Symbol.for("react.provider"),
    l = Symbol.for("react.context"),
    d = Symbol.for("react.server_context"),
    c = Symbol.for("react.forward_ref"),
    A = Symbol.for("react.suspense"),
    u = Symbol.for("react.suspense_list"),
    p = Symbol.for("react.memo"),
    f = Symbol.for("react.lazy");
  Symbol.for("react.offscreen");
  (Symbol.for("react.module.reference"),
    (t.isContextConsumer = function (e) {
      return (
        (function (e) {
          if ("object" == typeof e && null !== e) {
            var t = e.$$typeof;
            switch (t) {
              case n:
                switch ((e = e.type)) {
                  case o:
                  case a:
                  case i:
                  case A:
                  case u:
                    return e;
                  default:
                    switch ((e = e && e.$$typeof)) {
                      case d:
                      case l:
                      case c:
                      case f:
                      case p:
                      case s:
                        return e;
                      default:
                        return t;
                    }
                }
              case r:
                return t;
            }
          }
        })(e) === l
      );
    }));
};

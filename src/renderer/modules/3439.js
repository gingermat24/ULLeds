module.exports = (e, t, n) => {
  "use strict";
  var r = n(552);
  function o() {}
  function i() {}
  ((i.resetWarningCache = o),
    (e.exports = function () {
      function e(e, t, n, o, i, a) {
        if (a !== r) {
          var s = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types",
          );
          throw ((s.name = "Invariant Violation"), s);
        }
      }
      function t() {
        return e;
      }
      e.isRequired = e;
      var n = {
        array: e,
        bigint: e,
        bool: e,
        func: e,
        number: e,
        object: e,
        string: e,
        symbol: e,
        any: e,
        arrayOf: t,
        element: e,
        elementType: e,
        instanceOf: t,
        node: e,
        objectOf: t,
        oneOf: t,
        oneOfType: t,
        shape: t,
        exact: t,
        checkPropTypes: i,
        resetWarningCache: o,
      };
      return ((n.PropTypes = n), n);
    }));
};

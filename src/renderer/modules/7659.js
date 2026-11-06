module.exports = (e) => {
  "use strict";
  var t = {};
  e.exports = function (e, n) {
    var r = (function (e) {
      if (void 0 === t[e]) {
        var n = document.querySelector(e);
        if (window.HTMLIFrameElement && n instanceof window.HTMLIFrameElement)
          try {
            n = n.contentDocument.head;
          } catch (e) {
            n = null;
          }
        t[e] = n;
      }
      return t[e];
    })(e);
    if (!r)
      throw new Error(
        "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.",
      );
    r.appendChild(n);
  };
};

module.exports = (e, t, n) => {
  "use strict";
  (n.r(t),
    n.d(t, {
      afterMain: () => x,
      afterRead: () => C,
      afterWrite: () => B,
      applyStyles: () => R,
      arrow: () => X,
      auto: () => s,
      basePlacements: () => l,
      beforeMain: () => v,
      beforeRead: () => h,
      beforeWrite: () => w,
      bottom: () => o,
      clippingParents: () => A,
      computeStyles: () => ne,
      createPopper: () => Ie,
      createPopperBase: () => Oe,
      createPopperLite: () => Re,
      detectOverflow: () => he,
      end: () => c,
      eventListeners: () => oe,
      flip: () => ge,
      hide: () => ye,
      left: () => a,
      main: () => y,
      modifierPhases: () => $,
      offset: () => xe,
      placements: () => b,
      popper: () => p,
      popperGenerator: () => Se,
      popperOffsets: () => we,
      preventOverflow: () => ke,
      read: () => g,
      reference: () => f,
      right: () => i,
      start: () => d,
      top: () => r,
      variationPlacements: () => m,
      viewport: () => u,
      write: () => k,
    }));
  var r = "top",
    o = "bottom",
    i = "right",
    a = "left",
    s = "auto",
    l = [r, o, i, a],
    d = "start",
    c = "end",
    A = "clippingParents",
    u = "viewport",
    p = "popper",
    f = "reference",
    m = l.reduce(function (e, t) {
      return e.concat([t + "-" + d, t + "-" + c]);
    }, []),
    b = [].concat(l, [s]).reduce(function (e, t) {
      return e.concat([t, t + "-" + d, t + "-" + c]);
    }, []),
    h = "beforeRead",
    g = "read",
    C = "afterRead",
    v = "beforeMain",
    y = "main",
    x = "afterMain",
    w = "beforeWrite",
    k = "write",
    B = "afterWrite",
    $ = [h, g, C, v, y, x, w, k, B];
  function E(e) {
    return e ? (e.nodeName || "").toLowerCase() : null;
  }
  function _(e) {
    if (null == e) return window;
    if ("[object Window]" !== e.toString()) {
      var t = e.ownerDocument;
      return (t && t.defaultView) || window;
    }
    return e;
  }
  function S(e) {
    return e instanceof _(e).Element || e instanceof Element;
  }
  function O(e) {
    return e instanceof _(e).HTMLElement || e instanceof HTMLElement;
  }
  function I(e) {
    return (
      "undefined" != typeof ShadowRoot && (e instanceof _(e).ShadowRoot || e instanceof ShadowRoot)
    );
  }
  const R = {
    name: "applyStyles",
    enabled: !0,
    phase: "write",
    fn: function (e) {
      var t = e.state;
      Object.keys(t.elements).forEach(function (e) {
        var n = t.styles[e] || {},
          r = t.attributes[e] || {},
          o = t.elements[e];
        O(o) &&
          E(o) &&
          (Object.assign(o.style, n),
          Object.keys(r).forEach(function (e) {
            var t = r[e];
            !1 === t ? o.removeAttribute(e) : o.setAttribute(e, !0 === t ? "" : t);
          }));
      });
    },
    effect: function (e) {
      var t = e.state,
        n = {
          popper: { position: t.options.strategy, left: "0", top: "0", margin: "0" },
          arrow: { position: "absolute" },
          reference: {},
        };
      return (
        Object.assign(t.elements.popper.style, n.popper),
        (t.styles = n),
        t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow),
        function () {
          Object.keys(t.elements).forEach(function (e) {
            var r = t.elements[e],
              o = t.attributes[e] || {},
              i = Object.keys(t.styles.hasOwnProperty(e) ? t.styles[e] : n[e]).reduce(function (
                e,
                t,
              ) {
                return ((e[t] = ""), e);
              }, {});
            O(r) &&
              E(r) &&
              (Object.assign(r.style, i),
              Object.keys(o).forEach(function (e) {
                r.removeAttribute(e);
              }));
          });
        }
      );
    },
    requires: ["computeStyles"],
  };
  function P(e) {
    return e.split("-")[0];
  }
  var D = Math.max,
    q = Math.min,
    z = Math.round;
  function M() {
    var e = navigator.userAgentData;
    return null != e && e.brands && Array.isArray(e.brands)
      ? e.brands
          .map(function (e) {
            return e.brand + "/" + e.version;
          })
          .join(" ")
      : navigator.userAgent;
  }
  function J() {
    return !/^((?!chrome|android).)*safari/i.test(M());
  }
  function F(e, t, n) {
    (void 0 === t && (t = !1), void 0 === n && (n = !1));
    var r = e.getBoundingClientRect(),
      o = 1,
      i = 1;
    t &&
      O(e) &&
      ((o = (e.offsetWidth > 0 && z(r.width) / e.offsetWidth) || 1),
      (i = (e.offsetHeight > 0 && z(r.height) / e.offsetHeight) || 1));
    var a = (S(e) ? _(e) : window).visualViewport,
      s = !J() && n,
      l = (r.left + (s && a ? a.offsetLeft : 0)) / o,
      d = (r.top + (s && a ? a.offsetTop : 0)) / i,
      c = r.width / o,
      A = r.height / i;
    return { width: c, height: A, top: d, right: l + c, bottom: d + A, left: l, x: l, y: d };
  }
  function N(e) {
    var t = F(e),
      n = e.offsetWidth,
      r = e.offsetHeight;
    return (
      Math.abs(t.width - n) <= 1 && (n = t.width),
      Math.abs(t.height - r) <= 1 && (r = t.height),
      { x: e.offsetLeft, y: e.offsetTop, width: n, height: r }
    );
  }
  function L(e, t) {
    var n = t.getRootNode && t.getRootNode();
    if (e.contains(t)) return !0;
    if (n && I(n)) {
      var r = t;
      do {
        if (r && e.isSameNode(r)) return !0;
        r = r.parentNode || r.host;
      } while (r);
    }
    return !1;
  }
  function T(e) {
    return _(e).getComputedStyle(e);
  }
  function j(e) {
    return ["table", "td", "th"].indexOf(E(e)) >= 0;
  }
  function U(e) {
    return ((S(e) ? e.ownerDocument : e.document) || window.document).documentElement;
  }
  function G(e) {
    return "html" === E(e) ? e : e.assignedSlot || e.parentNode || (I(e) ? e.host : null) || U(e);
  }
  function W(e) {
    return O(e) && "fixed" !== T(e).position ? e.offsetParent : null;
  }
  function K(e) {
    for (var t = _(e), n = W(e); n && j(n) && "static" === T(n).position;) n = W(n);
    return n && ("html" === E(n) || ("body" === E(n) && "static" === T(n).position))
      ? t
      : n ||
          (function (e) {
            var t = /firefox/i.test(M());
            if (/Trident/i.test(M()) && O(e) && "fixed" === T(e).position) return null;
            var n = G(e);
            for (I(n) && (n = n.host); O(n) && ["html", "body"].indexOf(E(n)) < 0;) {
              var r = T(n);
              if (
                "none" !== r.transform ||
                "none" !== r.perspective ||
                "paint" === r.contain ||
                -1 !== ["transform", "perspective"].indexOf(r.willChange) ||
                (t && "filter" === r.willChange) ||
                (t && r.filter && "none" !== r.filter)
              )
                return n;
              n = n.parentNode;
            }
            return null;
          })(e) ||
          t;
  }
  function H(e) {
    return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
  }
  function Q(e, t, n) {
    return D(e, q(t, n));
  }
  function Y(e) {
    return Object.assign({}, { top: 0, right: 0, bottom: 0, left: 0 }, e);
  }
  function V(e, t) {
    return t.reduce(function (t, n) {
      return ((t[n] = e), t);
    }, {});
  }
  const X = {
    name: "arrow",
    enabled: !0,
    phase: "main",
    fn: function (e) {
      var t,
        n = e.state,
        s = e.name,
        d = e.options,
        c = n.elements.arrow,
        A = n.modifiersData.popperOffsets,
        u = P(n.placement),
        p = H(u),
        f = [a, i].indexOf(u) >= 0 ? "height" : "width";
      if (c && A) {
        var m = (function (e, t) {
            return Y(
              "number" !=
                typeof (e =
                  "function" == typeof e
                    ? e(Object.assign({}, t.rects, { placement: t.placement }))
                    : e)
                ? e
                : V(e, l),
            );
          })(d.padding, n),
          b = N(c),
          h = "y" === p ? r : a,
          g = "y" === p ? o : i,
          C = n.rects.reference[f] + n.rects.reference[p] - A[p] - n.rects.popper[f],
          v = A[p] - n.rects.reference[p],
          y = K(c),
          x = y ? ("y" === p ? y.clientHeight || 0 : y.clientWidth || 0) : 0,
          w = C / 2 - v / 2,
          k = m[h],
          B = x - b[f] - m[g],
          $ = x / 2 - b[f] / 2 + w,
          E = Q(k, $, B),
          _ = p;
        n.modifiersData[s] = (((t = {})[_] = E), (t.centerOffset = E - $), t);
      }
    },
    effect: function (e) {
      var t = e.state,
        n = e.options.element,
        r = void 0 === n ? "[data-popper-arrow]" : n;
      null != r &&
        ("string" != typeof r || (r = t.elements.popper.querySelector(r))) &&
        L(t.elements.popper, r) &&
        (t.elements.arrow = r);
    },
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"],
  };
  function Z(e) {
    return e.split("-")[1];
  }
  var ee = { top: "auto", right: "auto", bottom: "auto", left: "auto" };
  function te(e) {
    var t,
      n = e.popper,
      s = e.popperRect,
      l = e.placement,
      d = e.variation,
      A = e.offsets,
      u = e.position,
      p = e.gpuAcceleration,
      f = e.adaptive,
      m = e.roundOffsets,
      b = e.isFixed,
      h = A.x,
      g = void 0 === h ? 0 : h,
      C = A.y,
      v = void 0 === C ? 0 : C,
      y = "function" == typeof m ? m({ x: g, y: v }) : { x: g, y: v };
    ((g = y.x), (v = y.y));
    var x = A.hasOwnProperty("x"),
      w = A.hasOwnProperty("y"),
      k = a,
      B = r,
      $ = window;
    if (f) {
      var E = K(n),
        S = "clientHeight",
        O = "clientWidth";
      (E === _(n) &&
        "static" !== T((E = U(n))).position &&
        "absolute" === u &&
        ((S = "scrollHeight"), (O = "scrollWidth")),
        (l === r || ((l === a || l === i) && d === c)) &&
          ((B = o),
          (v -= (b && E === $ && $.visualViewport ? $.visualViewport.height : E[S]) - s.height),
          (v *= p ? 1 : -1)),
        (l !== a && ((l !== r && l !== o) || d !== c)) ||
          ((k = i),
          (g -= (b && E === $ && $.visualViewport ? $.visualViewport.width : E[O]) - s.width),
          (g *= p ? 1 : -1)));
    }
    var I,
      R = Object.assign({ position: u }, f && ee),
      P =
        !0 === m
          ? (function (e, t) {
              var n = e.x,
                r = e.y,
                o = t.devicePixelRatio || 1;
              return { x: z(n * o) / o || 0, y: z(r * o) / o || 0 };
            })({ x: g, y: v }, _(n))
          : { x: g, y: v };
    return (
      (g = P.x),
      (v = P.y),
      p
        ? Object.assign(
            {},
            R,
            (((I = {})[B] = w ? "0" : ""),
            (I[k] = x ? "0" : ""),
            (I.transform =
              ($.devicePixelRatio || 1) <= 1
                ? "translate(" + g + "px, " + v + "px)"
                : "translate3d(" + g + "px, " + v + "px, 0)"),
            I),
          )
        : Object.assign(
            {},
            R,
            (((t = {})[B] = w ? v + "px" : ""), (t[k] = x ? g + "px" : ""), (t.transform = ""), t),
          )
    );
  }
  const ne = {
    name: "computeStyles",
    enabled: !0,
    phase: "beforeWrite",
    fn: function (e) {
      var t = e.state,
        n = e.options,
        r = n.gpuAcceleration,
        o = void 0 === r || r,
        i = n.adaptive,
        a = void 0 === i || i,
        s = n.roundOffsets,
        l = void 0 === s || s,
        d = {
          placement: P(t.placement),
          variation: Z(t.placement),
          popper: t.elements.popper,
          popperRect: t.rects.popper,
          gpuAcceleration: o,
          isFixed: "fixed" === t.options.strategy,
        };
      (null != t.modifiersData.popperOffsets &&
        (t.styles.popper = Object.assign(
          {},
          t.styles.popper,
          te(
            Object.assign({}, d, {
              offsets: t.modifiersData.popperOffsets,
              position: t.options.strategy,
              adaptive: a,
              roundOffsets: l,
            }),
          ),
        )),
        null != t.modifiersData.arrow &&
          (t.styles.arrow = Object.assign(
            {},
            t.styles.arrow,
            te(
              Object.assign({}, d, {
                offsets: t.modifiersData.arrow,
                position: "absolute",
                adaptive: !1,
                roundOffsets: l,
              }),
            ),
          )),
        (t.attributes.popper = Object.assign({}, t.attributes.popper, {
          "data-popper-placement": t.placement,
        })));
    },
    data: {},
  };
  var re = { passive: !0 };
  const oe = {
    name: "eventListeners",
    enabled: !0,
    phase: "write",
    fn: function () {},
    effect: function (e) {
      var t = e.state,
        n = e.instance,
        r = e.options,
        o = r.scroll,
        i = void 0 === o || o,
        a = r.resize,
        s = void 0 === a || a,
        l = _(t.elements.popper),
        d = [].concat(t.scrollParents.reference, t.scrollParents.popper);
      return (
        i &&
          d.forEach(function (e) {
            e.addEventListener("scroll", n.update, re);
          }),
        s && l.addEventListener("resize", n.update, re),
        function () {
          (i &&
            d.forEach(function (e) {
              e.removeEventListener("scroll", n.update, re);
            }),
            s && l.removeEventListener("resize", n.update, re));
        }
      );
    },
    data: {},
  };
  var ie = { left: "right", right: "left", bottom: "top", top: "bottom" };
  function ae(e) {
    return e.replace(/left|right|bottom|top/g, function (e) {
      return ie[e];
    });
  }
  var se = { start: "end", end: "start" };
  function le(e) {
    return e.replace(/start|end/g, function (e) {
      return se[e];
    });
  }
  function de(e) {
    var t = _(e);
    return { scrollLeft: t.pageXOffset, scrollTop: t.pageYOffset };
  }
  function ce(e) {
    return F(U(e)).left + de(e).scrollLeft;
  }
  function Ae(e) {
    var t = T(e),
      n = t.overflow,
      r = t.overflowX,
      o = t.overflowY;
    return /auto|scroll|overlay|hidden/.test(n + o + r);
  }
  function ue(e) {
    return ["html", "body", "#document"].indexOf(E(e)) >= 0
      ? e.ownerDocument.body
      : O(e) && Ae(e)
        ? e
        : ue(G(e));
  }
  function pe(e, t) {
    var n;
    void 0 === t && (t = []);
    var r = ue(e),
      o = r === (null == (n = e.ownerDocument) ? void 0 : n.body),
      i = _(r),
      a = o ? [i].concat(i.visualViewport || [], Ae(r) ? r : []) : r,
      s = t.concat(a);
    return o ? s : s.concat(pe(G(a)));
  }
  function fe(e) {
    return Object.assign({}, e, {
      left: e.x,
      top: e.y,
      right: e.x + e.width,
      bottom: e.y + e.height,
    });
  }
  function me(e, t, n) {
    return t === u
      ? fe(
          (function (e, t) {
            var n = _(e),
              r = U(e),
              o = n.visualViewport,
              i = r.clientWidth,
              a = r.clientHeight,
              s = 0,
              l = 0;
            if (o) {
              ((i = o.width), (a = o.height));
              var d = J();
              (d || (!d && "fixed" === t)) && ((s = o.offsetLeft), (l = o.offsetTop));
            }
            return { width: i, height: a, x: s + ce(e), y: l };
          })(e, n),
        )
      : S(t)
        ? (function (e, t) {
            var n = F(e, !1, "fixed" === t);
            return (
              (n.top = n.top + e.clientTop),
              (n.left = n.left + e.clientLeft),
              (n.bottom = n.top + e.clientHeight),
              (n.right = n.left + e.clientWidth),
              (n.width = e.clientWidth),
              (n.height = e.clientHeight),
              (n.x = n.left),
              (n.y = n.top),
              n
            );
          })(t, n)
        : fe(
            (function (e) {
              var t,
                n = U(e),
                r = de(e),
                o = null == (t = e.ownerDocument) ? void 0 : t.body,
                i = D(n.scrollWidth, n.clientWidth, o ? o.scrollWidth : 0, o ? o.clientWidth : 0),
                a = D(
                  n.scrollHeight,
                  n.clientHeight,
                  o ? o.scrollHeight : 0,
                  o ? o.clientHeight : 0,
                ),
                s = -r.scrollLeft + ce(e),
                l = -r.scrollTop;
              return (
                "rtl" === T(o || n).direction && (s += D(n.clientWidth, o ? o.clientWidth : 0) - i),
                { width: i, height: a, x: s, y: l }
              );
            })(U(e)),
          );
  }
  function be(e) {
    var t,
      n = e.reference,
      s = e.element,
      l = e.placement,
      A = l ? P(l) : null,
      u = l ? Z(l) : null,
      p = n.x + n.width / 2 - s.width / 2,
      f = n.y + n.height / 2 - s.height / 2;
    switch (A) {
      case r:
        t = { x: p, y: n.y - s.height };
        break;
      case o:
        t = { x: p, y: n.y + n.height };
        break;
      case i:
        t = { x: n.x + n.width, y: f };
        break;
      case a:
        t = { x: n.x - s.width, y: f };
        break;
      default:
        t = { x: n.x, y: n.y };
    }
    var m = A ? H(A) : null;
    if (null != m) {
      var b = "y" === m ? "height" : "width";
      switch (u) {
        case d:
          t[m] = t[m] - (n[b] / 2 - s[b] / 2);
          break;
        case c:
          t[m] = t[m] + (n[b] / 2 - s[b] / 2);
      }
    }
    return t;
  }
  function he(e, t) {
    void 0 === t && (t = {});
    var n = t,
      a = n.placement,
      s = void 0 === a ? e.placement : a,
      d = n.strategy,
      c = void 0 === d ? e.strategy : d,
      m = n.boundary,
      b = void 0 === m ? A : m,
      h = n.rootBoundary,
      g = void 0 === h ? u : h,
      C = n.elementContext,
      v = void 0 === C ? p : C,
      y = n.altBoundary,
      x = void 0 !== y && y,
      w = n.padding,
      k = void 0 === w ? 0 : w,
      B = Y("number" != typeof k ? k : V(k, l)),
      $ = v === p ? f : p,
      _ = e.rects.popper,
      I = e.elements[x ? $ : v],
      R = (function (e, t, n, r) {
        var o =
            "clippingParents" === t
              ? (function (e) {
                  var t = pe(G(e)),
                    n = ["absolute", "fixed"].indexOf(T(e).position) >= 0 && O(e) ? K(e) : e;
                  return S(n)
                    ? t.filter(function (e) {
                        return S(e) && L(e, n) && "body" !== E(e);
                      })
                    : [];
                })(e)
              : [].concat(t),
          i = [].concat(o, [n]),
          a = i[0],
          s = i.reduce(
            function (t, n) {
              var o = me(e, n, r);
              return (
                (t.top = D(o.top, t.top)),
                (t.right = q(o.right, t.right)),
                (t.bottom = q(o.bottom, t.bottom)),
                (t.left = D(o.left, t.left)),
                t
              );
            },
            me(e, a, r),
          );
        return (
          (s.width = s.right - s.left),
          (s.height = s.bottom - s.top),
          (s.x = s.left),
          (s.y = s.top),
          s
        );
      })(S(I) ? I : I.contextElement || U(e.elements.popper), b, g, c),
      P = F(e.elements.reference),
      z = be({ reference: P, element: _, strategy: "absolute", placement: s }),
      M = fe(Object.assign({}, _, z)),
      J = v === p ? M : P,
      N = {
        top: R.top - J.top + B.top,
        bottom: J.bottom - R.bottom + B.bottom,
        left: R.left - J.left + B.left,
        right: J.right - R.right + B.right,
      },
      j = e.modifiersData.offset;
    if (v === p && j) {
      var W = j[s];
      Object.keys(N).forEach(function (e) {
        var t = [i, o].indexOf(e) >= 0 ? 1 : -1,
          n = [r, o].indexOf(e) >= 0 ? "y" : "x";
        N[e] += W[n] * t;
      });
    }
    return N;
  }
  const ge = {
    name: "flip",
    enabled: !0,
    phase: "main",
    fn: function (e) {
      var t = e.state,
        n = e.options,
        c = e.name;
      if (!t.modifiersData[c]._skip) {
        for (
          var A = n.mainAxis,
            u = void 0 === A || A,
            p = n.altAxis,
            f = void 0 === p || p,
            h = n.fallbackPlacements,
            g = n.padding,
            C = n.boundary,
            v = n.rootBoundary,
            y = n.altBoundary,
            x = n.flipVariations,
            w = void 0 === x || x,
            k = n.allowedAutoPlacements,
            B = t.options.placement,
            $ = P(B),
            E =
              h ||
              ($ !== B && w
                ? (function (e) {
                    if (P(e) === s) return [];
                    var t = ae(e);
                    return [le(e), t, le(t)];
                  })(B)
                : [ae(B)]),
            _ = [B].concat(E).reduce(function (e, n) {
              return e.concat(
                P(n) === s
                  ? (function (e, t) {
                      void 0 === t && (t = {});
                      var n = t,
                        r = n.placement,
                        o = n.boundary,
                        i = n.rootBoundary,
                        a = n.padding,
                        s = n.flipVariations,
                        d = n.allowedAutoPlacements,
                        c = void 0 === d ? b : d,
                        A = Z(r),
                        u = A
                          ? s
                            ? m
                            : m.filter(function (e) {
                                return Z(e) === A;
                              })
                          : l,
                        p = u.filter(function (e) {
                          return c.indexOf(e) >= 0;
                        });
                      0 === p.length && (p = u);
                      var f = p.reduce(function (t, n) {
                        return (
                          (t[n] = he(e, { placement: n, boundary: o, rootBoundary: i, padding: a })[
                            P(n)
                          ]),
                          t
                        );
                      }, {});
                      return Object.keys(f).sort(function (e, t) {
                        return f[e] - f[t];
                      });
                    })(t, {
                      placement: n,
                      boundary: C,
                      rootBoundary: v,
                      padding: g,
                      flipVariations: w,
                      allowedAutoPlacements: k,
                    })
                  : n,
              );
            }, []),
            S = t.rects.reference,
            O = t.rects.popper,
            I = new Map(),
            R = !0,
            D = _[0],
            q = 0;
          q < _.length;
          q++
        ) {
          var z = _[q],
            M = P(z),
            J = Z(z) === d,
            F = [r, o].indexOf(M) >= 0,
            N = F ? "width" : "height",
            L = he(t, { placement: z, boundary: C, rootBoundary: v, altBoundary: y, padding: g }),
            T = F ? (J ? i : a) : J ? o : r;
          S[N] > O[N] && (T = ae(T));
          var j = ae(T),
            U = [];
          if (
            (u && U.push(L[M] <= 0),
            f && U.push(L[T] <= 0, L[j] <= 0),
            U.every(function (e) {
              return e;
            }))
          ) {
            ((D = z), (R = !1));
            break;
          }
          I.set(z, U);
        }
        if (R)
          for (
            var G = function (e) {
                var t = _.find(function (t) {
                  var n = I.get(t);
                  if (n)
                    return n.slice(0, e).every(function (e) {
                      return e;
                    });
                });
                if (t) return ((D = t), "break");
              },
              W = w ? 3 : 1;
            W > 0 && "break" !== G(W);
            W--
          );
        t.placement !== D && ((t.modifiersData[c]._skip = !0), (t.placement = D), (t.reset = !0));
      }
    },
    requiresIfExists: ["offset"],
    data: { _skip: !1 },
  };
  function Ce(e, t, n) {
    return (
      void 0 === n && (n = { x: 0, y: 0 }),
      {
        top: e.top - t.height - n.y,
        right: e.right - t.width + n.x,
        bottom: e.bottom - t.height + n.y,
        left: e.left - t.width - n.x,
      }
    );
  }
  function ve(e) {
    return [r, i, o, a].some(function (t) {
      return e[t] >= 0;
    });
  }
  const ye = {
      name: "hide",
      enabled: !0,
      phase: "main",
      requiresIfExists: ["preventOverflow"],
      fn: function (e) {
        var t = e.state,
          n = e.name,
          r = t.rects.reference,
          o = t.rects.popper,
          i = t.modifiersData.preventOverflow,
          a = he(t, { elementContext: "reference" }),
          s = he(t, { altBoundary: !0 }),
          l = Ce(a, r),
          d = Ce(s, o, i),
          c = ve(l),
          A = ve(d);
        ((t.modifiersData[n] = {
          referenceClippingOffsets: l,
          popperEscapeOffsets: d,
          isReferenceHidden: c,
          hasPopperEscaped: A,
        }),
          (t.attributes.popper = Object.assign({}, t.attributes.popper, {
            "data-popper-reference-hidden": c,
            "data-popper-escaped": A,
          })));
      },
    },
    xe = {
      name: "offset",
      enabled: !0,
      phase: "main",
      requires: ["popperOffsets"],
      fn: function (e) {
        var t = e.state,
          n = e.options,
          o = e.name,
          s = n.offset,
          l = void 0 === s ? [0, 0] : s,
          d = b.reduce(function (e, n) {
            return (
              (e[n] = (function (e, t, n) {
                var o = P(e),
                  s = [a, r].indexOf(o) >= 0 ? -1 : 1,
                  l = "function" == typeof n ? n(Object.assign({}, t, { placement: e })) : n,
                  d = l[0],
                  c = l[1];
                return (
                  (d = d || 0),
                  (c = (c || 0) * s),
                  [a, i].indexOf(o) >= 0 ? { x: c, y: d } : { x: d, y: c }
                );
              })(n, t.rects, l)),
              e
            );
          }, {}),
          c = d[t.placement],
          A = c.x,
          u = c.y;
        (null != t.modifiersData.popperOffsets &&
          ((t.modifiersData.popperOffsets.x += A), (t.modifiersData.popperOffsets.y += u)),
          (t.modifiersData[o] = d));
      },
    },
    we = {
      name: "popperOffsets",
      enabled: !0,
      phase: "read",
      fn: function (e) {
        var t = e.state,
          n = e.name;
        t.modifiersData[n] = be({
          reference: t.rects.reference,
          element: t.rects.popper,
          strategy: "absolute",
          placement: t.placement,
        });
      },
      data: {},
    },
    ke = {
      name: "preventOverflow",
      enabled: !0,
      phase: "main",
      fn: function (e) {
        var t = e.state,
          n = e.options,
          s = e.name,
          l = n.mainAxis,
          c = void 0 === l || l,
          A = n.altAxis,
          u = void 0 !== A && A,
          p = n.boundary,
          f = n.rootBoundary,
          m = n.altBoundary,
          b = n.padding,
          h = n.tether,
          g = void 0 === h || h,
          C = n.tetherOffset,
          v = void 0 === C ? 0 : C,
          y = he(t, { boundary: p, rootBoundary: f, padding: b, altBoundary: m }),
          x = P(t.placement),
          w = Z(t.placement),
          k = !w,
          B = H(x),
          $ = "x" === B ? "y" : "x",
          E = t.modifiersData.popperOffsets,
          _ = t.rects.reference,
          S = t.rects.popper,
          O =
            "function" == typeof v ? v(Object.assign({}, t.rects, { placement: t.placement })) : v,
          I =
            "number" == typeof O
              ? { mainAxis: O, altAxis: O }
              : Object.assign({ mainAxis: 0, altAxis: 0 }, O),
          R = t.modifiersData.offset ? t.modifiersData.offset[t.placement] : null,
          z = { x: 0, y: 0 };
        if (E) {
          if (c) {
            var M,
              J = "y" === B ? r : a,
              F = "y" === B ? o : i,
              L = "y" === B ? "height" : "width",
              T = E[B],
              j = T + y[J],
              U = T - y[F],
              G = g ? -S[L] / 2 : 0,
              W = w === d ? _[L] : S[L],
              Y = w === d ? -S[L] : -_[L],
              V = t.elements.arrow,
              X = g && V ? N(V) : { width: 0, height: 0 },
              ee = t.modifiersData["arrow#persistent"]
                ? t.modifiersData["arrow#persistent"].padding
                : { top: 0, right: 0, bottom: 0, left: 0 },
              te = ee[J],
              ne = ee[F],
              re = Q(0, _[L], X[L]),
              oe = k ? _[L] / 2 - G - re - te - I.mainAxis : W - re - te - I.mainAxis,
              ie = k ? -_[L] / 2 + G + re + ne + I.mainAxis : Y + re + ne + I.mainAxis,
              ae = t.elements.arrow && K(t.elements.arrow),
              se = ae ? ("y" === B ? ae.clientTop || 0 : ae.clientLeft || 0) : 0,
              le = null != (M = null == R ? void 0 : R[B]) ? M : 0,
              de = T + ie - le,
              ce = Q(g ? q(j, T + oe - le - se) : j, T, g ? D(U, de) : U);
            ((E[B] = ce), (z[B] = ce - T));
          }
          if (u) {
            var Ae,
              ue = "x" === B ? r : a,
              pe = "x" === B ? o : i,
              fe = E[$],
              me = "y" === $ ? "height" : "width",
              be = fe + y[ue],
              ge = fe - y[pe],
              Ce = -1 !== [r, a].indexOf(x),
              ve = null != (Ae = null == R ? void 0 : R[$]) ? Ae : 0,
              ye = Ce ? be : fe - _[me] - S[me] - ve + I.altAxis,
              xe = Ce ? fe + _[me] + S[me] - ve - I.altAxis : ge,
              we =
                g && Ce
                  ? (function (e, t, n) {
                      var r = Q(e, t, n);
                      return r > n ? n : r;
                    })(ye, fe, xe)
                  : Q(g ? ye : be, fe, g ? xe : ge);
            ((E[$] = we), (z[$] = we - fe));
          }
          t.modifiersData[s] = z;
        }
      },
      requiresIfExists: ["offset"],
    };
  function Be(e, t, n) {
    void 0 === n && (n = !1);
    var r,
      o,
      i = O(t),
      a =
        O(t) &&
        (function (e) {
          var t = e.getBoundingClientRect(),
            n = z(t.width) / e.offsetWidth || 1,
            r = z(t.height) / e.offsetHeight || 1;
          return 1 !== n || 1 !== r;
        })(t),
      s = U(t),
      l = F(e, a, n),
      d = { scrollLeft: 0, scrollTop: 0 },
      c = { x: 0, y: 0 };
    return (
      (i || (!i && !n)) &&
        (("body" !== E(t) || Ae(s)) &&
          (d =
            (r = t) !== _(r) && O(r)
              ? { scrollLeft: (o = r).scrollLeft, scrollTop: o.scrollTop }
              : de(r)),
        O(t) ? (((c = F(t, !0)).x += t.clientLeft), (c.y += t.clientTop)) : s && (c.x = ce(s))),
      {
        x: l.left + d.scrollLeft - c.x,
        y: l.top + d.scrollTop - c.y,
        width: l.width,
        height: l.height,
      }
    );
  }
  function $e(e) {
    var t = new Map(),
      n = new Set(),
      r = [];
    function o(e) {
      (n.add(e.name),
        [].concat(e.requires || [], e.requiresIfExists || []).forEach(function (e) {
          if (!n.has(e)) {
            var r = t.get(e);
            r && o(r);
          }
        }),
        r.push(e));
    }
    return (
      e.forEach(function (e) {
        t.set(e.name, e);
      }),
      e.forEach(function (e) {
        n.has(e.name) || o(e);
      }),
      r
    );
  }
  var Ee = { placement: "bottom", modifiers: [], strategy: "absolute" };
  function _e() {
    for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
    return !t.some(function (e) {
      return !(e && "function" == typeof e.getBoundingClientRect);
    });
  }
  function Se(e) {
    void 0 === e && (e = {});
    var t = e,
      n = t.defaultModifiers,
      r = void 0 === n ? [] : n,
      o = t.defaultOptions,
      i = void 0 === o ? Ee : o;
    return function (e, t, n) {
      void 0 === n && (n = i);
      var o,
        a,
        s = {
          placement: "bottom",
          orderedModifiers: [],
          options: Object.assign({}, Ee, i),
          modifiersData: {},
          elements: { reference: e, popper: t },
          attributes: {},
          styles: {},
        },
        l = [],
        d = !1,
        c = {
          state: s,
          setOptions: function (n) {
            var o = "function" == typeof n ? n(s.options) : n;
            (A(),
              (s.options = Object.assign({}, i, s.options, o)),
              (s.scrollParents = {
                reference: S(e) ? pe(e) : e.contextElement ? pe(e.contextElement) : [],
                popper: pe(t),
              }));
            var a,
              d,
              u = (function (e) {
                var t = $e(e);
                return $.reduce(function (e, n) {
                  return e.concat(
                    t.filter(function (e) {
                      return e.phase === n;
                    }),
                  );
                }, []);
              })(
                ((a = [].concat(r, s.options.modifiers)),
                (d = a.reduce(function (e, t) {
                  var n = e[t.name];
                  return (
                    (e[t.name] = n
                      ? Object.assign({}, n, t, {
                          options: Object.assign({}, n.options, t.options),
                          data: Object.assign({}, n.data, t.data),
                        })
                      : t),
                    e
                  );
                }, {})),
                Object.keys(d).map(function (e) {
                  return d[e];
                })),
              );
            return (
              (s.orderedModifiers = u.filter(function (e) {
                return e.enabled;
              })),
              s.orderedModifiers.forEach(function (e) {
                var t = e.name,
                  n = e.options,
                  r = void 0 === n ? {} : n,
                  o = e.effect;
                if ("function" == typeof o) {
                  var i = o({ state: s, name: t, instance: c, options: r });
                  l.push(i || function () {});
                }
              }),
              c.update()
            );
          },
          forceUpdate: function () {
            if (!d) {
              var e = s.elements,
                t = e.reference,
                n = e.popper;
              if (_e(t, n)) {
                ((s.rects = {
                  reference: Be(t, K(n), "fixed" === s.options.strategy),
                  popper: N(n),
                }),
                  (s.reset = !1),
                  (s.placement = s.options.placement),
                  s.orderedModifiers.forEach(function (e) {
                    return (s.modifiersData[e.name] = Object.assign({}, e.data));
                  }));
                for (var r = 0; r < s.orderedModifiers.length; r++)
                  if (!0 !== s.reset) {
                    var o = s.orderedModifiers[r],
                      i = o.fn,
                      a = o.options,
                      l = void 0 === a ? {} : a,
                      A = o.name;
                    "function" == typeof i &&
                      (s = i({ state: s, options: l, name: A, instance: c }) || s);
                  } else ((s.reset = !1), (r = -1));
              }
            }
          },
          update:
            ((o = function () {
              return new Promise(function (e) {
                (c.forceUpdate(), e(s));
              });
            }),
            function () {
              return (
                a ||
                  (a = new Promise(function (e) {
                    Promise.resolve().then(function () {
                      ((a = void 0), e(o()));
                    });
                  })),
                a
              );
            }),
          destroy: function () {
            (A(), (d = !0));
          },
        };
      if (!_e(e, t)) return c;
      function A() {
        (l.forEach(function (e) {
          return e();
        }),
          (l = []));
      }
      return (
        c.setOptions(n).then(function (e) {
          !d && n.onFirstUpdate && n.onFirstUpdate(e);
        }),
        c
      );
    };
  }
  var Oe = Se(),
    Ie = Se({ defaultModifiers: [oe, we, ne, R, xe, ge, ke, X, ye] }),
    Re = Se({ defaultModifiers: [oe, we, ne, R] });
};

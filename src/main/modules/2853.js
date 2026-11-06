module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.XElement = void 0),
    (t.parseXml = function (e) {
      let t = null;
      const r = n.parser(!0, {}),
        i = [];
      return (
        (r.onopentag = (e) => {
          const r = new o(e.name);
          if (((r.attributes = e.attributes), null === t)) t = r;
          else {
            const e = i[i.length - 1];
            (null == e.elements && (e.elements = []), e.elements.push(r));
          }
          i.push(r);
        }),
        (r.onclosetag = () => {
          i.pop();
        }),
        (r.ontext = (e) => {
          i.length > 0 && (i[i.length - 1].value = e);
        }),
        (r.oncdata = (e) => {
          const t = i[i.length - 1];
          ((t.value = e), (t.isCData = !0));
        }),
        (r.onerror = (e) => {
          throw e;
        }),
        r.write(e),
        t
      );
    }));
  const n = r(19574),
    i = r(68046);
  class o {
    constructor(e) {
      if (
        ((this.name = e),
        (this.value = ""),
        (this.attributes = null),
        (this.isCData = !1),
        (this.elements = null),
        !e)
      )
        throw (0, i.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (
        !(function (e) {
          return s.test(e);
        })(e)
      )
        throw (0, i.newError)(`Invalid element name: ${e}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(e) {
      const t = null === this.attributes ? null : this.attributes[e];
      if (null == t) throw (0, i.newError)(`No attribute "${e}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return t;
    }
    removeAttribute(e) {
      null !== this.attributes && delete this.attributes[e];
    }
    element(e, t = !1, r = null) {
      const n = this.elementOrNull(e, t);
      if (null === n) throw (0, i.newError)(r || `No element "${e}"`, "ERR_XML_MISSED_ELEMENT");
      return n;
    }
    elementOrNull(e, t = !1) {
      if (null === this.elements) return null;
      for (const r of this.elements) if (a(r, e, t)) return r;
      return null;
    }
    getElements(e, t = !1) {
      return null === this.elements ? [] : this.elements.filter((r) => a(r, e, t));
    }
    elementValueOrEmpty(e, t = !1) {
      const r = this.elementOrNull(e, t);
      return null === r ? "" : r.value;
    }
  }
  t.XElement = o;
  const s = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function a(e, t, r) {
    const n = e.name;
    return n === t || (!0 === r && n.length === t.length && n.toLowerCase() === t.toLowerCase());
  }
};

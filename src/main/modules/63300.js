module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.executeTasksUsingMultipleRangeRequests = function (e, t, r, a, c) {
      const l = (u) => {
        if (u >= t.length)
          return (null != e.fileMetadataBuffer && r.write(e.fileMetadataBuffer), void r.end());
        const p = u + 1e3;
        !(function (e, t, r, a, c) {
          let l = "bytes=",
            u = 0;
          const p = new Map(),
            d = [];
          for (let e = t.start; e < t.end; e++) {
            const r = t.tasks[e];
            r.kind === o.OperationKind.DOWNLOAD &&
              ((l += `${r.start}-${r.end - 1}, `), p.set(u, e), u++, d.push(r.end - r.start));
          }
          if (u <= 1) {
            const n = (l) => {
              if (l >= t.end) return void a();
              const u = t.tasks[l++];
              if (u.kind === o.OperationKind.COPY)
                (0, i.copyData)(u, r, t.oldFileFd, c, () => n(l));
              else {
                const t = e.createRequestOptions();
                t.headers.Range = `bytes=${u.start}-${u.end - 1}`;
                const i = e.httpExecutor.createRequest(t, (e) => {
                  s(e, c) && (e.pipe(r, { end: !1 }), e.once("end", () => n(l)));
                });
                (e.httpExecutor.addErrorAndTimeoutHandlers(i, c), i.end());
              }
            };
            return void n(t.start);
          }
          const f = e.createRequestOptions();
          f.headers.Range = l.substring(0, l.length - 2);
          const h = e.httpExecutor.createRequest(f, (e) => {
            if (!s(e, c)) return;
            const o = (0, n.safeGetHeader)(e, "content-type"),
              l = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(o);
            if (null == l)
              return void c(
                new Error(`Content-Type "multipart/byteranges" is expected, but got "${o}"`),
              );
            const u = new i.DataSplitter(r, t, p, l[1] || l[2], d, a);
            (u.on("error", c),
              e.pipe(u),
              e.on("end", () => {
                setTimeout(() => {
                  (h.abort(), c(new Error("Response ends without calling any handlers")));
                }, 1e4);
              }));
          });
          (e.httpExecutor.addErrorAndTimeoutHandlers(h, c), h.end());
        })(e, { tasks: t, start: u, end: Math.min(t.length, p), oldFileFd: a }, r, () => l(p), c);
      };
      return l;
    }),
    (t.checkIsRangesSupported = s));
  const n = r(23108),
    i = r(28591),
    o = r(42472);
  function s(e, t) {
    if (e.statusCode >= 400) return (t((0, n.createHttpError)(e)), !1);
    if (206 !== e.statusCode) {
      const r = (0, n.safeGetHeader)(e, "accept-ranges");
      if (null == r || "none" === r)
        return (
          t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)),
          !1
        );
    }
    return !0;
  }
};

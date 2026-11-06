module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }), (t.DifferentialDownloader = void 0));
  const n = r(23108),
    i = r(45768),
    o = r(79896),
    s = r(28591),
    a = r(87016),
    c = r(42472),
    l = r(63300),
    u = r(26341);
  function p(e, t = " KB") {
    return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
  }
  t.DifferentialDownloader = class {
    constructor(e, t, r) {
      ((this.blockAwareFileInfo = e),
        (this.httpExecutor = t),
        (this.options = r),
        (this.fileMetadataBuffer = null),
        (this.logger = r.logger));
    }
    createRequestOptions() {
      const e = { headers: { ...this.options.requestHeaders, accept: "*/*" } };
      return (
        (0, n.configureRequestUrl)(this.options.newUrl, e),
        (0, n.configureRequestOptions)(e),
        e
      );
    }
    doDownload(e, t) {
      if (e.version !== t.version)
        throw new Error(
          `version is different (${e.version} - ${t.version}), full download is required`,
        );
      const r = this.logger,
        n = (0, c.computeOperations)(e, t, r);
      null != r.debug && r.debug(JSON.stringify(n, null, 2));
      let i = 0,
        o = 0;
      for (const e of n) {
        const t = e.end - e.start;
        e.kind === c.OperationKind.DOWNLOAD ? (i += t) : (o += t);
      }
      const s = this.blockAwareFileInfo.size;
      if (i + o + (null == this.fileMetadataBuffer ? 0 : this.fileMetadataBuffer.length) !== s)
        throw new Error(
          `Internal error, size mismatch: downloadSize: ${i}, copySize: ${o}, newSize: ${s}`,
        );
      return (
        r.info(`Full: ${p(s)}, To download: ${p(i)} (${Math.round(i / (s / 100))}%)`),
        this.downloadFile(n)
      );
    }
    downloadFile(e) {
      const t = [],
        r = () =>
          Promise.all(
            t.map((e) =>
              (0, i.close)(e.descriptor).catch((t) => {
                this.logger.error(`cannot close file "${e.path}": ${t}`);
              }),
            ),
          );
      return this.doDownloadFile(e, t)
        .then(r)
        .catch((e) =>
          r()
            .catch((t) => {
              try {
                this.logger.error(`cannot close files: ${t}`);
              } catch (e) {
                try {
                  console.error(e);
                } catch (e) {}
              }
              throw e;
            })
            .then(() => {
              throw e;
            }),
        );
    }
    async doDownloadFile(e, t) {
      const r = await (0, i.open)(this.options.oldFile, "r");
      t.push({ descriptor: r, path: this.options.oldFile });
      const p = await (0, i.open)(this.options.newFile, "w");
      t.push({ descriptor: p, path: this.options.newFile });
      const d = (0, o.createWriteStream)(this.options.newFile, { fd: p });
      await new Promise((i, o) => {
        const p = [];
        let f;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const t = [];
          let r = 0;
          for (const n of e)
            n.kind === c.OperationKind.DOWNLOAD &&
              (t.push(n.end - n.start), (r += n.end - n.start));
          const n = { expectedByteCounts: t, grandTotal: r };
          ((f = new u.ProgressDifferentialDownloadCallbackTransform(
            n,
            this.options.cancellationToken,
            this.options.onProgress,
          )),
            p.push(f));
        }
        const h = new n.DigestTransform(this.blockAwareFileInfo.sha512);
        ((h.isValidateOnEnd = !1),
          p.push(h),
          d.on("finish", () => {
            d.close(() => {
              t.splice(1, 1);
              try {
                h.validate();
              } catch (e) {
                return void o(e);
              }
              i(void 0);
            });
          }),
          p.push(d));
        let m = null;
        for (const e of p) (e.on("error", o), (m = null == m ? e : m.pipe(e)));
        const g = p[0];
        let v;
        if (this.options.isUseMultipleRangeRequest)
          return ((v = (0, l.executeTasksUsingMultipleRangeRequests)(this, e, g, r, o)), void v(0));
        let y = 0,
          w = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const b = this.createRequestOptions();
        ((b.redirect = "manual"),
          (v = (t) => {
            var i, l;
            if (t >= e.length)
              return (
                null != this.fileMetadataBuffer && g.write(this.fileMetadataBuffer),
                void g.end()
              );
            const u = e[t++];
            if (u.kind === c.OperationKind.COPY)
              return (f && f.beginFileCopy(), void (0, s.copyData)(u, g, r, o, () => v(t)));
            const p = `bytes=${u.start}-${u.end - 1}`;
            ((b.headers.range = p),
              null === (l = null === (i = this.logger) || void 0 === i ? void 0 : i.debug) ||
                void 0 === l ||
                l.call(i, `download range: ${p}`),
              f && f.beginRangeDownload());
            const d = this.httpExecutor.createRequest(b, (e) => {
              (e.on("error", o),
                e.on("aborted", () => {
                  o(new Error("response has been aborted by the server"));
                }),
                e.statusCode >= 400 && o((0, n.createHttpError)(e)),
                e.pipe(g, { end: !1 }),
                e.once("end", () => {
                  (f && f.endRangeDownload(),
                    100 == ++y ? ((y = 0), setTimeout(() => v(t), 1e3)) : v(t));
                }));
            });
            (d.on("redirect", (e, t, r) => {
              (this.logger.info(
                `Redirect to ${(function (e) {
                  const t = e.indexOf("?");
                  return t < 0 ? e : e.substring(0, t);
                })(r)}`,
              ),
                (w = r),
                (0, n.configureRequestUrl)(new a.URL(w), b),
                d.followRedirect());
            }),
              this.httpExecutor.addErrorAndTimeoutHandlers(d, o),
              d.end());
          }),
          v(0));
      });
    }
    async readRemoteBytes(e, t) {
      const r = Buffer.allocUnsafe(t + 1 - e),
        n = this.createRequestOptions();
      n.headers.range = `bytes=${e}-${t}`;
      let i = 0;
      if (
        (await this.request(n, (e) => {
          (e.copy(r, i), (i += e.length));
        }),
        i !== r.length)
      )
        throw new Error(`Received data length ${i} is not equal to expected ${r.length}`);
      return r;
    }
    request(e, t) {
      return new Promise((r, n) => {
        const i = this.httpExecutor.createRequest(e, (e) => {
          (0, l.checkIsRangesSupported)(e, n) &&
            (e.on("error", n),
            e.on("aborted", () => {
              n(new Error("response has been aborted by the server"));
            }),
            e.on("data", t),
            e.on("end", () => r()));
        });
        (this.httpExecutor.addErrorAndTimeoutHandlers(i, n), i.end());
      });
    }
  };
};

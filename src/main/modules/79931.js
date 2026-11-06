module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.verifySignature = function (e, t, r) {
      return new Promise((o, c) => {
        const l = t.replace(/'/g, "''");
        (r.info(`Verifying signature ${l}`),
          (0, i.execFile)(
            'set "PSModulePath=" & chcp 65001 >NUL & powershell.exe',
            [
              "-NoProfile",
              "-NonInteractive",
              "-InputFormat",
              "None",
              "-Command",
              `"Get-AuthenticodeSignature -LiteralPath '${l}' | ConvertTo-Json -Compress"`,
            ],
            { shell: !0, timeout: 2e4 },
            (i, l, u) => {
              var p;
              try {
                if (null != i || u) return (a(r, i, u, c), void o(null));
                const d = (function (e) {
                  const t = JSON.parse(e);
                  (delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType);
                  const r = t.SignerCertificate;
                  return (
                    null != r &&
                      (delete r.Archived,
                      delete r.Extensions,
                      delete r.Handle,
                      delete r.HasPrivateKey,
                      delete r.SubjectName),
                    t
                  );
                })(l);
                if (0 === d.Status) {
                  try {
                    const e = s.normalize(d.Path),
                      n = s.normalize(t);
                    if ((r.info(`LiteralPath: ${e}. Update Path: ${n}`), e !== n))
                      return (
                        a(r, new Error(`LiteralPath of ${e} is different than ${n}`), u, c),
                        void o(null)
                      );
                  } catch (i) {
                    r.warn(
                      `Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${null !== (p = i.message) && void 0 !== p ? p : i.stack}`,
                    );
                  }
                  const l = (0, n.parseDn)(d.SignerCertificate.Subject);
                  let f = !1;
                  for (const t of e) {
                    const e = (0, n.parseDn)(t);
                    if (
                      (e.size
                        ? (f = Array.from(e.keys()).every((t) => e.get(t) === l.get(t)))
                        : t === l.get("CN") &&
                          (r.warn(
                            `Signature validated using only CN ${t}. Please add your full Distinguished Name (DN) to publisherNames configuration`,
                          ),
                          (f = !0)),
                      f)
                    )
                      return void o(null);
                  }
                }
                const f =
                  `publisherNames: ${e.join(" | ")}, raw info: ` +
                  JSON.stringify(d, (e, t) => ("RawData" === e ? void 0 : t), 2);
                (r.warn(
                  `Sign verification failed, installer signed with incorrect certificate: ${f}`,
                ),
                  o(f));
              } catch (e) {
                return (a(r, e, null, c), void o(null));
              }
            },
          ));
      });
    }));
  const n = r(23108),
    i = r(35317),
    o = r(70857),
    s = r(16928);
  function a(e, t, r, n) {
    if (
      (function () {
        const e = o.release();
        return e.startsWith("6.") && !e.startsWith("6.3");
      })()
    )
      e.warn(
        `Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`,
      );
    else {
      try {
        (0, i.execFileSync)(
          "powershell.exe",
          ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"],
          { timeout: 1e4 },
        );
      } catch (t) {
        return void e.warn(
          `Cannot execute ConvertTo-Json: ${t.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`,
        );
      }
      (null != t && n(t),
        r &&
          n(
            new Error(
              `Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`,
            ),
          ));
    }
  }
};

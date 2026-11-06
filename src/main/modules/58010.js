module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.writeFileSync = t.writeFile = t.readFileSync = t.readFile = void 0));
  const n = r(16928),
    i = r(22420),
    o = r(74621),
    s = r(73322),
    a = r(71585),
    c = r(79304);
  ((t.readFile = function e(t, r = i.DEFAULT_READ_OPTIONS) {
    var n;
    if (s.default.isString(r)) return e(t, { encoding: r });
    const a = Date.now() + (null !== (n = r.timeout) && void 0 !== n ? n : i.DEFAULT_TIMEOUT_ASYNC);
    return o.default.readFileRetry(a)(t, r);
  }),
    (t.readFileSync = function e(t, r = i.DEFAULT_READ_OPTIONS) {
      var n;
      if (s.default.isString(r)) return e(t, { encoding: r });
      const a =
        Date.now() + (null !== (n = r.timeout) && void 0 !== n ? n : i.DEFAULT_TIMEOUT_SYNC);
      return o.default.readFileSyncRetry(a)(t, r);
    }));
  const l = (e, t, r, n) => {
    if (s.default.isFunction(r)) return l(e, t, i.DEFAULT_WRITE_OPTIONS, r);
    const o = u(e, t, r);
    return (n && o.then(n, n), o);
  };
  t.writeFile = l;
  const u = async (e, t, r = i.DEFAULT_WRITE_OPTIONS) => {
      var l;
      if (s.default.isString(r)) return u(e, t, { encoding: r });
      const p =
        Date.now() + (null !== (l = r.timeout) && void 0 !== l ? l : i.DEFAULT_TIMEOUT_ASYNC);
      let d = null,
        f = null,
        h = null,
        m = null,
        g = null;
      try {
        (r.schedule && (d = await r.schedule(e)),
          (f = await a.default.schedule(e)),
          (e = (await o.default.realpathAttempt(e)) || e),
          ([m, h] = c.default.get(e, r.tmpCreate || c.default.create, !(!1 === r.tmpPurge))));
        const l = i.IS_POSIX && s.default.isUndefined(r.chown),
          u = s.default.isUndefined(r.mode);
        if (l || u) {
          const t = await o.default.statAttempt(e);
          t &&
            ((r = { ...r }), l && (r.chown = { uid: t.uid, gid: t.gid }), u && (r.mode = t.mode));
        }
        const v = n.dirname(e);
        (await o.default.mkdirAttempt(v, { mode: i.DEFAULT_FOLDER_MODE, recursive: !0 }),
          (g = await o.default.openRetry(p)(m, "w", r.mode || i.DEFAULT_FILE_MODE)),
          r.tmpCreated && r.tmpCreated(m),
          s.default.isString(t)
            ? await o.default.writeRetry(p)(g, t, 0, r.encoding || i.DEFAULT_ENCODING)
            : s.default.isUndefined(t) || (await o.default.writeRetry(p)(g, t, 0, t.length, 0)),
          !1 !== r.fsync &&
            (!1 !== r.fsyncWait ? await o.default.fsyncRetry(p)(g) : o.default.fsyncAttempt(g)),
          await o.default.closeRetry(p)(g),
          (g = null),
          r.chown && (await o.default.chownAttempt(m, r.chown.uid, r.chown.gid)),
          r.mode && (await o.default.chmodAttempt(m, r.mode)));
        try {
          await o.default.renameRetry(p)(m, e);
        } catch (t) {
          if ("ENAMETOOLONG" !== t.code) throw t;
          await o.default.renameRetry(p)(m, c.default.truncate(e));
        }
        (h(), (m = null));
      } finally {
        (g && (await o.default.closeAttempt(g)), m && c.default.purge(m), d && d(), f && f());
      }
    },
    p = (e, t, r = i.DEFAULT_WRITE_OPTIONS) => {
      var a;
      if (s.default.isString(r)) return p(e, t, { encoding: r });
      const l =
        Date.now() + (null !== (a = r.timeout) && void 0 !== a ? a : i.DEFAULT_TIMEOUT_SYNC);
      let u = null,
        d = null,
        f = null;
      try {
        ((e = o.default.realpathSyncAttempt(e) || e),
          ([d, u] = c.default.get(e, r.tmpCreate || c.default.create, !(!1 === r.tmpPurge))));
        const a = i.IS_POSIX && s.default.isUndefined(r.chown),
          p = s.default.isUndefined(r.mode);
        if (a || p) {
          const t = o.default.statSyncAttempt(e);
          t &&
            ((r = { ...r }), a && (r.chown = { uid: t.uid, gid: t.gid }), p && (r.mode = t.mode));
        }
        const h = n.dirname(e);
        (o.default.mkdirSyncAttempt(h, { mode: i.DEFAULT_FOLDER_MODE, recursive: !0 }),
          (f = o.default.openSyncRetry(l)(d, "w", r.mode || i.DEFAULT_FILE_MODE)),
          r.tmpCreated && r.tmpCreated(d),
          s.default.isString(t)
            ? o.default.writeSyncRetry(l)(f, t, 0, r.encoding || i.DEFAULT_ENCODING)
            : s.default.isUndefined(t) || o.default.writeSyncRetry(l)(f, t, 0, t.length, 0),
          !1 !== r.fsync &&
            (!1 !== r.fsyncWait ? o.default.fsyncSyncRetry(l)(f) : o.default.fsyncAttempt(f)),
          o.default.closeSyncRetry(l)(f),
          (f = null),
          r.chown && o.default.chownSyncAttempt(d, r.chown.uid, r.chown.gid),
          r.mode && o.default.chmodSyncAttempt(d, r.mode));
        try {
          o.default.renameSyncRetry(l)(d, e);
        } catch (t) {
          if ("ENAMETOOLONG" !== t.code) throw t;
          o.default.renameSyncRetry(l)(d, c.default.truncate(e));
        }
        (u(), (d = null));
      } finally {
        (f && o.default.closeSyncAttempt(f), d && c.default.purge(d));
      }
    };
  t.writeFileSync = p;
};

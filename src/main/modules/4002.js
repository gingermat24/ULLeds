module.exports = (e, t, r) => {
  "use strict";
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = {
    interval: 25,
    intervalId: void 0,
    limit: r(22420).LIMIT_FILES_DESCRIPTORS,
    queueActive: new Set(),
    queueWaiting: new Set(),
    init: () => {
      n.intervalId || (n.intervalId = setInterval(n.tick, n.interval));
    },
    reset: () => {
      n.intervalId && (clearInterval(n.intervalId), delete n.intervalId);
    },
    add: (e) => {
      (n.queueWaiting.add(e), n.queueActive.size < n.limit / 2 ? n.tick() : n.init());
    },
    remove: (e) => {
      (n.queueWaiting.delete(e), n.queueActive.delete(e));
    },
    schedule: () =>
      new Promise((e) => {
        const t = () => n.remove(r),
          r = () => e(t);
        n.add(r);
      }),
    tick: () => {
      if (!(n.queueActive.size >= n.limit)) {
        if (!n.queueWaiting.size) return n.reset();
        for (const e of n.queueWaiting) {
          if (n.queueActive.size >= n.limit) break;
          (n.queueWaiting.delete(e), n.queueActive.add(e), e());
        }
      }
    },
  };
  t.default = n;
};

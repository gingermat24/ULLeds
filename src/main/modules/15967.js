module.exports = (e, t, r) => {
  const { ipcMain: n } = r(84157),
    i = r(87138),
    o = r(79329),
    s = r(79896),
    a = r(71328);
  e.exports = {
    initialize: () => {
      const e = i.transports.file.getFile();
      n.handle("getFeedback", async (t, r, n, i, c) => {
        const l = new a();
        l.append("file", s.createReadStream(e.path));
        try {
          const { data: e } = await o.post("https://feedback.robobloq.cn/upload", l, {
              headers: { ...l.getHeaders() },
            }),
            { data: t } = await o({
              method: "POST",
              url: "https://feedback.robobloq.cn/synclights",
              data: { machineId: r, orderId: n, phone: i, issue: c, logUrl: e },
            });
          return t;
        } catch (e) {
          return (console.error(e), null);
        }
      });
    },
  };
};

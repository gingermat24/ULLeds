module.exports = (e, t, r) => {
  const { ipcMain: n } = r(84157),
    i = r(3950);
  e.exports = () => {
    (process.on("uncaughtException", (e) => {
      i.error("主进程未捕获异常:", e);
    }),
      process.on("unhandledRejection", (e) => {
        i.error("主进程未处理的拒绝:", e);
      }),
      n.on("renderer-error", (e, t) => {
        i.error("来自渲染进程的错误:", t);
      }),
      n.on("unhandled-rejection", (e, t) => {
        i.error("来自渲染进程的未处理拒绝:", t);
      }));
  };
};

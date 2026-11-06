module.exports = (e, t, r) => {
  const { autoUpdater: n } = r(60630),
    { app: i, ipcMain: o } = r(84157);
  e.exports = {
    initialize: (e) => {
      const t = (t) => {
        e.webContents.send("checkUpdateReply", t);
      };
      (n.on("checking-for-update", () => {
        t({ key: "checkingForUpdate" });
      }),
        n.on("update-available", (e) => {
          t({ key: "updateAvailable", info: e });
        }),
        n.on("update-not-available", (e) => {
          t({ key: "updateNotAvailable", info: e });
        }),
        n.on("error", (e) => {
          t({ key: "error", info: e });
        }),
        o.on("checkUpdate", async () => {
          if (i.isPackaged)
            try {
              await n.checkForUpdates();
            } catch (e) {
              console.log(e);
            }
        }));
    },
  };
};

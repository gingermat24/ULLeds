module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928),
    { app: i, ipcMain: o, ipcRenderer: s, shell: a } = r(84157),
    c = r(77383);
  let l = !1;
  const u = () => {
    if (!o || !i)
      throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
    const e = { defaultCwd: i.getPath("userData"), appVersion: i.getVersion() };
    return (
      l ||
        (o.on("electron-store-get-data", (t) => {
          t.returnValue = e;
        }),
        (l = !0)),
      e
    );
  };
  e.exports = class extends c {
    constructor(e) {
      let t, r;
      if (s) {
        const e = s.sendSync("electron-store-get-data");
        if (!e)
          throw new Error(
            "Electron Store: You need to call `.initRenderer()` from the main process.",
          );
        ({ defaultCwd: t, appVersion: r } = e);
      } else o && i && ({ defaultCwd: t, appVersion: r } = u());
      ((e = { name: "config", ...e }).projectVersion || (e.projectVersion = r),
        e.cwd ? (e.cwd = n.isAbsolute(e.cwd) ? e.cwd : n.join(t, e.cwd)) : (e.cwd = t),
        (e.configName = e.name),
        delete e.name,
        super(e));
    }
    static initRenderer() {
      u();
    }
    async openInEditor() {
      const e = await a.openPath(this.path);
      if (e) throw new Error(e);
    }
  };
};

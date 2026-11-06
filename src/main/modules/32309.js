module.exports = (e, t, r) => {
  const { ipcMain: n } = r(84157),
    i = r(79896),
    o = r(76760),
    s = r(35317).spawnSync;
  e.exports = {
    initialize: () => {
      n.on("enableTransparency", (e, ...t) => {
        const [r] = t,
          n = `\nDim shell\nSet shell = CreateObject("WScript.Shell")\n\n' 设置注册表项为 0 以关闭透明度\nshell.RegWrite "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\\EnableTransparency", ${r ? 1 : 0}, "REG_DWORD"\n\n' 清理\nSet shell = Nothing\n    `,
          a = o.join(process.env.TEMP || process.env.TMP, "setTransparency.vbs");
        (console.log("tempDir:", a),
          i.writeFile(a, n, (e) => {
            if (e) console.error("写入文件时出错:", e);
            else {
              const e = s("cscript.exe", [a], { shell: !0 });
              (console.log(`stderr: ${e.stderr.toString()}`),
                console.log(`stdout: ${e.stdout.toString()}`),
                console.log(`status: ${e.status}`));
            }
          }));
      });
    },
  };
};

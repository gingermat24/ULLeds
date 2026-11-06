module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.FileWithEmbeddedBlockMapDifferentialDownloader = void 0));
  const n = r(45768),
    i = r(6514),
    o = r(43106);
  class s extends i.DifferentialDownloader {
    async download() {
      const e = this.blockAwareFileInfo,
        t = e.size,
        r = t - (e.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(r, t - 1);
      const i = a(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(
        await (async function (e) {
          const t = await (0, n.open)(e, "r");
          try {
            const e = (await (0, n.fstat)(t)).size,
              r = Buffer.allocUnsafe(4);
            await (0, n.read)(t, r, 0, r.length, e - r.length);
            const i = Buffer.allocUnsafe(r.readUInt32BE(0));
            return (
              await (0, n.read)(t, i, 0, i.length, e - r.length - i.length),
              await (0, n.close)(t),
              a(i)
            );
          } catch (e) {
            throw (await (0, n.close)(t), e);
          }
        })(this.options.oldFile),
        i,
      );
    }
  }
  function a(e) {
    return JSON.parse((0, o.inflateRawSync)(e).toString());
  }
  t.FileWithEmbeddedBlockMapDifferentialDownloader = s;
};

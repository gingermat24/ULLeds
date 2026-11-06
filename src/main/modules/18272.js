module.exports = (e, t, r) => {
  const n = r(76982);
  class i {
    static PID_LENGTH = 6;
    static MAC_LENGTH = 50;
    static SALT_LENGTH = 12;
    static HMAC_LENGTH = 32;
    static AUTHCODE_LENGTH = i.SALT_LENGTH + i.HMAC_LENGTH;
    static TOTAL_LENGTH = i.PID_LENGTH + i.AUTHCODE_LENGTH;
    static K = [
      26, 63, 124, 146, 213, 230, 169, 11, 77, 136, 242, 51, 199, 113, 158, 5, 43, 100, 168, 223, 2,
      94, 145, 236, 118, 57, 172, 208, 69, 123, 179, 24,
    ];
    static decimalToBytes(e) {
      return Buffer.from(e);
    }
    static verify(e, t) {
      try {
        const r = t.slice(0, this.PID_LENGTH),
          i = t.slice(this.PID_LENGTH, this.PID_LENGTH + this.SALT_LENGTH),
          o = t.slice(this.PID_LENGTH + this.SALT_LENGTH),
          s = r.concat(e, i),
          a = n.createHmac("sha256", this.decimalToBytes(this.K));
        a.update(this.decimalToBytes(s));
        const c = a.digest();
        return n.timingSafeEqual(c, this.decimalToBytes(o));
      } catch (e) {
        return (console.error(`验证错误: ${e.message}`), !1);
      }
    }
  }
  e.exports = i;
};

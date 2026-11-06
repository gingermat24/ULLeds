module.exports = (e) => {
  e.exports = new (class {
    constructor() {
      this.id = 1;
    }
    setID() {
      return ((this.id = this.id + 1), this.id >= 255 && (this.id = 1), this.id);
    }
    getID() {
      return this.id;
    }
  })();
};

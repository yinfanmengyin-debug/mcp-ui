const M = (l, c) => {
  const d = c.prototype;
  d.xun = function(n) {
    if (n === void 0) {
      const o = this.date();
      return o > 30 ? 3 : Math.ceil(o / 10);
    }
    if (typeof n != "number" || n < 1 || n > 3)
      throw new Error("The hou must be a number from 1 to 3!");
    return this.date((n - 1) * 10 + 1);
  };
  const i = d.add;
  d.add = function(n, o) {
    if (n = Number(n), ["xun", "xuns"].includes(o)) {
      let t = this;
      if (n > 0)
        for (let s = 0; s < n; s++) {
          const e = t.date();
          if (e > 20) {
            const r = t.daysInMonth() - 20, h = e - 20, y = Math.floor(h / r * 10) || 1;
            t = t.add(1, "month").date(y);
          } else {
            let a = 10;
            const r = t.daysInMonth() - 20;
            e > 11 && a > r && (a = r), t = t.add(a, "days");
          }
        }
      else
        for (let s = 0; s > n; s--) {
          const e = t.date();
          if (e < 11) {
            const a = t.subtract(1, "month").daysInMonth() - 20, r = e + Math.floor((1 - e / 10) * a);
            t = t.subtract(r, "days");
          } else {
            const a = e <= 21 ? 10 : t.daysInMonth() - 20;
            t = t.subtract(a, "days");
          }
        }
      return t;
    }
    return i.bind(this)(n, o);
  };
  const u = d.startOf;
  d.startOf = function(n, o) {
    const t = o !== void 0 ? o : !0;
    if (["xun", "xuns"].includes(n)) {
      const s = this.xun(), e = (s - 1) * 10 + 1, a = s === 3 ? this.daysInMonth() : s * 10;
      return t ? this.date(e).startOf("day") : this.date(a).endOf("day");
    }
    return u.bind(this)(n, o);
  };
  const f = d.format;
  d.format = function(n) {
    const o = this.xun(), t = { 1: "上", 2: "中", 3: "下" }[o];
    return f.bind(this)(n).replace(/T/g, t);
  };
};
export {
  M as default
};

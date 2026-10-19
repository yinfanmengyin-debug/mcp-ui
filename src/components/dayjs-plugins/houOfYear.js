const p = (y, i) => {
  const a = i.prototype;
  a.hou = function(t) {
    if (t === void 0) {
      const n = this.date();
      return n > 30 ? 6 : Math.ceil(n / 5);
    }
    if (typeof t != "number" || t < 1 || t > 6)
      throw new Error("The hou must be a number from 1 to 6!");
    return this.date((t - 1) * 5 + 1);
  };
  const h = a.add;
  a.add = function(t, n) {
    if (t = Number(t), t === 0) return this;
    if (["hou", "hous"].includes(n)) {
      let o = this;
      if (t > 0)
        for (let e = 0; e < t; e++) {
          const s = o.date();
          if (s > 25) {
            const r = o.daysInMonth() - 25, u = s - 25, l = Math.floor(u / r * 5) || 1;
            o = o.add(1, "month").date(l);
          } else
            o = o.add(5, "days");
        }
      else
        for (let e = 0; e > t; e--) {
          const s = o.date();
          if (s < 6) {
            const d = o.subtract(1, "month").daysInMonth() - 25, r = s + Math.floor((1 - s / 5) * d);
            o = o.subtract(r, "days");
          } else
            o = o.subtract(5, "days");
        }
      return o;
    }
    return h.bind(this)(t, n);
  };
  const c = a.startOf;
  a.startOf = function(t, n) {
    const o = n !== void 0 ? n : !0;
    if (["hou", "hous"].includes(t)) {
      const e = this.hou(), s = (e - 1) * 5 + 1, d = e === 6 ? this.daysInMonth() : e * 5;
      return o ? this.date(s).startOf("day") : this.date(d).endOf("day");
    }
    return c.bind(this)(t, n);
  };
  const f = a.format;
  a.format = function(t) {
    const n = this.hou();
    return f.bind(this)(t).replace(/(F{1,2})/g, (e, s) => `${s.length > 1 ? `${n}`.padStart(2, "0") : n}`);
  };
};
export {
  p as default
};

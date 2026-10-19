const m = (u, d) => {
  function a(n) {
    return n === 1 ? [2, 4] : n === 2 ? [5, 7] : n === 3 ? [8, 10] : [11, 1];
  }
  const s = d.prototype;
  s.season = function(n) {
    const t = this.month();
    if (n === void 0) {
      if (t >= 2 && t <= 4) return 1;
      if (t >= 5 && t <= 7) return 2;
      if (t >= 8 && t <= 10) return 3;
      if (t >= 11 || t <= 1) return 4;
    }
    const o = a(n);
    return this.month(o[0]);
  };
  const f = s.add;
  s.add = function(n, t) {
    return n = Number(n), ["ji", "season", "seasons"].includes(t) ? this.add(n * 3, "months") : f.bind(this)(n, t);
  };
  const c = s.startOf;
  s.startOf = function(n, t) {
    const o = t !== void 0 ? t : !0;
    if (["ji", "season", "seasons"].includes(n)) {
      const e = this.month(), i = this.season(), r = a(i);
      return o ? (
        // 当前日期为冬季时 且 当前月份(1,2月)小于季节范围的开始月份(12月)时 那么当前季节的开始年应该为上一年
        this.add(i === 4 && e < r[0] ? -1 : 0, "year").month(r[0]).startOf("month").startOf("day")
      ) : (
        // 当前日期为冬季时 且 当前月份(12月)大于季节范围的结束月份(2月)时 那么当前季节的结束年应该为下一年
        this.add(i === 4 && e > r[1] ? 1 : 0, "year").month(r[1]).endOf("month").endOf("day")
      );
    }
    return c.bind(this)(n, t);
  };
  const h = s.format;
  s.format = function(n) {
    const t = this.season(), o = { 1: "春", 2: "夏", 3: "秋", 4: "冬" }[t];
    return h.bind(this)(n).replace(/(J)/g, o);
  };
};
export {
  m as default
};

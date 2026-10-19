/**
 * 中国气候中的季节计算
 * - 03-05月: 春季
 * - 06-08月: 夏季
 * - 09-11月: 秋季
 * - 12-02月: 冬季
 * @type PluginFunc
 */
export default (option, dayjsClass) => {
  /**
   * 获取季节的范围
   * @param {1|2|3|4} season
   * @return {[number, number]}
   */
  function seasonRange(season) {
    if (season === 1) return [2, 4]
    if (season === 2) return [5, 7]
    if (season === 3) return [8, 10]
    return [11, 1]
  }

  const proto = dayjsClass.prototype
  proto.season = function (season) {
    const month = this.month()
    // 没有参数则表示获取季节
    if (season === undefined) {
      if (month >= 2 && month <= 4) return 1
      if (month >= 5 && month <= 7) return 2
      if (month >= 8 && month <= 10) return 3
      if (month >= 11 || month <= 1) return 4
    }
    // 有参数则表示设置季节
    const range = seasonRange(season)
    return this.month(range[0])
  }

  const oldAdd = proto.add
  proto.add = function (number, units) {
    number = Number(number)
    if (['ji', 'season', 'seasons'].includes(units)) {
      return this.add(number * 3, 'months')
    }
    return oldAdd.bind(this)(number, units)
  }

  const oldStartOf = proto.startOf
  proto.startOf = function (units, startOf) {
    const isStartOf = startOf !== undefined ? startOf : true
    if (['ji', 'season', 'seasons'].includes(units)) {
      const month = this.month()
      const season = this.season()
      const range = seasonRange(season)
      return isStartOf
        ? // 当前日期为冬季时 且 当前月份(1,2月)小于季节范围的开始月份(12月)时 那么当前季节的开始年应该为上一年
          this.add(season === 4 && month < range[0] ? -1 : 0, 'year')
            .month(range[0])
            .startOf('month')
            .startOf('day')
        : // 当前日期为冬季时 且 当前月份(12月)大于季节范围的结束月份(2月)时 那么当前季节的结束年应该为下一年
          this.add(season === 4 && month > range[1] ? 1 : 0, 'year')
            .month(range[1])
            .endOf('month')
            .endOf('day')
    }
    return oldStartOf.bind(this)(units, startOf)
  }

  const oldFormat = proto.format
  proto.format = function (formatStr) {
    const season = this.season()
    const seasonStr = { 1: '春', 2: '夏', 3: '秋', 4: '冬' }[season]
    let res = oldFormat.bind(this)(formatStr)
    return res.replace(/(J)/g, seasonStr)
  }
}

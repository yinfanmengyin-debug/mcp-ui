/**
 * @type PluginFunc
 */
export default (option, dayjsClass) => {
  const proto = dayjsClass.prototype
  proto.xun = function (xun) {
    if (xun === undefined) {
      const date = this.date()
      return date > 30 ? 3 : Math.ceil(date / 10)
    }
    if (typeof xun !== 'number' || xun < 1 || xun > 3) {
      throw new Error('The hou must be a number from 1 to 3!')
    }
    return this.date((xun - 1) * 10 + 1)
  }

  const oldAdd = proto.add
  proto.add = function (number, units) {
    number = Number(number)
    if (['xun', 'xuns'].includes(units)) {
      let newDate = this
      if (number > 0) {
        // 逐旬递加
        for (let i = 0; i < number; i++) {
          const date = newDate.date()
          if (date > 20) {
            const daysInMonth = newDate.daysInMonth()
            // 当前旬的天数
            const currentXunDay = daysInMonth - 20
            // 当前日期是当前旬的第几天
            const day = date - 20
            // 当前旬已过天数在当前旬的占比, 对应10天所表示的日数, 即为下个月的日期
            const nextDate = Math.floor((day / currentXunDay) * 10) || 1
            newDate = newDate.add(1, 'month').date(nextDate)
          } else {
            let addDay = 10
            const endXunDays = newDate.daysInMonth() - 20
            if (date > 11 && addDay > endXunDays) {
              addDay = endXunDays
            }
            newDate = newDate.add(addDay, 'days')
          }
        }
      } else {
        // 逐旬递减
        for (let i = 0; i > number; i--) {
          const date = newDate.date()
          if (date < 11) {
            // 前一旬的天数
            const preXunDay = newDate.subtract(1, 'month').daysInMonth() - 20
            const day = date + Math.floor((1 - date / 10) * preXunDay)
            newDate = newDate.subtract(day, 'days')
          } else {
            const currentXunDay = date <= 21 ? 10 : newDate.daysInMonth() - 20
            newDate = newDate.subtract(currentXunDay, 'days')
          }
        }
      }
      return newDate
    }
    return oldAdd.bind(this)(number, units)
  }

  const oldStartOf = proto.startOf
  proto.startOf = function (units, startOf) {
    const isStartOf = startOf !== undefined ? startOf : true
    if (['xun', 'xuns'].includes(units)) {
      const xun = this.xun()
      const startDate = (xun - 1) * 10 + 1
      const endDate = xun === 3 ? this.daysInMonth() : xun * 10
      return isStartOf ? this.date(startDate).startOf('day') : this.date(endDate).endOf('day')
    }
    return oldStartOf.bind(this)(units, startOf)
  }

  const oldFormat = proto.format
  proto.format = function (formatStr) {
    const xun = this.xun()
    const xunStr = { 1: '上', 2: '中', 3: '下' }[xun]
    let res = oldFormat.bind(this)(formatStr)
    return res.replace(/T/g, xunStr)
  }
}

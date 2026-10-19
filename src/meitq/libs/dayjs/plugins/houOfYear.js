/**
 * @type PluginFunc
 */
export default (option, dayjsClass) => {
  const proto = dayjsClass.prototype
  proto.hou = function (hou) {
    if (hou === undefined) {
      const date = this.date()
      return date > 30 ? 6 : Math.ceil(date / 5)
    }
    if (typeof hou !== 'number' || hou < 1 || hou > 6) {
      throw new Error('The hou must be a number from 1 to 6!')
    }
    return this.date((hou - 1) * 5 + 1)
  }

  const oldAdd = proto.add
  proto.add = function (number, units) {
    number = Number(number)
    if (number === 0) return this
    if (['hou', 'hous'].includes(units)) {
      let newDate = this
      if (number > 0) {
        // 逐候递加
        for (let i = 0; i < number; i++) {
          const date = newDate.date()
          if (date > 25) {
            const daysInMonth = newDate.daysInMonth()
            // 当前候的天数
            const currentHouDay = daysInMonth - 25
            // 当前日期是当前候的第几天
            const day = date - 25
            // 当前候已过天数在当前候的占比, 对应5天所表示的日数, 即为下个月的日期
            const nextDate = Math.floor((day / currentHouDay) * 5) || 1
            newDate = newDate.add(1, 'month').date(nextDate)
          } else {
            newDate = newDate.add(5, 'days')
          }
        }
      } else {
        // 逐候递减
        for (let i = 0; i > number; i--) {
          const date = newDate.date()
          if (date < 6) {
            // 前一候的天数
            const prevHouDay = newDate.subtract(1, 'month').daysInMonth() - 25
            const day = date + Math.floor((1 - date / 5) * prevHouDay)
            newDate = newDate.subtract(day, 'days')
          } else {
            newDate = newDate.subtract(5, 'days')
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
    if (['hou', 'hous'].includes(units)) {
      const hou = this.hou()
      const startDate = (hou - 1) * 5 + 1
      const endDate = hou === 6 ? this.daysInMonth() : hou * 5
      return isStartOf ? this.date(startDate).startOf('day') : this.date(endDate).endOf('day')
    }
    return oldStartOf.bind(this)(units, startOf)
  }

  const oldFormat = proto.format
  proto.format = function (formatStr) {
    const hou = this.hou()
    let res = oldFormat.bind(this)(formatStr)
    return res.replace(/(F{1,2})/g, (match, p1) => `${p1.length > 1 ? `${hou}`.padStart(2, '0') : hou}`)
  }
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24

function dateDiffInDays(date1, date2) {
  // Discard the time and time-zone information
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((utc2 - utc1) / _MS_PER_DAY)
}

const formatDateString = (date) => {
  return new Date(date).toLocaleString()
}

module.exports = {
  _MS_PER_DAY,
  dateDiffInDays,
  formatDateString,
}

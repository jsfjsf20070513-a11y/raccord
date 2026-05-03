function padRight(value, width) {
  return `${value}`.padEnd(width, ' ')
}

export function formatCourseSchedule(schedule = []) {
  const normalizedRows = schedule.flatMap((dayEntry) =>
    (dayEntry.slots || []).flatMap((slot, index) => {
      const rows = [
        {
          day: index === 0 ? dayEntry.day || '' : '',
          time: slot.time || '',
          course: slot.course || '',
        },
      ]

      if (slot.note) {
        rows.push({
          day: '',
          time: '',
          course: slot.note,
        })
      }

      return rows
    }),
  )

  const dayWidth = Math.max(3, ...normalizedRows.map((row) => row.day.length))
  const timeWidth = Math.max(12, ...normalizedRows.map((row) => row.time.length))
  const courseWidth = Math.max(6, ...normalizedRows.map((row) => row.course.length))
  const totalWidth = dayWidth + timeWidth + courseWidth + 4
  const rule = '─'.repeat(totalWidth)

  const lines = [
    `${padRight('DAY', dayWidth)}  ${padRight('TIME', timeWidth)}  COURSE`,
    rule,
  ]

  schedule.forEach((dayEntry) => {
    (dayEntry.slots || []).forEach((slot, index) => {
      lines.push(
        `${padRight(index === 0 ? dayEntry.day || '' : '', dayWidth)}  ${padRight(slot.time || '', timeWidth)}  ${slot.course || ''}`,
      )

      if (slot.note) {
        lines.push(
          `${padRight('', dayWidth)}  ${padRight('', timeWidth)}  ${slot.note}`,
        )
      }
    })
    lines.push('')
  })

  if (lines[lines.length - 1] === '') {
    lines.pop()
  }

  lines.push(rule)

  return lines.join('\n')
}

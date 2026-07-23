export function selectSessionQueue(queue = [], mode = 'due') {
  if (mode === 'weak') return queue.filter((item) => !item.isNew).slice(0, 24)
  return [...queue]
}

export function selectNewWordPreview(queue = []) {
  return queue.filter((item) => item.isNew)
}

export function estimateSessionMinutes(queue = []) {
  return Math.max(2, Math.ceil(queue.length * 0.45))
}

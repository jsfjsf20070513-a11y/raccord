export function getSubmissionStateLabel(state) {
  if (state === 'published') return '已发布'
  if (state === 'publish_blocked') return '未入公开栏'
  if (state === 'unpublished') return '已撤下'
  if (state === 'deleted') return '已删除'
  return '待审核'
}

export function getModerationActionLabel(state) {
  if (state === 'published') return '发布'
  if (state === 'unpublished') return '撤下'
  if (state === 'deleted') return '删除'
  return '编务'
}

export function getModerationReceiptLabel(state) {
  return `${getModerationActionLabel(state)}回执`
}

export function getModerationActionSummary(state) {
  if (state === 'published') return '条目已见于公开栏。'
  if (state === 'unpublished') return '条目已撤回案头，可继续修订。'
  if (state === 'deleted') return '原稿已删，只留这条记录。'
  return '条目仍在协作区。'
}

export function buildSubmissionTitle(submission, scopeTitle = '条目') {
  return submission?.payload?.title || `未命名${scopeTitle}`
}

export function buildSubmissionExcerpt(submission) {
  return submission?.payload?.description || '暂无说明'
}

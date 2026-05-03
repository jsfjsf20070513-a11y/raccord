export function getListRoute(kind) {
  if (kind === 'gallery') return '/gallery'
  if (kind === 'resource') return '/resources'
  return '/manage'
}

export function buildPublishedDestinationMap({
  albums = [],
  resources = [],
}) {
  const nextMap = {}

  albums.forEach((item) => {
    if (item.sourceSubmissionId) {
      nextMap[item.sourceSubmissionId] = {
        href: `/album/${item.id}`,
        label: '图版条目',
        exact: true,
        published: true,
      }
    }
  })

  resources.forEach((item) => {
    if (item.sourceSubmissionId) {
      nextMap[item.sourceSubmissionId] = {
        href: `/resources/${encodeURIComponent(item.id)}`,
        label: '资源条目',
        exact: true,
        published: true,
      }
    }
  })

  return nextMap
}

export function getSubmissionDestination(submission, destinationMap) {
  return (
    destinationMap[submission?.id] || {
      href: getListRoute(submission?.kind),
      label: '栏目总页',
      exact: false,
      published: false,
    }
  )
}
